package daemon

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"time"

	"github.com/gorilla/sessions"
	"github.com/jmoiron/sqlx"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/google"
	"github.com/munu-brasil/munu/backend/api/httpserver"
	"github.com/munu-brasil/munu/backend/mailmaid"
	"github.com/munu-brasil/munu/backend/postgres"
	"github.com/munu-brasil/munu/backend/service"
	"github.com/pindamonhangaba/commandments"

	"context"

	"github.com/pkg/errors"
	"github.com/spf13/cobra"

	"net/http"

	"go.uber.org/zap"

	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/acme/autocert"
)

type Config struct {
	HTTPSEnable             bool   `flag:"https"`
	ServeAddress            string `flag:"address"`
	PublicAddress           string `flag:"address_public"`
	ServeTLSDomainWhitelist string `flag:"serveTLSDomainWhitelist"`
	DBUser                  string `flag:"db_user"`
	DBPassword              string `flag:"db_password"`
	DBName                  string `flag:"db_name"`
	DBSSLmode               string `flag:"db_sslmode"`
	DBHost                  string `flag:"db_host"`
	DBPort                  string `flag:"db_port"`
	MailUsername            string `flag:"mail_username"`
	MailPassword            string `flag:"mail_password"`
	MailFrom                string `flag:"mail_from"`
	MailTemplatePath        string `flag:"mail_template_path"`
	MailSMTPHost            string `flag:"mail_smtp_host"`
	MailSMTPPort            int    `flag:"mail_smtp_port"`
	JWTSecret               string `flag:"jwt_secret"`
	CORSOrigins             string `flag:"cors_origins"`
	OauthSessionSecret      string `flag:"oauth_session_secret"`
	OauthGoogleKey          string `flag:"oauth_google_key"`
	OauthGoogleSecret       string `flag:"oauth_google_secret"`
	OauthGoogleCallbackURL  string `flag:"oauth_google_callback_url"`
	OauthRedirectURL        string `flag:"oauth_redirect_url"`
	PostbackVerification    string `flag:"postback-verification"`
	FileDirectoryTempImages string `flag:"file-directory-temp-images"`
}

func ServeAll() *cobra.Command {
	cmd := commandments.MustCMD("serve", commandments.WithConfig(
		func(config Config) error {
			fmt.Println(config)
			return ServePublic(config)
		}), commandments.WithDefaultConfig(Config{
		ServeAddress:            "localhost:8089",
		DBSSLmode:               "disable",
		PostbackVerification:    "7854b18a-6248-466e-9f5b-ef9b24e73455",
		MailTemplatePath:        "./templates/email",
		FileDirectoryTempImages: "./templates/images",
	}))
	return cmd
}

func ServePublic(conf Config) error {

	e := echo.New()

	zapLogger, err := zap.NewProduction()
	if err != nil {
		return errors.Wrap(err, "logger init")
	}

	e.Use(ZapLogger(zapLogger))

	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		conf.DBHost, conf.DBPort, conf.DBUser, conf.DBPassword, conf.DBName, conf.DBSSLmode)
	db, err := sqlx.Connect("postgres", psqlInfo)
	if err != nil {
		panic(err)
	}
	defer db.Close()
	db.SetMaxOpenConns(100) // The default is 0 (unlimited)

	p, err := filepath.Abs(conf.MailTemplatePath)
	if err != nil {
		panic(err)
	}

	mmailer := mailmaid.NewMailer(mailmaid.MailerConf{
		User:              conf.MailUsername,
		Password:          conf.MailPassword,
		From:              conf.MailFrom,
		TemplatePath:      p,
		Host:              conf.MailSMTPHost,
		Port:              conf.MailSMTPPort,
		ImagesTemplateURL: conf.FileDirectoryTempImages,
		PublicAddress:     conf.PublicAddress,
	})

	dispatcher := service.NewDispatcher()
	not := postgres.NotificationCenter{
		Config: postgres.NotificationCenterConfig{
			ApplicationBaseURL: conf.PublicAddress,
		},
		DB:         db,
		Logger:     log.Default(),
		Dispatcher: dispatcher,
		Mailer:     mmailer,
	}
	err = not.Start()
	if err != nil {
		panic(err)
	}

	// configure goth oauth
	cookieStore := sessions.NewCookieStore([]byte(conf.OauthSessionSecret))
	cookieStore.Options.HttpOnly = true
	gothic.Store = cookieStore
	goth.UseProviders(
		google.New(conf.OauthGoogleKey, conf.OauthGoogleSecret, conf.OauthGoogleCallbackURL, "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile", "openid"),
	)

	// register api routes
	serv := httpserver.HTTPServer{
		DB: db,
		JWTConfig: httpserver.JWTConfig{
			Secret:       conf.JWTSecret,
			ClaimsCtxKey: "user",
		},
		ServerConf: httpserver.ServerConf{
			BodyLimit:               "150MB",
			Address:                 conf.ServeAddress,
			AppAddress:              conf.PublicAddress,
			VersionString:           "Munu 1.0",
			AllowedOrigins:          strings.Split(conf.CORSOrigins, ","),
			OauthRedirectURL:        conf.OauthRedirectURL,
			PostbackVerification:    conf.PostbackVerification,
			FileDirectoryTempImages: conf.FileDirectoryTempImages,
		},
		Mailer:     mmailer,
		Dispatcher: dispatcher,
	}
	serv.Register(e)

	start := func() error { return e.Start(conf.ServeAddress) }
	if conf.HTTPSEnable {
		e.AutoTLSManager.HostPolicy = autocert.HostWhitelist(conf.ServeTLSDomainWhitelist)
		e.AutoTLSManager.Cache = autocert.DirCache("/var/www/.cache")
		start = func() error { return e.StartAutoTLS(conf.ServeAddress) }
	}

	go func() {
		err := start()
		if err != nil && err != http.ErrServerClosed {
			e.Logger.Fatalf("server shutdown %s", err)
		} else {
			e.Logger.Fatal("shutting down the server")
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	return e.Shutdown(ctx)
}
