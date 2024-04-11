package docs

import (
	"os"

	"github.com/munu-brasil/munu/backend/api/httpserver"
	"github.com/pindamonhangaba/commandments"

	"github.com/spf13/cobra"

	"github.com/labstack/echo/v4"
)

type Config struct {
	GenerateAllFile bool   `flag:"generate_all_file"`
	GenerateApiFile bool   `flag:"generate_api_file"`
	OutputFileApi   string `flag:"output_file_api"`
}

func GenerateOpenAPI3() *cobra.Command {
	cmd := commandments.MustCMD("openapi", commandments.WithConfig(
		func(config Config) error {
			return genererateOpenAPISpec(config)
		}), commandments.WithDefaultConfig(Config{
		GenerateAllFile: false,
		GenerateApiFile: false,
		OutputFileApi:   "./munu.json",
	}))
	return cmd
}

func genererateOpenAPISpec(conf Config) error {
	e := echo.New()

	// register api routes
	if conf.GenerateAllFile || conf.GenerateApiFile {
		servAPI := (&httpserver.HTTPServer{
			JWTConfig: httpserver.JWTConfig{
				Secret:       "secret",
				ClaimsCtxKey: "user",
			},
			ServerConf: httpserver.ServerConf{
				BodyLimit:     "50MB",
				Address:       "",
				AppAddress:    "",
				VersionString: "Munu 1.0",
			},
		}).Stub()
		oapi, err := servAPI.Register(e)
		if err != nil {
			return (err)
		}
		swagapijson, err := oapi.T().MarshalJSON()
		if err != nil {
			return err
		}
		err = os.WriteFile(conf.OutputFileApi, swagapijson, 0644)
		if err != nil {
			return err
		}
	}

	return nil
}
