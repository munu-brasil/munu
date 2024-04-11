package httpserver

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"io"
	"net/http"
	"strings"

	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"github.com/markbates/goth"
	"github.com/munu-brasil/munu/backend/service"
	"github.com/pindamonhangaba/apiculi/endpoint"
	"github.com/pkg/errors"
)

// ThirdPartyOauthHandler service to create handler
type ThirdPartyOauthHandler struct {
	oapi                  *endpoint.OpenAPI
	completeUserAuth      func(res http.ResponseWriter, req *http.Request) (goth.User, error)
	beginAuth             func(res http.ResponseWriter, req *http.Request)
	onboardThirdPartyUser func(applID string, form service.OauthLoginForm) (a *service.AuthResponse, err error)
	oauthRedirectURL      string
}

func (handler *ThirdPartyOauthHandler) OauthProviderFlow() (string, string, echo.HandlerFunc) {
	routeHandler := func(in endpoint.EndpointInput[any, struct {
		Provider string `json:"provider"`
	}, struct {
		ApplID string `json:"applID"`
	}, any], c echo.Context) (res endpoint.DataResponse[endpoint.SingleItemData[service.AuthResponse]], err error) {
		req := c.Request()
		resp := c.Response()
		ctx := context.WithValue(req.Context(), "provider", in.Params.Provider)
		req = req.WithContext(ctx)

		if len(in.Query.ApplID) == 0 {
			return res, errors.New("invalid applID: " + in.Query.ApplID)
		}

		state, err := makeOauthState(in.Query.ApplID)
		if err != nil {
			return res, err
		}
		v := req.URL.Query()
		v.Add("state", state)
		req.URL.RawQuery = v.Encode()

		gothUser, err := handler.completeUserAuth(resp, req)
		if err != nil {
			handler.beginAuth(resp, req)
			return res, nil
		}
		form := service.OauthLoginForm{
			OauthProviderData: service.OauthProviderData{User: gothUser},
			LoginInfo: service.LoginInfo{
				IP: service.GetUserIP(*c.Request()),
			},
		}

		u, err := handler.onboardThirdPartyUser(in.Query.ApplID, form)
		if err != nil {
			return res, err
		}

		sess, err := session.Get("session", c)
		if sess == nil {
			return res, errors.Wrap(err, "get session")
		}
		sess.Options = &sessions.Options{
			Path:     "/",
			MaxAge:   MaxAge,
			HttpOnly: true,
			SameSite: http.SameSiteNoneMode,
			Secure:   true,
		}
		sess.Values["userID"] = u.User.UserID.String()
		sess.Save(c.Request(), c.Response())

		res.Data.DataDetail.Kind = "authToken"
		res.Data.Item = *u

		return res, nil
	}
	return endpoint.EchoWithContext(
		endpoint.Get("/api/auth/flow/:provider"),
		handler.oapi.Route("auth.3rdParty", `Login with a providers Oauth flow`),
		func(in endpoint.EndpointInput[any, struct {
			Provider string `json:"provider"`
		}, struct {
			ApplID string `json:"applID"`
		}, any], c echo.Context) (res endpoint.DataResponse[endpoint.SingleItemData[service.AuthResponse]], err error) {
			out, err := routeHandler(in, c)
			if err != nil {
				http.Redirect(c.Response(), c.Request(), handler.oauthRedirectURL+"?oauthError="+err.Error(), http.StatusTemporaryRedirect)
			}
			http.Redirect(c.Response(), c.Request(), handler.oauthRedirectURL+"?token="+out.Data.Item.JWT, http.StatusTemporaryRedirect)
			return out, nil
		},
	)
}

func (handler *ThirdPartyOauthHandler) OauthProviderCallback() (string, string, echo.HandlerFunc) {
	routeHandler := func(in endpoint.EndpointInput[any, struct {
		Provider string `json:"provider"`
	}, struct {
		State string `json:"state"`
	}, any], c echo.Context) (res endpoint.DataResponse[endpoint.SingleItemData[service.AuthResponse]], err error) {
		req := c.Request()
		resp := c.Response()
		ctx := context.WithValue(req.Context(), "provider", in.Params.Provider)
		req = req.WithContext(ctx)

		gothUser, err := handler.completeUserAuth(resp, req)
		if err != nil {
			return res, service.WrapUnauthorizedError(err)
		}
		form := service.OauthLoginForm{
			OauthProviderData: service.OauthProviderData{User: gothUser},
			LoginInfo: service.LoginInfo{
				IP: service.GetUserIP(*c.Request()),
			},
		}

		applID, err := applIDFromOauthState(in.Query.State)
		if err != nil {
			return res, err
		}

		u, err := handler.onboardThirdPartyUser(applID, form)
		if err != nil {
			return res, err
		}

		sess, err := session.Get("session", c)
		if sess == nil {
			return res, errors.Wrap(err, "get session")
		}
		sess.Options = &sessions.Options{
			Path:     "/",
			MaxAge:   MaxAge,
			HttpOnly: true,
			SameSite: http.SameSiteNoneMode,
			Secure:   true,
		}
		sess.Values["userID"] = u.User.UserID.String()
		sess.Save(c.Request(), c.Response())

		res.Data.DataDetail.Kind = "authToken"
		res.Data.Item = *u
		return res, nil
	}

	return endpoint.EchoWithContext(
		endpoint.Get("/api/auth/flow/:provider/callback"),
		handler.oapi.Route("auth.3rdParty", `Login with a providers Oauth flow`),
		func(in endpoint.EndpointInput[any, struct {
			Provider string `json:"provider"`
		}, struct {
			State string `json:"state"`
		}, any], c echo.Context) (res endpoint.DataResponse[endpoint.SingleItemData[service.AuthResponse]], err error) {
			out, err := routeHandler(in, c)
			if err != nil {
				http.Redirect(c.Response(), c.Request(), handler.oauthRedirectURL+"?oauthError="+err.Error(), http.StatusTemporaryRedirect)
			}
			http.Redirect(c.Response(), c.Request(), handler.oauthRedirectURL+"?token="+out.Data.Item.JWT, http.StatusTemporaryRedirect)
			return out, nil
		},
	)
}

func makeOauthState(applID string) (string, error) {
	nonceBytes := make([]byte, 64)
	_, err := io.ReadFull(rand.Reader, nonceBytes)
	return base64.URLEncoding.EncodeToString(append([]byte(applID+"|||"), nonceBytes...)), errors.Wrap(err, "source of randomness unavailable")
}

func applIDFromOauthState(state string) (string, error) {
	b, err := base64.URLEncoding.DecodeString(state)
	if err != nil {
		return "", errors.Wrap(err, "extract applID")
	}
	strs := strings.Split(string(b), "|||")
	if len(strs) == 0 {
		return "", errors.New("applID not found in: " + string(b))
	}
	return strs[0], err
}
