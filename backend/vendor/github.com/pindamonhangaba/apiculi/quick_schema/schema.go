package quick_schema

import (
	"encoding/json"
	"errors"
	"reflect"
	"strings"
	"unicode"
)

type Noder interface {
	Node() *Node
}

var (
	marshalerType = reflect.TypeOf((*json.Marshaler)(nil)).Elem()
	noderType     = reflect.TypeOf((*Noder)(nil)).Elem()
)

type Node struct {
	Package     string
	Type        string
	Format      string
	Name        string
	Description string
	Example     string
	Children    []Node
	Omitempty   bool
}

func noderEncoder(v reflect.Value) *Node {
	m, ok := v.Interface().(Noder)
	if !ok {
		return nil
	}

	return m.Node()
}

func marshalerEncoder(v reflect.Value) (Node, error) {
	result := ""
	if v.Kind() == reflect.Pointer && v.IsNil() {
		return Node{
			Type:    v.Type().Name(),
			Package: v.Type().PkgPath(),
			Format:  "object",
		}, errors.New("invalid 1")
	}
	m, ok := v.Interface().(json.Marshaler)
	if !ok {
		return Node{
			Type:    v.Type().Name(),
			Package: v.Type().PkgPath(),
			Format:  "object",
		}, errors.New("invalid 2")
	}
	b, err := m.MarshalJSON()
	if err != nil {
		return Node{
			Type:    v.Type().Name(),
			Package: v.Type().PkgPath(),
			Format:  "object",
		}, errors.New("invalid 3")
	}
	result = string(b)
	isNullable := string(b) == "null"
	if isNullable && v.Kind() == reflect.Struct {
		if v.FieldByIndex([]int{0}).CanSet() && (v.FieldByIndex([]int{0}).Kind() == reflect.Array || v.FieldByIndex([]int{0}).Kind() == reflect.Slice) {
			v.FieldByIndex([]int{0}).Set(reflect.MakeSlice(v.FieldByIndex([]int{0}).Type(), 1, 1))
		}
		if v.FieldByName("Valid").CanSet() {
			v.FieldByName("Valid").Set(reflect.ValueOf(true))
		}
		m, ok := v.Interface().(json.Marshaler)
		if !ok {
			return Node{
				Type:    v.Type().Name(),
				Package: v.Type().PkgPath(),
				Format:  "string",
			}, errors.New("invalid 4")
		}
		b, err = m.MarshalJSON()
		if err != nil {
			return Node{
				Type:    v.Type().Name(),
				Package: v.Type().PkgPath(),
				Format:  "object",
			}, errors.New("invalid 5")
		}
		result = string(b)
	}
	it := Node{
		Type:    v.Type().Name(),
		Package: v.Type().PkgPath(),
		Format:  "object",
	}
	if strings.HasPrefix(result, "\"") && strings.HasSuffix(result, "\"") {
		it.Format = "string"
	} else {
		isNotDigit := func(c rune) bool { return c < '0' || c > '9' }
		isNumeric := strings.IndexFunc(result, isNotDigit) == -1
		if isNumeric {
			it.Format = "number"
		} else if strings.HasPrefix(result, "[") && strings.HasSuffix(result, "]") {
			it.Format = "array"
			if strings.HasPrefix(result, "[true") || strings.HasPrefix(result, "[false") {
				it.Children = []Node{{
					Type:   "bolean",
					Format: "bolean",
				}}
			}
			if strings.HasPrefix(result, "[{") || strings.HasSuffix(result, "}]") {
				it.Children = []Node{{
					Type:   "object",
					Format: "object",
				}}
			}
			if strings.HasPrefix(result, "[\"") || strings.HasSuffix(result, "\"]") {
				it.Children = []Node{{
					Type:   "string",
					Format: "string",
				}}
			}
			if strings.HasPrefix(result, "[[") || strings.HasSuffix(result, "]]") {
				it.Children = []Node{{
					Type:   "array",
					Format: "array",
				}}
			}
			isDigitOrComma := func(c rune) bool { return c >= '0' || c <= '9' || c == ',' }
			isNumericArr := strings.IndexFunc(result, isDigitOrComma) == -1
			if isNumericArr {
				it.Children = []Node{{
					Type:   "number",
					Format: "number",
				}}
			}
		}
	}
	if isNullable {
		return Node{
			Type:     v.Type().Name(),
			Package:  v.Type().PkgPath(),
			Format:   "pointer",
			Children: []Node{it},
		}, nil
	}

	return it, nil

}

func schemaIt(t reflect.Type, f *reflect.Value) (d *Node) {
	defer func() {
		if r := recover(); r != nil {
			d = &Node{
				Type:   "panic",
				Format: "object",
			}
		}
	}()
	if t.Implements(noderType) {
		enc := noderEncoder(*f)
		if enc != nil {
			return enc
		}
	}
	typ := t.Name()
	switch t.Kind() {
	case reflect.Map:
		if t.Key().Name() != reflect.String.String() {
			return &Node{
				Type:   "non-string-keys-map",
				Format: "object",
			}
		}
		fv := reflect.New(t.Elem())
		e := fv.Elem()
		items := []Node{}
		itm := schemaIt(t.Elem(), &e)
		if itm != nil {
			items = append(items, *itm)
		}
		return &Node{
			Type:     typ,
			Package:  t.PkgPath(),
			Format:   "map",
			Children: items,
		}
	case reflect.Slice:
		s1 := reflect.SliceOf(t)
		tt := s1.Elem().Elem()
		fv := reflect.New(tt)
		e := fv.Elem()

		items := []Node{}
		itm := schemaIt(tt, &e)
		if itm != nil {
			items = append(items, *itm)
		}
		return &Node{
			Type:     typ,
			Package:  t.PkgPath(),
			Format:   "slice",
			Children: items,
		}
	case reflect.Array:
		s1 := reflect.ArrayOf(1, t)
		tt := s1.Elem().Elem()
		fv := reflect.New(tt)
		e := fv.Elem()

		// if array of uint8 we consider it as a string
		if _, ok := e.Interface().(uint8); ok {
			return &Node{
				Type:    typ,
				Package: "",
				Format:  "string",
			}
		}

		items := []Node{}
		itm := schemaIt(tt, &e)
		if itm != nil {
			items = append(items, *itm)
		}
		return &Node{
			Type:     typ,
			Package:  t.PkgPath(),
			Format:   "array",
			Children: items,
		}
	case reflect.Ptr:
		fv := reflect.New(t.Elem())
		e := fv.Elem()
		items := []Node{}
		itm := schemaIt(e.Type(), &e)
		if itm != nil {
			items = append(items, *itm)
		}
		return &Node{
			Type:     typ,
			Package:  t.PkgPath(),
			Format:   "pointer",
			Children: items,
		}
	case reflect.String:
		return &Node{
			Type:    t.Name(),
			Package: t.PkgPath(),
			Format:  "string",
		}
	case reflect.Bool:
		return &Node{
			Type:    t.Name(),
			Package: t.PkgPath(),
			Format:  "boolean",
		}
	case reflect.Struct:
		if t.Implements(marshalerType) {
			enc, err := marshalerEncoder(*f)
			if err == nil {
				return &enc
			}
		}
		items := []Node{}
		for i := 0; i < f.NumField(); i++ {
			v := f.Field(i)
			vv := t.Field(i)
			if !vv.IsExported() {
				continue
			}
			jsontag := strings.TrimSpace(vv.Tag.Get("json"))
			if jsontag == "-" {
				continue
			}
			name := vv.Name
			nmeth, err := getValueFromStringMethod(vv.Type, "Name")
			if err == nil && isValidTag(nmeth) {
				name = nmeth
			}
			n, extra := parseTag(jsontag)
			if isValidTag(n) {
				name = n
			}

			itm := schemaIt(vv.Type, &v)
			itm.Omitempty = contains("omitempty", extra)
			if vv.Anonymous && vv.Type.Kind() == reflect.Slice && f.NumField() == 1 {
				return itm
			}
			if vv.Anonymous && vv.Type.Kind() == reflect.Struct {
				items = append(items, itm.Children...)
			} else {
				if itm != nil {
					if !val(itm.Name) {
						itm.Name = name
					}
					d := strings.TrimSpace(vv.Tag.Get("description"))
					if val(d) {
						itm.Description = d
					}
					e := strings.TrimSpace(vv.Tag.Get("example"))
					if val(e) {
						itm.Example = e
					}
					f := strings.TrimSpace(vv.Tag.Get("format"))
					if val(f) {
						itm.Format = f
					}
					typetag := strings.TrimSpace(vv.Tag.Get("type"))
					typt, _ := parseTag(typetag)
					if isValidTag(typt) {
						itm.Type = typt
					}
					items = append(items, *itm)
				}
			}

		}
		return &Node{
			Type:     typ,
			Package:  t.PkgPath(),
			Format:   "object",
			Children: items,
		}
	case reflect.Int,
		reflect.Int8,
		reflect.Int16,
		reflect.Int32,
		reflect.Int64,
		reflect.Uint,
		reflect.Uint8,
		reflect.Uint16,
		reflect.Uint32,
		reflect.Uint64,
		reflect.Uintptr,
		reflect.Float32,
		reflect.Float64,
		reflect.Complex64,
		reflect.Complex128:
		return &Node{
			Type:    t.Name(),
			Package: t.PkgPath(),
			Format:  "number",
		}
	default:
	}
	return d
}

func GetSchema[T any]() *Node {
	t := *new(T)
	tt := reflect.TypeOf(t)
	if tt == nil {
		return nil
	}
	ptr := reflect.New(tt)
	e := ptr.Elem()
	its := schemaIt(tt, &e)
	return its
}

func parseTag(tag string) (string, []string) {
	tag, opt, _ := strings.Cut(tag, ",")
	return tag, strings.Split(opt, ",")
}

func val(s string) bool {
	return len(s) > 0
}

func isValidTag(s string) bool {
	if s == "" {
		return false
	}
	for _, c := range s {
		switch {
		case strings.ContainsRune("!#$%&()*+-./:;<=>?@[]^_{|}~ ", c):
			// Backslash and quote chars are reserved, but
			// otherwise any punctuation chars are allowed
			// in a tag name.
		case !unicode.IsLetter(c) && !unicode.IsDigit(c):
			return false
		}
	}
	return true
}

func getValueFromStringMethod(t reflect.Type, name string) (s string, err error) {
	err = errors.New("no " + name + " method")
	defer func() {
		if r := recover(); r != nil {
			err = errors.New("panic in " + name + " method")
		}
	}()
	_, ok := t.MethodByName(name)
	if ok {
		res := reflect.Zero(t).MethodByName(name).Call([]reflect.Value{})
		if str, ok := res[0].Interface().(string); ok {
			return str, nil
		}
	}

	return s, err
}

func contains(s string, a []string) bool {
	for _, k := range a {
		if strings.TrimSpace(s) == strings.TrimSpace(k) {
			return true
		}
	}
	return false
}
