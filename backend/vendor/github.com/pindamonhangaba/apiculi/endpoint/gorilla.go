package endpoint

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
	"github.com/pindamonhangaba/apiculi/quick_schema"
	"github.com/pkg/errors"
)

func writeErrJSON(w http.ResponseWriter, statusCode int, err error) {
	e := errorResponse{
		Error: generalError{
			Message: err.Error(),
		},
	}
	b, err := json.Marshal(e)
	if err != nil {
		b = []byte(err.Error())
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	w.Write(b)
}

func writeJSON[T any](w http.ResponseWriter, statusCode int, data T) {
	b, err := json.Marshal(data)
	if err != nil {
		writeErrJSON(w, http.StatusInternalServerError, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	w.Write(b)
}

func Gorilla[C, P, Q, B any, D dataer](p endpointPath, d OpenAPIRouteDescriber, next Endpoint[C, P, Q, B, D]) (string, string, http.HandlerFunc) {

	fillOpenAPIRoute[C, P, Q, B, D](p, d)

	return string(p.verb), p.path, func(w http.ResponseWriter, req *http.Request) {

		if _, ok := Find([]string{http.MethodGet, http.MethodConnect, http.MethodHead, http.MethodTrace, http.MethodOptions}, string(p.verb)); !ok {
			contt := strings.Split(req.Header.Get("Content-Type"), ";")[0]
			switch contt {
			case "application/json", "application/x-www-form-urlencoded", "multipart/form-data":
			default:
				writeErrJSON(w, http.StatusBadRequest, errors.Errorf(`unsupported content-type %s, must be "application/json" or "application/x-www-form-urlencoded"`, contt))
				return
			}
		}

		user := req.Context().Value("user").(*jwt.Token)
		cc, _ := user.Claims.(C)

		vars := mux.Vars(req)
		m := map[string]string{}
		psch := quick_schema.GetSchema[P]()
		if psch != nil {
			for _, p := range psch.Children {
				m[p.Name] = vars[p.Name]
			}
		}
		prs, err := mapToStruct(m, *new(P))
		if err != nil {
			writeErrJSON(w, http.StatusBadRequest, errors.Wrap(err, "params"))
			return
		}

		qMap := map[string]any{}
		for k, v := range req.URL.Query() {
			if len(v) > 1 {
				qMap[k] = v
			} else if len(v) == 1 {
				qMap[k] = v[0]
			}
		}
		q, err := mapToStruct(qMap, *new(Q))
		if err != nil {
			writeErrJSON(w, http.StatusInternalServerError, err)
			return
		}

		b := new(B)
		if has([]httpVerb{PUT, POST, DELETE, PATCH}, p.verb) {
			err := json.NewDecoder(req.Body).Decode(&b)
			if err != nil {
				writeErrJSON(w, http.StatusBadRequest, errors.Wrap(err, "body"))
				return
			}
		}

		input := EndpointInput[C, P, Q, B]{
			Claims: cc,
			Params: prs,
			Query:  q,
			Body:   *b,
		}

		r, err := next(input)
		if err != nil {
			writeErrJSON(w, http.StatusInternalServerError, err)
			return
		}
		writeJSON(w, http.StatusOK, r)
	}
}
