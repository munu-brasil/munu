package sql_

import (
	"bytes"
	"database/sql/driver"
	"fmt"
	"strconv"
	"strings"
	"time"

	sq "github.com/munu-brasil/munu/backend/lib/sqrl"
	"github.com/pindamonhangaba/go-sqlfmt/sqlfmt"
)

func JoinSelect(builder1 *sq.SelectBuilder, builder2 *sq.SelectBuilder, clause string, args ...interface{}) (*sq.SelectBuilder, error) {
	b2, qArgs, err := builder2.ToSql()
	if err != nil {
		return nil, err
	}

	qArgs = append(qArgs, args...)
	builder1.Join("( "+b2+" ) "+clause, qArgs...)

	return builder1, nil
}

func LeftJoinSelect(builder1 *sq.SelectBuilder, builder2 *sq.SelectBuilder, clause string, args ...interface{}) (*sq.SelectBuilder, error) {
	b2, qArgs, err := builder2.ToSql()
	if err != nil {
		return nil, err
	}

	qArgs = append(qArgs, args...)
	builder1.LeftJoin("( "+b2+" ) "+clause, qArgs...)

	return builder1, nil
}

func UpdateWhereInSelect(builder1 *sq.UpdateBuilder, column string, builder2 *sq.SelectBuilder, args ...interface{}) (*sq.UpdateBuilder, error) {
	b2, qArgs, err := builder2.ToSql()
	if err != nil {
		return nil, err
	}

	qArgs = append(args, qArgs...)
	builder1.Where(column+" IN ( "+b2+" )", qArgs...)
	return builder1, nil
}

func SelectWhereInSelect(builder1 *sq.SelectBuilder, column string, builder2 *sq.SelectBuilder, args ...interface{}) (*sq.SelectBuilder, error) {
	b2, qArgs, err := builder2.ToSql()
	if err != nil {
		return nil, err
	}

	qArgs = append(args, qArgs...)
	builder1.Where(column+" IN ( "+b2+" )", qArgs...)
	return builder1, nil
}

func SelectWhereSelect(builder1 *sq.SelectBuilder, builder2 *sq.SelectBuilder, args ...interface{}) (*sq.SelectBuilder, error) {
	b2, qArgs, err := builder2.ToSql()
	if err != nil {
		return nil, err
	}

	qArgs = append(args, qArgs...)
	builder1.Where("( "+b2+" )", qArgs...)
	return builder1, nil
}

func Union(resp *sq.SelectBuilder, builders ...*sq.SelectBuilder) (*sq.SelectBuilder, error) {
	for _, b := range builders {
		qSQL, args, err := b.ToSql()
		if err != nil {
			return resp, err
		}
		resp = resp.Suffix(" UNION "+qSQL, args...)
	}

	return resp, nil
}

func UnionAll(resp *sq.SelectBuilder, builders ...*sq.SelectBuilder) (*sq.SelectBuilder, error) {
	for _, b := range builders {
		qSQL, args, err := b.ToSql()
		if err != nil {
			return resp, err
		}
		resp = resp.Suffix(" UNION ALL "+qSQL, args...)
	}

	return resp, nil
}

type weights struct {
	w string
}

type weightConsts struct {
	A weights
	B weights
	C weights
	D weights
}

func Weights() weightConsts {
	return weightConsts{
		A: weights{"'A'"},
		B: weights{"'B'"},
		C: weights{"'C'"},
		D: weights{"'D'"},
	}
}

func SetWeight(text string, weight weights) string {
	return "setweight(" + text + ", " + weight.w + ")"
}

func ToTsVector(language, text string) string {
	return "to_tsvector(" + language + ", " + text + ")"
}

func Position(text string, column string) string {
	return "position(" + text + " IN " + column + ")"
}

func Unaccent(text string) string {
	return "unaccent(" + text + ")"
}

func Unnest(text string) string {
	return "unnest(" + text + ")"
}

func JsonbArrayElements(text string, castType string) string {
	return "jsonb_array_elements(" + text + ")" + "::" + castType
}

func NullIf(value1, value2 string) string {
	if len(value2) == 0 {
		value2 = "''"
	}
	return "NULLIF(" + value1 + ", " + value2 + ")"
}

func Trim(value string) string {
	return "TRIM(" + value + ")"
}

func Lower(value string) string {
	return "LOWER(" + value + ")"
}

func Date(value string) string {
	return "DATE(" + value + ")"
}

func ConcatenateStrings(values ...string) string {
	return strings.Join(values, " || ")
}

func Using(t string, r string, s ...string) string {
	return t + " USING(" + strings.Join(append([]string{r}, s...), ",") + ") "
}

func On(t string, s ...string) string {
	return t + " ON " + strings.Join(s, " AND ")
}

func Or(values ...string) string {
	return "( " + strings.Join(values, " OR ") + " )"
}

func Q(values ...string) []string {
	return strings.Split(`"`+strings.Join(values, `","`)+`"`, ",")
}

func Coalesce(column string, columns ...string) string {
	c := []string{column}
	for _, c2 := range columns {
		if len(c2) == 0 {
			c2 = "''"
		}
		c = append(c, c2)
	}
	return "COALESCE(" + strings.Join(c, ", ") + ")"
}

func Alias(table, a string) string {
	return table + " " + a
}

func As(column, a string) string {
	return column + " AS " + a
}

func Ilike(column, value string) string {
	return column + " ILIKE " + value
}

func Contain(column, value string) string {
	return column + " @> " + value
}

func And(columns ...string) string {
	return strings.Join(columns, " AND ")
}

func ArrayAgg(column string, as string) string {
	sufix := " AS " + as
	if len(as) == 0 {
		sufix = ""
	}
	return "ARRAY_AGG(" + column + ")" + sufix
}

func ArrayAggFilter(column string, filters ...string) string {
	return "ARRAY_AGG(" + column + ") " + "FILTER (WHERE " + strings.Join(filters, " AND ") + ")"
}

func ArrayRemove(array string, remove *string, as string) string {
	sufix := " AS " + as
	if len(as) == 0 {
		sufix = ""
	}
	r := "NULL"
	if remove != nil {
		r = *remove
	}
	return "ARRAY_REMOVE(" + array + "," + r + ")" + sufix
}

func Ref(alias, a string) string {
	return alias + "." + a
}

func RowNumber(partitionBy []string, orderBy []string, order, as string) string {
	sufix := " AS " + as
	if len(as) == 0 {
		sufix = ""
	}
	return "ROW_NUMBER () OVER (PARTITION by " + strings.Join(partitionBy, ",") + " ORDER BY " + strings.Join(orderBy, ",") + " " + order + ")" + sufix
}

func Equal(column string, a string) string {
	return column + " = " + a
}

func IsNotNull(column string) string {
	return column + " IS NOT NULL"
}

func IsNull(column string) string {
	return column + " IS NULL"
}

func Not(a string) string {
	return "NOT " + a
}

func Gt(column string, a string) string {
	return column + " > " + a
}

func Lt(column string, a string) string {
	return column + " < " + a
}

func GtOrEq(column string, a string) string {
	return column + " >= " + a
}

func LtOrEq(column string, a string) string {
	return column + " <= " + a
}

func ArrayToString(column string, sep string) string {
	return "ARRAY_TO_STRING( " + column + ", " + sep + ")"
}

func Different(column string, a string) string {
	return column + " != " + a
}

type operators struct {
	o string
}

type tsqueryOperatorsConsts struct {
	And operators
	Or  operators
}

func TsOperators() tsqueryOperatorsConsts {
	return tsqueryOperatorsConsts{
		And: operators{"&"},
		Or:  operators{"|"},
	}
}

func ToTsqueryTextFormatter(searchText string, o operators) string {

	var formattedText string
	t := strings.TrimSpace(searchText)
	brokenText := strings.Split(t, " ")

	for i, r := range brokenText {
		if len(brokenText) == i+1 {
			formattedText += fmt.Sprintf("%s:* ", strings.TrimSpace(r))
		} else {
			formattedText += fmt.Sprintf("%s:* %s", strings.TrimSpace(r), o.o)
		}
	}

	return formattedText
}

// OrderByPosition returns a string with an order by position that ignores diacritics and not case sensitive.
// The order by returned uses Placeholder Question Mark.
func OrderByPosition(searchText, column string, columns ...string) (string, []interface{}) {
	args := []interface{}{}
	orderBys := "ORDER BY "
	t := strings.TrimSpace(searchText)
	brokenText := strings.Split(t, " ")
	c := append([]string{column}, columns...)
	for i, column := range c {
		for j, r := range brokenText {
			orderBy := Coalesce(NullIf(Position(
				Lower(Unaccent("?")),
				Lower(Unaccent(column)),
			), "0"), "FLOAT8 '+infinity'")
			orderBys += orderBy
			if !(i == (len(c)-1) && j == (len(brokenText)-1)) {
				orderBys += ", "
			}
			args = append(args, r)
		}
	}

	return orderBys, args
}

type debugQueryFormatOpts struct {
	format bool
}

func NoFmt() debugQueryFormatOpts {
	return debugQueryFormatOpts{
		format: false,
	}
}

func DebugQuery(qSQL string, args []interface{}, opts ...debugQueryFormatOpts) (s string) {
	defer func() {
		if r := recover(); r != nil {
			s = qSQL
		}
	}()

	for i := len(args) - 1; i >= 0; i-- {
		arg := args[i]
		if v, ok := arg.(interface {
			Value() (driver.Value, error)
		}); ok {
			a, err := v.Value()
			if err == nil {
				arg = a
			}
		}

		qSQL = strings.ReplaceAll(qSQL, "$"+strconv.Itoa(i+1), argumentToSQLString(arg))
	}

	disableFormat := false
	if len(opts) > 0 {
		disableFormat = !opts[0].format
	}
	if !disableFormat {
		s, err := sqlfmt.Format(qSQL, &sqlfmt.Options{
			Distance: 3,
		})
		if err != nil {
			return qSQL
		}
		return s
	}

	return qSQL
}

// argumentToSQLString should only be used to debug queries as it can make the system susceptible to SQL Injection.
func argumentToSQLString(arg interface{}) string {
	argVal := arg
	switch v := arg.(type) {
	case *string:
		if v != nil {
			argVal = *v
		} else {
			argVal = nil
		}
	case *int:
		if v != nil {
			argVal = *v
		} else {
			argVal = nil
		}
	case *int8:
		if v != nil {
			argVal = *v
		} else {
			argVal = nil
		}
	case *int16:
		if v != nil {
			argVal = *v
		} else {
			argVal = nil
		}
	case *int32:
		if v != nil {
			argVal = *v
		} else {
			argVal = nil
		}
	case *int64:
		if v != nil {
			argVal = *v
		} else {
			argVal = nil
		}
	case *uint:
		if v != nil {
			argVal = *v
		} else {
			argVal = nil
		}
	case *uint8:
		if v != nil {
			argVal = *v
		} else {
			argVal = nil
		}
	case *uint16:
		if v != nil {
			argVal = *v
		} else {
			argVal = nil
		}
	case *uint32:
		if v != nil {
			argVal = *v
		} else {
			argVal = nil
		}
	case *uint64:
		if v != nil {
			argVal = *v
		} else {
			argVal = nil
		}
	case *float32:
		if v != nil {
			argVal = *v
		} else {
			argVal = nil
		}
	case *float64:
		if v != nil {
			argVal = *v
		} else {
			argVal = nil
		}
	case *bool:
		if v != nil {
			argVal = *v
		} else {
			argVal = nil
		}
	case []byte:
		argVal = string(v)
	case time.Time:
		argVal = string(v.Format(time.RFC3339))
	}

	argFmt := "'%s'"
	switch argVal.(type) {
	case int, int8, int16, int32, int64, uint, uint8, uint16, uint32, uint64:
		argFmt = "%d"
	case float32, float64:
		argFmt = "%f"
	case bool:
		argFmt = "%v"
	case nil:
		argVal = "NULL"
		argFmt = "%s"
	}

	return fmt.Sprintf(argFmt, argVal)
}

type PaginationOrderColumCompare struct {
	lastIDCol string
	rowCol    string
	compare   string
}

type PaginationAfterIDCompare struct {
	lastIDCol string
	rowCol    string
	compare   string
}

func NewAfterID(rowCol, compare, lastIDCol string) PaginationAfterIDCompare {
	return PaginationAfterIDCompare{
		lastIDCol: lastIDCol,
		rowCol:    rowCol,
		compare:   compare,
	}
}

func NewPaginationOrder(rowCol, compare, lastIDCol string) PaginationOrderColumCompare {
	return PaginationOrderColumCompare{
		lastIDCol: lastIDCol,
		rowCol:    rowCol,
		compare:   compare,
	}
}

func PaginationAfterID(lastID PaginationAfterIDCompare, cols ...PaginationOrderColumCompare) string {
	n := "\n"
	qSQL := &bytes.Buffer{}
	qSQL.WriteString(lastID.lastIDCol + " <> " + lastID.rowCol + n)
	if len(cols) == 0 {
		return qSQL.String()
	}

	qSQL.WriteString("AND " + cols[0].rowCol + " " + cols[0].compare + " " + cols[0].lastIDCol + n)
	casewhen := cols[0].rowCol + " = " + cols[0].lastIDCol + " " + n
	for i, col := range cols {
		if i == 0 {
			continue
		}
		qSQL.WriteString("AND CASE WHEN" + n + casewhen + "THEN " + col.rowCol + " " + col.compare + " " + col.lastIDCol + " ELSE TRUE END" + n)
		casewhen += "AND " + col.rowCol + " = " + col.lastIDCol + " " + n
	}
	return qSQL.String()
}
