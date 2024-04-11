package lib

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/munu-brasil/munu/backend/service"
	"github.com/pkg/errors"
)

type errorResponse struct {
	Error generalError `json:"error"`
}

type generalError struct {
	Code    int64         `json:"code"`
	Message string        `json:"message"`
	Errors  []detailError `json:"errors,omitempty"`
}

type detailError struct {
	Domain       string  `json:"domain"`
	Reason       string  `json:"reason"`
	Message      string  `json:"message"`
	Location     *string `json:"location,omitempty"`
	LocationType *string `json:"locationType,omitempty"`
	ExtendedHelp *string `json:"extendedHelp,omitempty"`
	SendReport   *string `json:"sendReport,omitempty"`
}

func HTTPErrorHandler(err error, c echo.Context) {

	// since it's an api, it should always be in json
	// won't be using xml anytime soon
	//isJsonRequest := c.Request().Header().Get("Content-Type") == "application/json"
	var e service.StatusError
	var mv service.ModelValidationError
	var logerr *service.ClassifiedError
	var seh service.StatusErrorHelp
	var de service.DomainError
	if errors.As(err, &e) {
		c.JSON(e.Status(), errorResponse{
			Error: generalError{
				Code:    int64(e.Status()),
				Message: e.Error(),
			},
		})
		return
	}
	if errors.As(err, &logerr) {
		c.JSON(http.StatusInternalServerError, errorResponse{
			Error: generalError{
				Code:    1010,
				Message: logerr.Message(),
			},
		})
		return
	}
	if errors.As(err, &mv) {
		errs := []detailError{}
		for _, m := range mv.FieldErrors {
			dtail := detailError{
				Domain:  mv.Domain,
				Reason:  m.Reason,
				Message: m.Message,
			}
			errs = append(errs, dtail)
		}
		c.JSON(http.StatusInternalServerError, errorResponse{
			Error: generalError{
				Code:    1001,
				Message: mv.Error(),
				Errors:  errs,
			},
		})

		return
	}
	if errors.As(err, &seh) {
		errs := []detailError{}
		dtail := detailError{
			ExtendedHelp: seh.ErrorExtendedHelp(),
		}
		errs = append(errs, dtail)
		c.JSON(seh.Status(), errorResponse{
			Error: generalError{
				Code:    int64(seh.Status()),
				Message: seh.Error(),
				Errors:  errs,
			},
		})
		return
	}
	if errors.As(err, &de) {
		c.JSON(http.StatusInternalServerError, errorResponse{
			Error: generalError{
				Code:    1002,
				Message: de.Error(),
				Errors: []detailError{{
					Domain:  de.ErrorDetails.Domain,
					Reason:  de.ErrorDetails.Reason,
					Message: de.ErrorDetails.Message,
				}},
			},
		})
		return
	}
	switch httpE := err.(type) {
	case *echo.HTTPError:
		c.JSON(httpE.Code, errorResponse{
			Error: generalError{
				Code:    int64(httpE.Code),
				Message: httpE.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusInternalServerError, errorResponse{
		Error: generalError{
			Code:    http.StatusInternalServerError,
			Message: err.Error(),
		},
	})
}
