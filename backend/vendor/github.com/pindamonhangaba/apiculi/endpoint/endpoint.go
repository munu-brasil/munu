package endpoint

import (
	"encoding/json"
	"regexp"
	"strconv"
	"strings"
	"unicode"

	"github.com/pindamonhangaba/apiculi/quick_schema"

	"github.com/getkin/kin-openapi/openapi3"

	"github.com/pkg/errors"
)

// Based on Google JSONC styleguide
// https://google.github.io/styleguide/jsoncstyleguide.xml

type Schemaer interface {
	Schema() SchemaRepo
}

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

type DataResponse[T dataer] struct {
	// Client sets this value and server echos data in the response
	Context string `json:"context,omitempty"`
	Data    T      `json:"data"`
}

type dataer interface {
	data()
}

type DataDetail struct {
	// The kind property serves as a guide to what type of information this particular object stores
	Kind string `json:"kind" example:"resource"`
	// Indicates the language of the rest of the properties in this object (BCP 47)
	Language string `json:"lang,omitempty" example:"pt-br"`
}
type CollectionDetail struct {
	// The number of items in this result set
	CurrentItemCount int64 `json:"currentItemCount" example:"1"`
	// The number of items in the result
	ItemsPerPage int64 `json:"itemsPerPage" example:"10"`
	// The index of the first item in data.items
	StartIndex int64 `json:"startIndex" example:"1"`
	// The total number of items available in this set
	TotalItems int64 `json:"totalItems" example:"100"`
	// The index of the current page of items
	PageIndex int64 `json:"pageIndex" example:"1"`
	// The total number of pages in the result set.
	TotalPages int64 `json:"totalPages" example:"10"`
}

func (d DataDetail) data() {}

type SingleItemData[T any] struct {
	DataDetail
	Item T `json:"item"`
}

func (d SingleItemData[T]) data() {}

/* example Schemaer
func (d SingleItemData[T]) Schema() SchemaRepo {
	s := quick_schema.GetSchema[SingleItemData[T]]()
	r := buildSchemaRepo(*s)
	// don't do anything if "item" type is something like "any"
	if r.Start.Properties["item"] != nil {
		itemSchema := r.Repo[r.Start.Properties["item"].Value.Title]

		resp := new(T)
		if c, ok := interface{}(resp).(Schemaer); ok {
			s := c.Schema()
			for k, v := range s.Repo {
				if _, ok := r.Repo[k]; !ok {
					r.Repo[k] = v
				}
			}
			itemSchema = s.Start
		}

		r.Start.Properties["item"] = openapi3.NewSchemaRef(
			"",
			openapi3.NewAllOfSchema(openapi3.NewObjectSchema(), itemSchema),
		)
	}

	return SchemaRepo{
		Repo:  r.Repo,
		Start: r.Start,
	}
}
*/

type CollectionItemData[T any] struct {
	DataDetail
	Items []T `json:"items"`
	CollectionDetail
}

func (d CollectionItemData[T]) data() {}

type EndpointInput[C, P, Q, B any] struct {
	Claims C
	Params P
	Query  Q
	Body   B
}

func mapToStruct[K any, M ~map[string]K, S any](in M, out S) (S, error) {
	params, err := json.Marshal(in)
	if err != nil {
		return out, err
	}

	err = json.Unmarshal((params), &out)
	if err != nil {
		return out, err
	}
	return out, err
}

var nonWordRgx = regexp.MustCompile(`\W`)
var underlinesRgx = regexp.MustCompile(`_`)

var unnamedCount = 0

func makeNameFromRoute(s string) string {
	r := strings.Split(s, "/")

	for i := range r {
		idx := len(r) - 1 - i
		if strings.Count(r[idx], ":") == 0 {
			return underlinesRgx.ReplaceAllString(nonWordRgx.ReplaceAllString(r[idx], "_"), "_")
		}
	}
	sufx := strconv.Itoa(unnamedCount)
	if unnamedCount == 0 {
		sufx = ""
	}
	return "unnamed" + sufx
}

type Endpoint[C, P, Q, B any, D dataer] func(EndpointInput[C, P, Q, B]) (DataResponse[D], error)
type EndpointWithContext[C, P, Q, B any, D dataer, Context any] func(EndpointInput[C, P, Q, B], Context) (DataResponse[D], error)

type RouteDescription struct {
	Title       string
	Description string
	Tag         string
}

type OpenAPIRouteDescriber func(func(RouteDescription, *openapi3.T))

type OpenAPI struct {
	t openapi3.T
}

func (op *OpenAPI) Route(title, description string) OpenAPIRouteDescriber {
	return func(f func(RouteDescription, *openapi3.T)) {
		f(RouteDescription{
			Title:       title,
			Description: description,
		}, &op.t)
	}
}
func (op *OpenAPI) RouteGroup(name string, description ...string) OpenAPIRouteGroup {
	t := op.t.Tags.Get(name)
	if t != nil {
		panic("tag already exists: " + name)
	}
	tag := &openapi3.Tag{
		Name: name,
	}
	if len(description) > 0 {
		tag.Description = strings.Join(description, " ")
	}
	op.t.Tags = append(op.t.Tags, tag)
	return OpenAPIRouteGroup{
		op:    op,
		group: name,
	}
}

func (op *OpenAPI) T() *openapi3.T {
	return &op.t
}

func (op *OpenAPI) Describe(description string) {
	op.t.Info.Description = description
}

func (op *OpenAPI) AddServer(url, description string) *openapi3.T {
	if op.t.Components.SecuritySchemes == nil {
		op.t.Components.SecuritySchemes = openapi3.SecuritySchemes{}
	}
	op.t.Servers = append(op.t.Servers, &openapi3.Server{
		URL:         url,
		Description: description,
	})
	return &op.t
}

func (op *OpenAPI) AddJWTBearerAuth(name string) *openapi3.T {
	if op.t.Servers == nil {
		op.t.Servers = openapi3.Servers{}
	}
	op.t.Components.SecuritySchemes[name] = &openapi3.SecuritySchemeRef{
		Value: openapi3.NewJWTSecurityScheme(),
	}
	return &op.t
}

func NewOpenAPI(title, version string) OpenAPI {
	comp := openapi3.NewComponents()
	return OpenAPI{
		t: openapi3.T{
			OpenAPI: "3.0.0",
			Info: &openapi3.Info{
				Title:   title,
				Version: version,
			},
			Components: &comp,
		},
	}
}

type OpenAPIRouteGroup struct {
	op    *OpenAPI
	group string
}

func (g *OpenAPIRouteGroup) Route(title, description string) OpenAPIRouteDescriber {
	return func(f func(RouteDescription, *openapi3.T)) {
		f(RouteDescription{
			Title:       title,
			Description: description,
			Tag:         g.group,
		}, &g.op.t)
	}
}

type endpointPath struct {
	verb httpVerb
	path string
}

type httpVerb string

const (
	GET    httpVerb = "GET"
	POST   httpVerb = "POST"
	PUT    httpVerb = "PUT"
	PATCH  httpVerb = "PATCH"
	DELETE httpVerb = "DELETE"
)

func Get(path string) endpointPath {
	return endpointPath{GET, path}
}
func Post(path string) endpointPath {
	return endpointPath{POST, path}
}
func Put(path string) endpointPath {
	return endpointPath{PUT, path}
}
func Patch(path string) endpointPath {
	return endpointPath{PATCH, path}
}
func Delete(path string) endpointPath {
	return endpointPath{DELETE, path}
}

func fillOpenAPIRoute[C, P, Q, B any, D dataer](p endpointPath, d OpenAPIRouteDescriber) {
	d(func(rdesc RouteDescription, swag *openapi3.T) {
		prepo, err := makeParams[P]("path")
		if err != nil {
			panic(errors.Wrap(err, "bad api data"))
		}
		params := openapi3.Parameters{}
		for param, pv := range prepo {
			err := validatePathParamVar(p.path, param)
			if err != nil {
				panic(errors.Wrap(err, "bad param data"))
			}
			pv.Ref = ""
			params = append(params, pv)
		}

		prepo, err = makeParams[Q]("query")
		if err != nil {
			panic(errors.Wrap(err, "bad api data"))
		}
		for _, pv := range prepo {
			pv.Ref = ""
			params = append(params, pv)
		}

		if swag.Components.Schemas == nil {
			swag.Components.Schemas = openapi3.Schemas{}
		}

		bodyTypeNodeSchema := quick_schema.GetSchema[B]()
		var requestBody *openapi3.RequestBody
		// ignore the request body if type is "any"
		if bodyTypeNodeSchema != nil {
			bodyRepo := buildSchemaRepo(*bodyTypeNodeSchema)

			reqContent := openapi3.NewContentWithJSONSchema(bodyRepo.Start)
			reqContent["application/x-www-form-urlencoded"] = openapi3.NewMediaType().WithSchema(bodyRepo.Start)
			reqContent["multipart/form-data"] = openapi3.NewMediaType().WithSchema(bodyRepo.Start)
			requestBody = &openapi3.RequestBody{
				Description: "Request data",
				Content:     reqContent,
			}
			for n, val := range bodyRepo.Repo {
				if val == nil {
					panic("unexpected nil bodySchema")
				}
				swag.Components.Schemas[n] = openapi3.NewSchemaRef("", val)
			}
		}

		responseNodeSchema := quick_schema.GetSchema[DataResponse[D]]()
		responseRepo := buildSchemaRepo(*responseNodeSchema)
		resp := new(D)
		if c, ok := interface{}(resp).(Schemaer); ok {
			responseRepo = c.Schema()
		}
		if responseRepo.Start == nil {
			panic(errors.New("empty schema for response"))
		}
		// remove root schema ref name
		responseRepo.Start.Format = ""

		desc := "endpoint success responses"
		response := &openapi3.Response{
			Description: &desc,
			Content:     openapi3.NewContentWithJSONSchema(responseRepo.Start),
		}

		for n, val := range responseRepo.Repo {
			if val == nil {
				panic("unexpected nil responseSchema")
			}
			swag.Components.Schemas[n] = openapi3.NewSchemaRef("", val)
		}

		op := &openapi3.Operation{
			Summary:     rdesc.Title,
			Description: rdesc.Description,
			OperationID: toCamelCase(rdesc.Title),
			Parameters:  params,
			Responses: openapi3.Responses{
				"200": &openapi3.ResponseRef{
					//Ref:   "#/components/responses/someResponse",
					Value: response,
				},
			},
			Security: openapi3.NewSecurityRequirements().With(openapi3.NewSecurityRequirement().Authenticate("bearerAuth", "something else")),
		}
		if requestBody != nil {
			op.RequestBody = &openapi3.RequestBodyRef{
				//Ref:   "#/components/requestBodies/someRequestBody",
				Value: requestBody,
			}
		}
		if len(rdesc.Tag) > 0 {
			op.Tags = []string{rdesc.Tag}
		}
		pitem := &openapi3.PathItem{}
		if swag.Paths == nil {
			swag.Paths = openapi3.Paths{}
		}
		if swag.Paths[p.path] != nil {
			pitem = swag.Paths[p.path]
		}
		switch p.verb {
		case GET:
			pitem.Get = op
		case POST:
			pitem.Post = op
		case PATCH:
			pitem.Patch = op
		case PUT:
			pitem.Put = op
		case DELETE:
			pitem.Delete = op
		}
		swag.Paths[p.path] = pitem
	})
}

func makeParams[T any](in string) (map[string]*openapi3.ParameterRef, error) {
	n := quick_schema.GetSchema[T]()
	if n == nil {
		return nil, nil
	}
	r := buildSchemaRepo(*n)
	sch := r.Start
	repo := r.Repo

	if sch.Type != "object" {
		return nil, errors.Errorf("parameter's type must be a object, is \"%s\"", sch.Type)
	}

	params := []*openapi3.Parameter{}
	for pname, p := range sch.Properties {
		required := has(sch.Required, pname)

		pram := &openapi3.Parameter{
			Description: p.Value.Description,
			Name:        pname,
			In:          in,
			Required:    required,
			Schema:      p,
		}
		for n, r := range repo {
			if len(strings.TrimSpace(n)) > 0 && n == p.Value.Title {
				pram.Schema = &openapi3.SchemaRef{
					Ref:   "#/components/schemas/" + n,
					Value: r,
				}
			}
		}
		params = append(params, pram)
	}

	prepo := map[string]*openapi3.ParameterRef{}
	for _, p := range params {
		prepo[p.Name] = &openapi3.ParameterRef{
			Ref:   "#/components/parameters/" + p.Name,
			Value: p,
		}
	}
	return prepo, nil
}

func makeRefableName(pkg, typ, name string) string {
	if pkg == "" {
		return name
	}
	if pkg != "" && typ != "" {
		return strings.Join(notempty([]string{strings.ReplaceAll(strings.ReplaceAll(pkg, "/", "_"), ".", "_"), typ}), "_")
	}
	return strings.Join(notempty([]string{strings.ReplaceAll(strings.ReplaceAll(pkg, "/", "_"), ".", "_"), typ, name}), "_")
}

func notempty(s []string) (res []string) {
	for _, v := range s {
		if v == "" {
			continue
		}
		res = append(res, v)
	}
	return res
}

func buildSchemaRepo(n quick_schema.Node) SchemaRepo {
	repo := map[string]*openapi3.Schema{}
	var schemafy func(n quick_schema.Node) *openapi3.Schema
	schemafy = func(n quick_schema.Node) *openapi3.Schema {
		nname := makeRefableName(n.Package, n.Type, n.Name)
		s := openapi3.NewSchema()
		s.Title = nname
		s.Type = n.Format
		s.Format = n.Type
		s.Example = n.Example
		s.Description = n.Description
		s.Nullable = n.Omitempty

		if s.Type == "object" {
			s.Properties = make(openapi3.Schemas)
			for _, p := range n.Children {
				pname := "#/components/schemas/" + makeRefableName(p.Package, "", p.Name)
				ps := schemafy(p)
				if p.Format == "pointer" && len(p.Children) == 1 {
					ps = schemafy(p.Children[0])
					ps.Nullable = true
				} else {
					if !p.Omitempty {
						s.Required = append(s.Required, p.Name)
					}
				}
				if ps.Format != "object" {
					pname = ""
				}
				sr := openapi3.NewSchemaRef(pname, ps)
				s.Properties[p.Name] = sr
			}
			_, ok := repo[nname]
			if !ok {
				repo[nname] = s
			}
		} else if (s.Type == "array" || s.Type == "slice") && len(n.Children) == 1 {
			s.Type = "array"
			ps := schemafy(n.Children[0])
			name := ""
			if ps.Type == "object" || (s.Type == "array" || s.Type == "slice") {
				name = makeRefableName(n.Children[0].Package, n.Children[0].Type, n.Children[0].Name)
			}
			if len(strings.TrimSpace(name)) > 0 {
				name = "#/components/schemas/" + name
			}
			s.Items = openapi3.NewSchemaRef(name, ps)
		}

		return s
	}
	sch := schemafy(n)
	return SchemaRepo{
		Start: sch,
		Repo:  repo,
	}
}

func has[T comparable](hs []T, n T) bool {
	for _, v := range hs {
		if v == n {
			return true
		}
	}
	return false
}

func validatePathParamVar(path, param string) error {
	if !strings.Contains(path, "{"+param+"}") {
		return errors.Errorf("declared path parameter \"%s\" needs to be defined as a path parameter in \"%s\" ", param, path)
	}
	return nil
}

// routerPathToOpenAPIPath transforms route params into expected format: :param -> {param}
// only handles simple ":etc" params
// for extended options see: https://docs.gofiber.io/guide/routing#parameters
func routerPathToOpenAPIPath(path string) string {
	re := regexp.MustCompile(`(?m)[^\\](:[\w]+)`)
	matches := re.FindAllString(path, -1)
	for _, m := range matches {
		path = strings.Replace(path, m, "/{"+strings.ReplaceAll(m, "/:", "")+"}", 1)
	}
	return path
}

func toCamelCase(s string) string {
	// Split the string into words
	words := strings.FieldsFunc(s, func(c rune) bool {
		return !unicode.IsLetter(c) && !unicode.IsNumber(c)
	})

	// Convert each word to title case
	for i := 0; i < len(words); i++ {
		words[i] = strings.Title(words[i])
	}

	// Combine the words and convert the first letter to lower case
	result := strings.Join(words, "")
	if len(result) > 0 {
		result = strings.ToLower(result[:1]) + result[1:]
	}
	return result
}
