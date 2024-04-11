package cte

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/auxten/postgresql-parser/pkg/sql/parser"
	"github.com/auxten/postgresql-parser/pkg/sql/sem/tree"
	"github.com/auxten/postgresql-parser/pkg/walk"
	sq "github.com/munu-brasil/munu/backend/lib/sqrl"
	"github.com/pkg/errors"
)

type placeholder string

const (
	PlaceholderDollar       placeholder = "$"
	PlaceholderQuestionmark placeholder = "?"
)

type CTE interface {
	Columns() []string
	As() string
	SQL() (string, []interface{}, error)
}

var dollarPholderRGXP = regexp.MustCompile(`\$\d+`)
var nonintRGXP = regexp.MustCompile(`\D`)
var colnameRGXP = regexp.MustCompile(`[^a-zA-Z0-9_]`)

type StringCTE struct {
	columns []string
	sql     string
	args    []interface{}
	as      string
}

func (cte *StringCTE) CloneWith(args []interface{}) *StringCTE {
	return &StringCTE{
		columns: cte.columns,
		sql:     cte.sql,
		args:    args,
		as:      cte.as,
	}
}
func (cte *StringCTE) Columns() []string {
	return cte.columns
}
func (cte *StringCTE) As() string {
	return cte.as
}
func (cte *StringCTE) SQL() (string, []interface{}, error) {
	return cte.sql, cte.args, nil
}

func parseColumnName(in string) (string, error) {
	s := strings.Split(in, ".")
	col := strings.Join(s[len(s)-1:], "")
	col = strings.ReplaceAll(col, "\"", "")
	badchars := colnameRGXP.FindIndex([]byte(col))
	if len(badchars) > 0 {
		return col, errors.New("invalid character for column name: " + col)
	}
	if len(col) == 0 {
		return col, errors.New("invalid empty column name: " + in)
	}

	return col, nil
}

// CTEFromString only supports Placeholder Format Dollar
func CTEFromString(as, sql string, args []interface{}) (*StringCTE, error) {
	cte := StringCTE{
		as:      as,
		sql:     sql,
		args:    args,
		columns: []string{},
	}

	stmts, err := parser.Parse(sql)
	if err != nil {
		return nil, errors.Wrap(err, "parse")
	}
	if len(stmts) != 1 {
		return nil, errors.New("unsupported statement count of " + strconv.Itoa(len(stmts)))
	}

	var walkingErr error = errors.New("failed parsing SQL")
	w := &walk.AstWalker{
		Fn: func(ctx interface{}, node interface{}) (stop bool) {
			switch t := node.(type) {
			case *tree.Select:
				return false
			case *tree.UnionClause:
				return false
			case *tree.SelectClause:
				columnNames, err := getColumnsToSelectExprs(t.Exprs)
				if err != nil {
					walkingErr = err
					return true
				}
				cte.columns = append(cte.columns, columnNames...)
				walkingErr = nil
			case *tree.Insert:
				switch r := t.Returning.(type) {
				case *tree.ReturningExprs:
					if r != nil {
						columnNames, err := getColumnsToSelectExprs(*r)
						if err != nil {
							walkingErr = err
							return true
						}
						cte.columns = append(cte.columns, columnNames...)
					}
				}
				walkingErr = nil
				return false
			case *tree.Update:
				switch r := t.Returning.(type) {
				case *tree.ReturningExprs:
					if r != nil {
						columnNames, err := getColumnsToSelectExprs(*r)
						if err != nil {
							walkingErr = err
							return true
						}
						cte.columns = append(cte.columns, columnNames...)
					}
				}
				walkingErr = nil
				return false
			case *tree.Delete:
				switch r := t.Returning.(type) {
				case *tree.ReturningExprs:
					if r != nil {
						columnNames, err := getColumnsToSelectExprs(*r)
						if err != nil {
							walkingErr = err
							return true
						}
						cte.columns = append(cte.columns, columnNames...)
					}
				}
				walkingErr = nil
				return false
			default:
				walkingErr = errors.New("unsupported starting SQL statement: " + fmt.Sprintf("node type %T", node))
			}
			return true
		},
	}
	_, _ = w.Walk(stmts, nil)
	if walkingErr != nil {
		return nil, walkingErr
	}

	return &cte, nil
}

func getColumnsToSelectExprs(t []tree.SelectExpr) ([]string, error) {
	columns := []string{}
	for _, col := range t {
		colname := string(col.As)
		if len(colname) == 0 {
			colname = col.Expr.String()
		}
		colname, err := parseColumnName(colname)
		if err != nil {
			return columns, err
		}
		columns = append(columns, colname)
	}
	return columns, nil
}

func MustCTEFromString(as, qSQL string, args []interface{}) *StringCTE {
	c, err := CTEFromString(as, qSQL, args)
	if err != nil {
		panic(errors.Wrap(err, as))
	}
	return c
}

// MustCTEFromSelectBuilder only supports Placeholder Format Dollar
func MustCTEFromSelectBuilder(as string, builder *sq.SelectBuilder) *StringCTE {
	c, err := CTEFromSelectBuilder(as, builder)
	if err != nil {
		panic(errors.Wrap(err, as))
	}
	return c
}

// MustCTEFromUpdateBuilder only supports Placeholder Format Dollar
func MustCTEFromUpdateBuilder(as string, builder *sq.UpdateBuilder) *StringCTE {
	c, err := CTEFromUpdateBuilder(as, builder)
	if err != nil {
		panic(errors.Wrap(err, as))
	}
	return c
}

// MustCTEFromDeleteBuilder only supports Placeholder Format Dollar
func MustCTEFromDeleteBuilder(as string, builder *sq.DeleteBuilder) *StringCTE {
	c, err := CTEFromDeleteBuilder(as, builder)
	if err != nil {
		panic(errors.Wrap(err, as))
	}
	return c
}

type cteColumns struct {
	start int
	end   int
	cte   CTE
}

type WithCTE struct {
	ctes []cteColumns
}

func (w *WithCTE) Select(sel string) (string, []interface{}, error) {
	with, args, err := w.toSQL(PlaceholderDollar, "")
	qSQL := with + "\n" + sel
	return qSQL, args, err
}
func (w *WithCTE) AsPrefix(withStmt ...string) (string, []interface{}, error) {
	if len(withStmt) == 0 {
		withStmt = []string{"WITH "}
	}
	with, args, err := w.toSQL(PlaceholderQuestionmark, strings.Join(withStmt, " "))
	return with, args, err
}

func (w *WithCTE) toSQL(ph placeholder, with string) (string, []interface{}, error) {

	args := []interface{}{}

	for _, cte := range w.ctes {
		s, a, err := cte.cte.SQL()
		if err != nil {
			return "", nil, err
		}
		errs := []error{}
		res := dollarPholderRGXP.ReplaceAllFunc([]byte(s), func(in []byte) []byte {
			if ph == PlaceholderQuestionmark {
				return []byte("?")
			}
			res := nonintRGXP.ReplaceAll(in, nil)
			pc, err := strconv.Atoi(string(res))
			if err != nil {
				errs = append(errs, errors.New("parse placeholder "+string(in)))
				return nil
			}
			newpc := len(args) + pc
			return []byte("$" + strconv.Itoa(newpc) + " ")
		})
		if len(errs) > 0 {
			return "", nil, errors.New("parsing placeholders")
		}
		s = string(res)
		args = append(args, a...)

		materialized := ""
		if i, ok := cte.cte.(interface{ Materialized() bool }); ok {
			if !i.Materialized() {
				materialized = " NOT MATERIALIZED"
			} else {
				materialized = " MATERIALIZED"
			}
		}
		with += "\n" + cte.cte.As() + ` AS ` + materialized + ` (` + s + `),`
	}
	with = strings.TrimSuffix(with, ",")

	selects := []string{}

	qSQL := with + "\n" + strings.Join(selects, "\nUNION ALL\n")
	return qSQL, args, nil
}

func With(ctes ...CTE) *WithCTE {

	cs := []cteColumns{}
	for idx, cte := range ctes {
		cs = append(cs, cteColumns{
			start: idx,
			end:   idx + len(cte.Columns()),
			cte:   cte,
		})
	}

	return &WithCTE{
		ctes: cs,
	}
}

type materialized struct {
	cte          CTE
	materialized bool
}

func (m materialized) Columns() []string {
	return m.cte.Columns()
}
func (m materialized) As() string {
	return m.cte.As()
}

func (m materialized) SQL() (string, []interface{}, error) {
	return m.cte.SQL()
}

func (m materialized) Materialized() bool {
	return m.materialized
}

func NotMaterialized(cte CTE) CTE {
	return materialized{cte: cte, materialized: false}
}

func Materialized(cte CTE) CTE {
	return materialized{cte: cte, materialized: true}
}

func Ref(table CTE, column string) string {
	return table.As() + ". " + column
}

// CTEFromSelectBuilder only supports Placeholder Format Dollar
func CTEFromSelectBuilder(as string, builder *sq.SelectBuilder) (cte *StringCTE, err error) {
	qSQL, args, err := builder.ToSql()
	if err != nil {
		return cte, err
	}
	cte, err = CTEFromString(as, qSQL, args)
	return cte, err
}

// CTEFromUpdateBuilder only supports Placeholder Format Dollar
func CTEFromUpdateBuilder(as string, builder *sq.UpdateBuilder) (cte *StringCTE, err error) {
	qSQL, args, err := builder.ToSql()
	if err != nil {
		return cte, err
	}

	cte, err = CTEFromString(as, qSQL, args)
	return cte, err
}

// CTEFromDeleteBuilder only supports Placeholder Format Dollar
func CTEFromDeleteBuilder(as string, builder *sq.DeleteBuilder) (cte *StringCTE, err error) {
	qSQL, args, err := builder.ToSql()
	if err != nil {
		return cte, err
	}

	cte, err = CTEFromString(as, qSQL, args)
	return cte, err
}

// CTEFromInsertBuilder only supports Placeholder Format Dollar
func CTEFromInsertBuilder(as string, builder *sq.InsertBuilder) (cte *StringCTE, err error) {
	qSQL, args, err := builder.ToSql()
	if err != nil {
		return cte, err
	}

	cte, err = CTEFromString(as, qSQL, args)
	return cte, err
}
