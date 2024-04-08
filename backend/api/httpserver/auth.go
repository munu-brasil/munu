package httpserver

import (
	"github.com/labstack/echo/v4"
	"github.com/pindamonhangaba/apiculi/endpoint"
)

const MaxAge = 7 * 24 * 60 * 60

// AuthHandler service handler authentication
type AuthHandler struct {
	oapi *endpoint.OpenAPI
}

func (handler *AuthHandler) Login() (string, string, echo.HandlerFunc) {
	return endpoint.EchoWithContext(
		endpoint.Post("/api/auth/signin"),
		handler.oapi.Route("auth.Signin", `signin example`),
		func(in endpoint.EndpointInput[any, any, ContextQ, struct{}], c echo.Context) (
			res endpoint.DataResponse[endpoint.SingleItemData[string]], err error) {

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
