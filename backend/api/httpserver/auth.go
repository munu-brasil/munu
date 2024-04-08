package httpserver

import (
	"net/http"
	"strings"

	"github.com/gofrs/uuid"
	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"github.com/munu-brasil/munu/backend/postgres"
	"github.com/munu-brasil/munu/backend/service"
	"github.com/pindamonhangaba/apiculi/endpoint"
	"github.com/pkg/errors"
)

const MaxAge = 7 * 24 * 60 * 60

// AuthHandler service handler authentication
type AuthHandler struct {
	oapi                  *endpoint.OpenAPI
	signin                func(*postgres.LoginForm) (*service.AuthResponse, error)
	oneTimeLogin          func(token string) (*service.AuthResponse, error)
	pwdReset              func(resetID, verification, password string) error
	getActionVerification func(resetID, token string) (*service.GetActionVerification, error)
	pwdRecover            func(email, applID string, resetURL, sendEmailModel *string) (*service.ActionVerification, error)
	emailTokenAuth        func(postgres.EmailTokenAuthRequest) (*service.ActionVerification, error)
	emailTokenSignin      func(*postgres.TokenLoginForm) (*service.AuthResponse, error)
	refreshToken          func(uuid.UUID) (*service.AuthResponse, error)
	validateEmail         func(veb service.ValidateEmail) (*service.EmailValidateStatus, error)
}

func (handler *AuthHandler) RefreshJWT() (string, string, echo.HandlerFunc) {
	return endpoint.EchoWithContext(
		endpoint.Get("/api/auth/refresh"),
		handler.oapi.Route("auth.refresh", `Generate new short-lived JWT for current session user`),
		func(in endpoint.EndpointInput[any, any, ContextQ, any], c echo.Context) (
			res endpoint.DataResponse[endpoint.SingleItemData[service.AuthResponse]], err error) {

			sess, err := session.Get("session", c)
			if err != nil {
				return res, service.WrapClassified(err, "session")
			}
			userID, ok := sess.Values["userID"].(string)
			if !ok {
				return res, service.NewForbiddenError()
			}
			userUUID, err := uuid.FromString(userID)
			if err != nil {
				return res, service.NewForbiddenError()
			}

			u, err := handler.refreshToken(userUUID)
			if err != nil {
				return res, errors.Wrap(err, "refresh")
			}

			res.Context = in.Query.Context
			res.Data.DataDetail.Kind = "authToken"
			res.Data.Item = *u
			return res, nil
		},
	)
}

func (handler *AuthHandler) EmailLogin() (string, string, echo.HandlerFunc) {
	return endpoint.EchoWithContext(
		endpoint.Post("/api/auth/signin"),
		handler.oapi.Route("auth.login", `Login with email & password`),
		func(in endpoint.EndpointInput[any, any, ContextQ, postgres.LoginForm], c echo.Context) (
			res endpoint.DataResponse[endpoint.SingleItemData[service.AuthResponse]], err error) {
			in.Body.Email = strings.TrimSpace(in.Body.Email)
			in.Body.IP = service.GetUserIP(*c.Request())

			u, err := handler.signin(&in.Body)
			if err != nil {
				return res, err
			}

			sess, err := session.Get("session", c)
			if sess == nil {
				return res, errors.Wrap(err, "get session")
			}
			sess.Options = &sessions.Options{
				Path:     "/",
				MaxAge:   0,
				HttpOnly: true,
				SameSite: http.SameSiteNoneMode,
				Secure:   true,
			}
			if in.Body.RememberMe {
				sess.Options.MaxAge = MaxAge
			}
			sess.Values["userID"] = u.User.UserID.String()
			sess.Save(c.Request(), c.Response())

			res.Context = in.Query.Context
			res.Data.DataDetail.Kind = "authToken"
			res.Data.Item = *u
			return res, nil
		},
	)
}

func (handler *AuthHandler) PasswordRecover() (string, string, echo.HandlerFunc) {
	return endpoint.Echo(
		endpoint.Post("/api/auth/password-recover"),
		handler.oapi.Route("auth.PasswordRecover", `Start password recovery for account with given email`),
		func(in endpoint.EndpointInput[any, any, ContextQ, passwordVerifyForm]) (res endpoint.DataResponse[endpoint.SingleItemData[service.ActionVerification]], err error) {
			in.Body.Email = strings.TrimSpace(in.Body.Email)

			u, err := handler.pwdRecover(in.Body.Email, in.Body.ApplID, in.Body.ResetURL, in.Body.AccessModel)
			if err != nil {
				return res, errors.Wrap(err, "recover password")
			}

			res.Context = in.Query.Context
			res.Data = endpoint.SingleItemData[service.ActionVerification]{
				DataDetail: endpoint.DataDetail{
					Kind: "Verification",
				},
				Item: *u,
			}
			return res, nil
		},
	)
}

func (handler *AuthHandler) PasswordReset() (string, string, echo.HandlerFunc) {
	return endpoint.Echo(
		endpoint.Post("/api/auth/password-reset/:resetID"),
		handler.oapi.Route("auth.PasswordReset", `Reset password for account with given email`),
		func(in endpoint.EndpointInput[any, struct {
			ResetID string `json:"resetID"`
		}, ContextQ, passwordResetForm]) (res endpoint.DataResponse[endpoint.SingleItemData[any]], err error) {

			err = handler.pwdReset(in.Params.ResetID, in.Body.Verification, in.Body.Password)
			if err != nil {
				return res, errors.Wrap(err, "reset password")
			}

			res.Context = in.Query.Context
			res.Data = endpoint.SingleItemData[any]{
				DataDetail: endpoint.DataDetail{
					Kind: "empty",
				},
			}
			return res, nil
		},
	)
}

func (handler *AuthHandler) GetActionVerification() (string, string, echo.HandlerFunc) {
	return endpoint.Echo(
		endpoint.Post("/api/auth/password-reset/:resetID/validate"),
		handler.oapi.Route("auth.PasswordResetValidate", `Verify that password reset is still valid`),
		func(in endpoint.EndpointInput[any, struct {
			ResetID string `json:"resetID"`
		}, ContextQ, passwordResetForm]) (res endpoint.DataResponse[endpoint.SingleItemData[service.GetActionVerification]], err error) {

			act, err := handler.getActionVerification(in.Params.ResetID, in.Body.Verification)
			if err != nil {
				return res, err
			}

			res.Context = in.Query.Context
			res.Data = endpoint.SingleItemData[service.GetActionVerification]{
				DataDetail: endpoint.DataDetail{
					Kind: "empty",
				},
				Item: *act,
			}
			return res, nil
		},
	)
}

func (handler *AuthHandler) OneTimeLogin() (string, string, echo.HandlerFunc) {
	return endpoint.EchoWithContext(
		endpoint.Post("/api/auth/one-time-login"),
		handler.oapi.Route("auth.OneTimeLogin", `Authenticate with single use token`),
		func(in endpoint.EndpointInput[any, any, ContextQ, oneTimeLoginForm], c echo.Context) (
			res endpoint.DataResponse[endpoint.SingleItemData[service.AuthResponse]], err error) {

			u, err := handler.oneTimeLogin(in.Body.Token)
			if err != nil {
				return res, err
			}

			sess, err := session.Get("session", c)
			if sess == nil {
				return res, errors.Wrap(err, "get session")
			}
			sess.Options = &sessions.Options{
				Path:     "/",
				MaxAge:   0,
				HttpOnly: true,
				SameSite: http.SameSiteNoneMode,
				Secure:   true,
			}
			sess.Values["userID"] = u.User.UserID.String()
			sess.Save(c.Request(), c.Response())

			res.Context = in.Query.Context
			res.Data.DataDetail.Kind = "authToken"
			res.Data.Item = *u

			return res, nil
		},
	)
}

func (handler *AuthHandler) EmailTokenAuth() (string, string, echo.HandlerFunc) {
	return endpoint.Echo(
		endpoint.Post("/api/auth/token-auth"),
		handler.oapi.Route("auth.EmailTokenAuth", `Start authentication with token for given email`),
		func(in endpoint.EndpointInput[any, any, ContextQ, emailTokenAuthForm]) (
			res endpoint.DataResponse[endpoint.SingleItemData[service.ActionVerification]], err error) {

			f := postgres.EmailTokenAuthRequest{
				Email:  in.Body.Email,
				ApplID: in.Body.ApplID,
			}
			ac, err := handler.emailTokenAuth(f)
			if err != nil {
				return res, errors.Wrap(err, "token auth")
			}

			res.Context = in.Query.Context
			res.Data = endpoint.SingleItemData[service.ActionVerification]{
				DataDetail: endpoint.DataDetail{
					Kind: "TokenAuth",
				},
				Item: *ac,
			}
			return res, nil
		},
	)
}

func (handler *AuthHandler) EmailTokenSignin() (string, string, echo.HandlerFunc) {
	return endpoint.EchoWithContext(
		endpoint.Post("/api/auth/token-signin"),
		handler.oapi.Route("auth.EmailTokenSignin", `Authentication with token for given email`),
		func(in endpoint.EndpointInput[any, any, ContextQ, postgres.TokenLoginForm], c echo.Context) (
			res endpoint.DataResponse[endpoint.SingleItemData[service.AuthResponse]], err error) {

			r, err := handler.emailTokenSignin(&in.Body)
			if err != nil {
				return res, errors.Wrap(err, "token auth")
			}

			res.Context = in.Query.Context
			res.Data.DataDetail.Kind = "authToken"
			res.Data.Item = *r
			return res, nil
		},
	)
}

func (handler *AuthHandler) Logout() (string, string, echo.HandlerFunc) {
	return endpoint.EchoWithContext(
		endpoint.Post("/api/auth/signout"),
		handler.oapi.Route("auth.Signout", `Signout and forget session and refresh tokens`),
		func(in endpoint.EndpointInput[any, any, ContextQ, struct{}], c echo.Context) (
			res endpoint.DataResponse[endpoint.SingleItemData[string]], err error) {

			sess, err := session.Get("session", c)
			if err != nil {
				return res, errors.Wrap(err, "session")
			}
			sess.Options.MaxAge = -1
			sess.Save(c.Request(), c.Response())

			res.Context = in.Query.Context
			res.Data = endpoint.SingleItemData[string]{
				DataDetail: endpoint.DataDetail{
					Kind: "Signedout",
				},
				Item: "ok",
			}
			return res, nil
		},
	)
}

func (handler *AuthHandler) ValidateEmail() (string, string, echo.HandlerFunc) {
	return endpoint.Echo(
		endpoint.Post("/api/auth/validate-email"),
		handler.oapi.Route("auth.ValidateEmail", `checks if the email is valid for appl_id`),
		func(in endpoint.EndpointInput[any, any, ContextQ, service.ValidateEmail]) (
			res endpoint.DataResponse[endpoint.SingleItemData[service.EmailValidateStatus]], err error) {

			item, err := handler.validateEmail(in.Body)
			if err != nil {
				return res, errors.Wrap(err, "validate email")
			}

			res.Context = in.Query.Context
			res.Data.DataDetail.Kind = "validateEmail"
			res.Data.Item = *item
			return res, nil
		},
	)
}

type emailTokenAuthForm struct {
	Email  string `json:"email" binding:"required" example:"user@example.com"`
	ApplID string `json:"applID" binding:"required" exemple:"doctor"`
}

type passwordVerifyForm struct {
	Email       string  `json:"email" binding:"required" example:"user@example.com"`
	ApplID      string  `json:"applID" binding:"required" exemple:"doctor"`
	AccessModel *string `json:"AccessModel"`
	ResetURL    *string `json:"resetURL"`
}

type passwordResetForm struct {
	Verification string `json:"verification" binding:"required" example:"$2y$12$F/npgjvknmHkNvDck15aeew..."`
	Password     string `json:"password" binding:"required" example:"password"`
}

type oneTimeLoginForm struct {
	Token string `json:"token" binding:"required"`
}
