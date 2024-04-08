package endpoint

import "github.com/getkin/kin-openapi/openapi3"

type SchemaRepo struct {
	Start *openapi3.Schema
	Repo  map[string]*openapi3.Schema
}
