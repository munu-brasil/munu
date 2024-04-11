package httpserver

import (
	"net/http"
	"strings"

	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"github.com/munu-brasil/munu/backend/postgres"
	"github.com/munu-brasil/munu/backend/service"
	"github.com/pindamonhangaba/apiculi/endpoint"
	"github.com/pkg/errors"
)

// OnboardingHandler service to create handler
type OnboardingHandler struct {
	oapi                   *endpoint.OpenAPI
	createUser             func(postgres.UserOnboardingForm) (*postgres.UserAuthentication, error)
	authenticateEmailLogin func(*postgres.LoginForm) (a *service.AuthResponse, err error)
}

func (handler *OnboardingHandler) CreateAccount() (string, string, echo.HandlerFunc) {
	return endpoint.EchoWithContext(
		endpoint.Post("/api/onboarding/create-account"),
		handler.oapi.Route("auth.CreateAccount", `Create a new account`),
		func(in endpoint.EndpointInput[any, any, ContextQ, onboardingForm], c echo.Context) (
			res endpoint.DataResponse[endpoint.SingleItemData[service.AuthResponse]], err error) {

			in.Body.Email = strings.TrimSpace(in.Body.Email)
			_, err = handler.createUser(in.Body.UserOnboardingForm)
			if err != nil {
				return res, errors.Wrap(err, "create user")
			}

			formAuthenticate := postgres.LoginForm{
				Email:     in.Body.Email,
				Password:  in.Body.Password,
				ApplID:    in.Body.UserOnboardingForm.ApplID,
				LoginInfo: in.Body.LoginInfo,
			}

			a, err := handler.authenticateEmailLogin(&formAuthenticate)
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
			sess.Values["userID"] = a.User.UserID.String()
			sess.Save(c.Request(), c.Response())

			res.Context = in.Query.Context
			res.Data.DataDetail.Kind = "authToken"
			res.Data.Item = *a
			return res, nil
		},
	)
}

type onboardingForm struct {
	postgres.UserOnboardingForm
	service.LoginInfo
}
