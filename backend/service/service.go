package service

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"reflect"
	"regexp"
	"strconv"
	"strings"

	"github.com/jmoiron/sqlx"
)

// DB is the interface with methods for both sqlx.DB and sqlx.Tx
type DB interface {
	DriverName() string
	Rebind(query string) string
	BindNamed(query string, arg interface{}) (string, []interface{}, error)
	NamedQuery(query string, arg interface{}) (*sqlx.Rows, error)
	NamedExec(query string, arg interface{}) (sql.Result, error)
	Select(dest interface{}, query string, args ...interface{}) error
	Get(dest interface{}, query string, args ...interface{}) error
	Queryx(query string, args ...interface{}) (*sqlx.Rows, error)
	QueryRowx(query string, args ...interface{}) *sqlx.Row
	MustExec(query string, args ...interface{}) sql.Result
	Preparex(query string) (*sqlx.Stmt, error)
	PrepareNamed(query string) (*sqlx.NamedStmt, error)
	// sql
	Exec(query string, args ...interface{}) (sql.Result, error)
	Query(query string, args ...interface{}) (*sql.Rows, error)
	QueryRow(query string, args ...interface{}) *sql.Row
}

// Dollar is a PlaceholderFormat instance that replaces placeholders with
// dollar-prefixed positional placeholders (e.g. $1, $2, $3).
var Dollar = dollarFormat{}

const (
	Telegram = "telegram"
	WhatsApp = "whatsapp"

	BrazilPhoneCode = "+55"
)

// NewDollar creates a new Dollar PlaceholderFormat with a starting placeholder count
func NewDollar(startAt int) dollarFormat {
	return dollarFormat{startIndex: startAt}
}

// dollarFormat model
type dollarFormat struct {
	startIndex int
}

func (d dollarFormat) ReplacePlaceholders(sql string) (string, error) {
	return replacePlaceholders(d.startIndex, sql, func(buf *bytes.Buffer, i int) error {
		fmt.Fprintf(buf, "$%d", i)
		return nil
	})
}

func replacePlaceholders(startIdx int, sql string, replace func(buf *bytes.Buffer, i int) error) (string, error) {
	buf := &bytes.Buffer{}
	i := startIdx
	for {
		p := strings.Index(sql, "?")
		if p == -1 {
			break
		}

		if len(sql[p:]) > 1 && sql[p:p+2] == "??" { // escape ?? => ?
			buf.WriteString(sql[:p])
			buf.WriteString("?")
			if len(sql[p:]) == 1 {
				break
			}
			sql = sql[p+2:]
		} else {
			i++
			buf.WriteString(sql[:p])
			if err := replace(buf, i); err != nil {
				return "", err
			}
			sql = sql[p+1:]
		}
	}

	buf.WriteString(sql)
	return buf.String(), nil
}

type SQLer interface {
	SQL() (string, []interface{})
	Cleanup() (string, []interface{})
}

type rawSQL struct {
	sql  string
	args []interface{}
}

func (rs rawSQL) SQL() (string, []interface{}) {
	return rs.sql, rs.args
}

func (rs rawSQL) Cleanup() (string, []interface{}) {
	return "", []interface{}{}
}

func RawSQL(s string, a ...interface{}) rawSQL {
	return rawSQL{
		sql:  s,
		args: a,
	}
}

type Fixture struct {
	Table             string
	ResetSerialColumn *struct {
		SeqName string
		Value   int
	}
	Cols []string
	Vals []interface{}
}

func (f Fixture) SQL() (string, []interface{}) {
	cols := []string{}
	for _, col := range f.Cols {
		cols = append(cols, `"`+col+`"`)
	}
	placehold := []string{}
	for i := range f.Cols {
		placehold = append(placehold, `$`+strconv.Itoa(i+1))
	}
	qSQL := `INSERT INTO ` + f.Table + ` (` + strings.Join(cols, ",") + `) VALUES(` + strings.Join(placehold, ",") + `)`
	return qSQL, f.Vals
}

func (f Fixture) Cleanup() (string, []interface{}) {
	if f.ResetSerialColumn != nil {
		return `ALTER SEQUENCE ` + f.ResetSerialColumn.SeqName + ` RESTART WITH ` + strconv.Itoa(f.ResetSerialColumn.Value), []interface{}{}
	}
	return "", []interface{}{}
}

func FixtureFromStruct(item interface{}, include bool, cols ...string) Fixture {
	f := Fixture{}
	v := reflect.ValueOf(item)
	f.Table = v.Type().Name()

	findDBName := func(t reflect.StructTag) (string, error) {
		if jt, ok := t.Lookup("db"); ok {
			return strings.Split(jt, ",")[0], nil
		}
		return "", fmt.Errorf("tag provided does not define a db tag")
	}
	for i := 0; i < v.NumField(); i++ {
		typeField := v.Type().Field(i)
		tag := typeField.Tag
		jname, _ := findDBName(tag)

		if include {
			if isInSlice(jname, cols) {
				f.Cols = append(f.Cols, jname)
				val := v.Field(i)
				f.Vals = append(f.Vals, val.Interface())
			}
		} else {
			if !isInSlice(jname, cols) {
				f.Cols = append(f.Cols, jname)
				val := v.Field(i)
				f.Vals = append(f.Vals, val.Interface())
			}
		}
	}

	return f
}

func isInSlice(s string, l []string) bool {
	for _, line := range l {
		if line == s {
			return true
		}
	}
	return false
}

type logLevel int

const (
	LogDebug   logLevel = 0
	LogWarning logLevel = 1
	LogError   logLevel = 2
)

type Logger func(logLevel, ...interface{})

func DefaultLogger(label string, levels ...logLevel) Logger {
	lg := log.New(os.Stdout, label+": ", log.LstdFlags)
	return func(level logLevel, logs ...interface{}) {
		for _, lvl := range levels {
			if lvl == level {
				lg.Println(logs...)
				return
			}
		}
	}
}

type CTEPermission int
type CTEPermissions []CTEPermission

const (
	PermissionRead CTEPermission = iota
	PermissionWrite
)

func (d CTEPermission) String() string {
	return [...]string{"read", "write"}[d]
}

func (d CTEPermissions) Has(p CTEPermission) bool {
	for _, dp := range d {
		if dp == p {
			return true
		}
	}
	return false
}

// Contains checks whether an array of T contains a T
func Contains[T comparable](s T, a []T) bool {
	for _, k := range a {
		if s == k {
			return true
		}
	}
	return false
}

// NilString returns a string from a *string (empty string if nil)
func NilString(s *string) string {
	if s != nil {
		return *s
	}
	return ""
}

var nonPhoneNumberRegex = regexp.MustCompile(`[^\+0-9]*`)

func NormalizePhone(phone string) string {
	p := nonPhoneNumberRegex.ReplaceAllString(phone, "")
	if len(p) == 0 {
		return ""
	}
	if string(p[0]) == "+" {
		return p
	}
	if len(p) == 11 || len(p) == 10 {
		return BrazilPhoneCode + p
	}
	return "+" + p
}

// This function only validates brazilian phone numbers
func isCellPhoneBR(phone string) bool {
	if regexp.MustCompile(`[^\+\d\s]`).Match([]byte(phone)) {
		return false
	}
	phone = strings.ReplaceAll(phone, BrazilPhoneCode, "")
	if len(phone) >= 10 {
		p := invertString(phone)
		f1, err := strconv.Atoi(string(p[7]))
		if err != nil {
			return false
		}
		f2, err := strconv.Atoi(string(p[8]))
		if err != nil {
			return false
		}
		if (f1 >= 6 && f1 <= 9) || (f2 >= 6 && f2 <= 9) {
			return true
		}
	}
	return false
}

func invertString(s string) string {
	runes := []rune(s)
	for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
		runes[i], runes[j] = runes[j], runes[i]
	}
	return string(runes)
}

func StrPtr(s string) *string {
	return &s
}

func StrArrayPtr(s []string) *[]string {
	return &s
}

func IntPtr(i int) *int {
	return &i
}

func Int8Ptr(i int8) *int8 {
	return &i
}

func Int64Ptr(i int64) *int64 {
	return &i
}

func FloatPtr(f float64) *float64 {
	return &f
}

func BoolPtr(f bool) *bool {
	return &f
}

type QueryParams[T any] []T

func (c QueryParams[T]) Slice() []T {
	return []T(c)
}

func (c *QueryParams[T]) UnmarshalJSON(data []byte) (err error) {
	n := make([]T, 0)

	defer func() {
		if err == nil {
			*c = n
		}
	}()

	if len(data) > 0 && data[0] != '[' {
		err := json.Unmarshal(append(append([]byte{'['}, data...), ']'), &n)
		if err != nil {
			return err
		}
		return nil
	}

	err = json.Unmarshal(data, &n)
	if err != nil {
		return err
	}
	return nil
}

func GetUserIP(req http.Request) string {
	xRealIP := strings.Split(req.Header.Get("x-real-ip"), ",")
	ip := safeIDX(xRealIP, 0)

	if len([]rune(strings.TrimSpace(ip))) == 0 {
		xForwardedFor := strings.Split(req.Header.Get("x-forwarded-for"), ",")
		ip = safeIDX(xForwardedFor, 0)
	}

	if len([]rune(strings.TrimSpace(ip))) == 0 {
		ip = req.RemoteAddr
	}

	return ip
}

func safeIDX[T any](data []T, index int64) T {
	if len(data) >= int(index) {
		return data[index]
	}
	return *(new(T))
}

func SafePtr[T any](s *T) T {
	if s == nil {
		return *new(T)
	}
	return *s
}
