package endpoint

import (
	"net/http"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/pkg/errors"
)

func Fiber[C, P, Q, B any, D dataer](p endpointPath, d OpenAPIRouteDescriber, next Endpoint[C, P, Q, B, D]) (string, string, fiber.Handler) {

	fillOpenAPIRoute[C, P, Q, B, D](endpointPath{
		verb: p.verb,
		path: routerPathToOpenAPIPath(p.path),
	}, d)

	return string(p.verb), p.path, func(c *fiber.Ctx) error {

		if _, ok := Find([]string{http.MethodGet, http.MethodConnect, http.MethodHead, http.MethodTrace, http.MethodOptions}, string(p.verb)); !ok {
			contt := strings.Split(string(c.Request().Header.ContentType()), ";")[0]
			switch contt {
			case "application/json", "application/x-www-form-urlencoded", "multipart/form-data":
			default:
				return errors.Errorf(`unsupported content-type %s, must be "application/json" or "application/x-www-form-urlencoded" `, contt)
			}
		}

		var cc C
		user, ok := c.Locals("user").(*jwt.Token)
		if ok {
			claims, ok1 := user.Claims.(jwt.MapClaims)
			if ok1 {
				var err error
				cc, err = mapToStruct(claims, *new(C))
				if err != nil {
					return errors.Wrap(err, "raw claims")
				}
			}
		}

		m := map[string]string{}
		for _, p := range c.Route().Params {
			m[p] = c.Params(p)
		}
		p, err := mapToStruct(m, *new(P))
		if err != nil {
			return errors.Wrap(err, "claims")
		}

		q := new(Q)
		err = c.QueryParser(q)
		if err != nil {
			return errors.Wrap(err, "query")
		}

		b := new(B)
		if len(c.Body()) > 0 {
			err = c.BodyParser(b)
			if err != nil {
				return errors.Wrap(err, "body")
			}
		}

		input := EndpointInput[C, P, Q, B]{
			Claims: cc,
			Params: p,
			Query:  *q,
			Body:   *b,
		}

		r, err := next(input)
		if err != nil {
			return err
		}
		return c.JSON(r)
	}
}
