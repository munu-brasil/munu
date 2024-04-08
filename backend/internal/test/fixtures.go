package test

import (
	"database/sql"

	"github.com/pkg/errors"

	"github.com/munu-brasil/munu/backend/service"
)

// FixtureMap represents the main definition which fixtures are available though Fixtures()
type FixtureMap struct{}

// Fixtures returns a function wrapping our fixtures, which tests are allowed to manipulate.
// Each test (which may run concurrently) receives a fresh copy, preventing side effects between test runs.
func Fixtures() FixtureMap {
	return FixtureMap{}
}

// Inserts defines the order in which the fixtures will be inserted
// into the test database
func Inserts() []service.SQLer {
	// f := Fixtures()

	return []service.SQLer{}
}

type Fixture struct {
	DB *sql.DB
}

func (f Fixture) Run() error {
	ins := Inserts()

	tx, err := f.DB.Begin()
	if err != nil {
		return err
	}

	err = func() error {
		for _, sqler := range ins {
			s, args := sqler.SQL()
			res, err := tx.Exec(s, args...)
			if err != nil {
				return err
			}
			affected, err := res.RowsAffected()
			if err != nil {
				return err
			}
			if affected == 0 {
				return errors.New("insert fixture " + s)
			}
			s, args = sqler.Cleanup()
			if len(s) == 0 {
				continue
			}
			_, err = tx.Exec(s, args...)
			if err != nil {
				return err
			}
		}
		return nil
	}()
	if err != nil {
		tx.Rollback()
		return err
	}

	err = tx.Commit()
	return err
}

func StrPtr(s string) *string {
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
