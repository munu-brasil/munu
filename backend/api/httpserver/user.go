package httpserver

import (
	"github.com/gofrs/uuid"
	"github.com/labstack/echo/v4"
	"github.com/munu-brasil/munu/backend/service"
	"github.com/pindamonhangaba/apiculi/endpoint"
	"github.com/pkg/errors"
)

// UserHandler service handler
type UserHandler struct {
	oapi          *endpoint.OpenAPI
	getUserByID   func(asUserID, userID uuid.UUID) (*service.User, error)
	getUserMe     func(asUserID, userID uuid.UUID) (*service.UserMe, error)
	patchUserByID func(asUserID, userID uuid.UUID, form service.UserUpdateForm) (*service.UserMe, error)
}

func (handler *UserHandler) GetUserByID() (string, string, echo.HandlerFunc) {
	return endpoint.Echo(
		endpoint.Get("/api/users/:userID"),
		handler.oapi.Route("users.GetUserByID", `Return the authenticated user's data`),
		func(in endpoint.EndpointInput[*service.Claims, struct {
			UserID uuid.UUID `json:"userID"`
		}, ContextQ, any]) (res endpoint.DataResponse[endpoint.SingleItemData[service.User]], err error) {

			ac, err := handler.getUserByID(uuid.FromStringOrNil(in.Claims.UserID), in.Params.UserID)
			if err != nil {
				return res, errors.Wrap(err, "user")
			}

			res.Context = in.Query.Context
			res.Data = endpoint.SingleItemData[service.User]{
				DataDetail: endpoint.DataDetail{
					Kind: "User",
				},
				Item: *ac,
			}
			return res, nil
		},
	)
}

func (handler *UserHandler) PatchUserByID() (string, string, echo.HandlerFunc) {
	return endpoint.Echo(
		endpoint.Patch("/api/users/:userID"),
		handler.oapi.Route("users.PatchUserByID", `Update user's data`),
		func(in endpoint.EndpointInput[*service.Claims, struct {
			UserID uuid.UUID `json:"userID"`
		}, ContextQ, service.UserUpdateForm]) (res endpoint.DataResponse[endpoint.SingleItemData[service.UserMe]], err error) {

			asUserID := uuid.FromStringOrNil(in.Claims.UserID)

			ac, err := handler.patchUserByID(asUserID, in.Params.UserID, in.Body)
			if err != nil {
				return res, errors.Wrap(err, "user")
			}

			res.Context = in.Query.Context
			res.Data = endpoint.SingleItemData[service.UserMe]{
				DataDetail: endpoint.DataDetail{
					Kind: "PatchUser",
				},
				Item: *ac,
			}
			return res, nil
		},
	)
}

func (handler *UserHandler) GetUserMe() (string, string, echo.HandlerFunc) {
	return endpoint.Echo(
		endpoint.Get("/api/users/profile/:userID"),
		handler.oapi.Route("users.GetProfileMe", `Get user profile`),
		func(in endpoint.EndpointInput[*service.Claims, struct {
			UserID uuid.UUID `json:"userID"`
		}, ContextQ, service.UserUpdateForm]) (res endpoint.DataResponse[endpoint.SingleItemData[service.UserMe]], err error) {

			asUserID := uuid.FromStringOrNil(in.Claims.UserID)

			ac, err := handler.getUserMe(asUserID, in.Params.UserID)
			if err != nil {
				return res, errors.Wrap(err, "user")
			}

			res.Context = in.Query.Context
			res.Data = endpoint.SingleItemData[service.UserMe]{
				DataDetail: endpoint.DataDetail{
					Kind: "GetUserMe",
				},
				Item: *ac,
			}
			return res, nil
		},
	)
}
