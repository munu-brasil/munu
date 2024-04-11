package httpserver

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	jwt "github.com/golang-jwt/jwt/v5"
	"github.com/jmoiron/sqlx"
	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"
	"github.com/markbates/goth/gothic"
	"github.com/munu-brasil/munu/backend/api/httpserver/middleware"
	"github.com/munu-brasil/munu/backend/lib"
	"github.com/munu-brasil/munu/backend/mailmaid"
	"github.com/munu-brasil/munu/backend/postgres"
	"github.com/munu-brasil/munu/backend/service"
	"github.com/pindamonhangaba/apiculi/endpoint"
	"github.com/pkg/errors"

	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	mw "github.com/labstack/echo/v4/middleware"
)

// Based on Google JSONC styleguide
// https://google.github.io/styleguide/jsoncstyleguide.xml

type ContextQ struct {
	Context string `json:"context,omitempty"`
}

// JWTConfig holds configuration for JWT context
type JWTConfig struct {
	Secret,
	ClaimsCtxKey string
}

// ServerConf holds configuration data for the webserver
type ServerConf struct {
	BodyLimit               string
	Address                 string
	AppAddress              string
	VersionString           string
	AllowedOrigins          []string
	PostbackVerification    string
	FileDirectoryTempImages string
	OauthRedirectURL        string
}

// HTTPServer create a service to echo server
type HTTPServer struct {
	stub       bool
	DB         *sqlx.DB
	JWTConfig  JWTConfig
	ServerConf ServerConf
	Mailer     *mailmaid.Mailer
	Dispatcher *service.Dispatcher
}

func (h *HTTPServer) Stub() HTTPServer {
	stub := *h
	stub.stub = true
	return stub
}

func (h *HTTPServer) validateDeps() error {
	if h.DB == nil || h.Mailer == nil {
		return errors.New("missing dependency")
	}
	return nil
}

// Run create a new echo server
func (h *HTTPServer) Register(e *echo.Echo) (*endpoint.OpenAPI, error) {
	err := h.validateDeps()
	if !h.stub && err != nil {
		return nil, err
	}

	// Echo instance
	e.Use(mw.Recover())
	e.Use(mw.Logger())
	e.Use(mw.BodyLimit("50M"))
	e.HTTPErrorHandler = lib.HTTPErrorHandler

	e.Use(mw.CORSWithConfig(mw.CORSConfig{
		AllowOrigins:     h.ServerConf.AllowedOrigins,
		AllowMethods:     []string{echo.GET, echo.PUT, echo.PATCH, echo.POST, echo.DELETE},
		AllowCredentials: true,
	}))
	ratedBase := e.Group("")
	ratedBase.Use(middleware.RateLimitWithConfig(middleware.RateLimitConfig{
		Limit: 10,
		Burst: 20,
	}))

	gJWT := e.Group("")
	jwtConfig := echojwt.Config{
		NewClaimsFunc: func(c echo.Context) jwt.Claims {
			return new(service.Claims)
		},
		SigningKey:    []byte(h.JWTConfig.Secret),
		ContextKey:    h.JWTConfig.ClaimsCtxKey,
		SigningMethod: jwt.SigningMethodHS256.Name,
	}
	jwtServiceConfig := postgres.JWTConfig{
		Secret:          h.JWTConfig.Secret,
		HoursTillExpire: time.Minute * 5,
		SigningMethod:   jwt.SigningMethodHS256,
	}

	gJWT.Use(echojwt.WithConfig(jwtConfig))
	ratedAPI := gJWT.Group("")
	ratedAPI.Use(middleware.RateLimitWithConfig(middleware.RateLimitConfig{
		Limit: 10,
		Burst: 20,
	}))
	ratedAPI.Use(echojwt.WithConfig(jwtConfig))

	gONB := e.Group("")
	jwtConfigOnb := echojwt.Config{
		NewClaimsFunc: func(c echo.Context) jwt.Claims {
			return new(service.Claims)
		},
		SigningKey: []byte(h.JWTConfig.Secret),
		ContextKey: h.JWTConfig.ClaimsCtxKey,
		Skipper: func(c echo.Context) bool {
			auth := c.Request().Header.Get("Authorization")
			return len(auth) <= 0
		},
		SigningMethod: jwt.SigningMethodHS256.Name,
	}
	gONB.Use(echojwt.WithConfig(jwtConfigOnb))

	oapi := endpoint.NewOpenAPI("Munu API", "v1")
	oapi.AddServer(e.Server.Addr, "current server")

	gauth := e.Group("")
	gauth.Use(middleware.RateLimitWithConfig(middleware.RateLimitConfig{
		Limit: 2,
		Burst: 2,
	}))
	gauth.Use(session.Middleware(sessions.NewCookieStore([]byte(h.JWTConfig.Secret))))

	/*
	 * public routes
	 */

	// pagarme services

	pv := postgres.PwdRecoverer{
		DB:     h.DB,
		Mailer: h.Mailer,
		Config: struct{ AuthURL func(applID string) string }{
			AuthURL: func(applID string) string {
				baseURL := ""
				switch applID {
				case service.ApplicationMunu:
					baseURL = h.ServerConf.AppAddress
				}
				return baseURL + "/auth/password-reset"
			},
		},
	}

	pr := postgres.PwdReseter{
		DB:     h.DB,
		Mailer: h.Mailer,
	}
	gpr := postgres.GetActionVerification{DB: h.DB}
	eta := postgres.EmailTokenAuth{
		DB:     h.DB,
		Mailer: h.Mailer,
	}

	ett := postgres.EmailTokenAuthenticator{
		DB:        h.DB,
		Mailer:    h.Mailer,
		JWTConfig: jwtServiceConfig,
	}

	a := &postgres.Authenticator{
		DB:        h.DB,
		Logger:    log.New(os.Stdout, "Auth: ", log.LstdFlags),
		JWTConfig: jwtServiceConfig,
		Mailer:    h.Mailer,
	}

	ve := &postgres.ValidateEmailService{DB: h.DB}

	ah := &AuthHandler{
		oapi:                  &oapi,
		signin:                a.EmailLogin,
		refreshToken:          a.RefreshToken,
		oneTimeLogin:          a.OneTimeLogin,
		emailTokenSignin:      ett.Run,
		getActionVerification: gpr.Run,
		emailTokenAuth:        eta.Run,
		pwdReset:              pr.Run,
		pwdRecover:            pv.Run,
		validateEmail:         ve.Run,
	}
	gauth.Add(ah.EmailLogin())
	gauth.Add(ah.PasswordRecover())
	gauth.Add(ah.PasswordReset())
	gauth.Add(ah.GetActionVerification())
	gauth.Add(ah.OneTimeLogin())
	gauth.Add(ah.EmailTokenAuth())
	gauth.Add(ah.EmailTokenSignin())
	gauth.Add(ah.RefreshJWT())
	gauth.Add(ah.Logout())
	e.Add(ah.ValidateEmail())

	trdp := postgres.ThirdPartyOnboarder{
		DB:         h.DB,
		JWTConfig:  jwtServiceConfig,
		Logger:     log.New(os.Stdout, "3rd Party Oauth: ", log.LstdFlags),
		Mailer:     h.Mailer,
		Dispatcher: h.Dispatcher,
	}

	tpoa := ThirdPartyOauthHandler{
		oapi:                  &oapi,
		completeUserAuth:      gothic.CompleteUserAuth,
		beginAuth:             gothic.BeginAuthHandler,
		onboardThirdPartyUser: trdp.Run,
		oauthRedirectURL:      h.ServerConf.OauthRedirectURL,
	}

	gauth.Add(tpoa.OauthProviderFlow())
	gauth.Add(tpoa.OauthProviderCallback())

	oc := &postgres.OnboardingCreator{
		DB:         h.DB,
		Dispatcher: h.Dispatcher,
	}
	oh := &OnboardingHandler{
		oapi:                   &oapi,
		createUser:             oc.Run,
		authenticateEmailLogin: a.EmailLogin,
	}
	gauth.Add(oh.CreateAccount())

	ugs := postgres.UserGetter{DB: h.DB}
	ups := postgres.UserPatch{DB: h.DB}
	umgs := postgres.UserMeGetter{DB: h.DB}
	uh := UserHandler{
		oapi:          &oapi,
		getUserByID:   ugs.Run,
		patchUserByID: ups.Run,
		getUserMe:     umgs.Run,
	}

	ratedAPI.Add(uh.GetUserByID())
	ratedAPI.Add(uh.PatchUserByID())
	ratedAPI.Add(uh.GetUserMe())

	swagapijson, err := oapi.T().MarshalJSON()
	if err != nil {
		panic(err)
	}

	e.GET("/templates/images/:file", func(c echo.Context) error {
		file := c.Param("file")
		location := h.ServerConf.FileDirectoryTempImages + "/" + file
		return c.File(location)
	})
	e.GET("/docs/swagger.json", func(c echo.Context) error {
		return c.JSON(http.StatusOK, json.RawMessage(swagapijson))
	})
	e.GET("/docs", func(c echo.Context) error {
		return c.HTML(http.StatusOK, `
			<!DOCTYPE html>
			<html>
			<head>
				<title>Redoc</title>
				<!-- needed for adaptive design -->
				<meta charset="utf-8"/>
				<meta name="viewport" content="width=device-width, initial-scale=1">
				<link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
				<!--
				Redoc doesn't change outer page styles
				-->
				<style>
				body {
					margin: 0;
					padding: 0;
				}
				</style>
			</head>
			<body>
				<redoc spec-url='/docs/swagger.json'></redoc>

				<script src="https://cdn.jsdelivr.net/npm/redoc@latest/bundles/redoc.standalone.js"> </script>
			</body>
			</html>
		`)
	})
	return &oapi, nil
}
