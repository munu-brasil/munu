package types

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"reflect"
	"strings"
	"time"
)

// Time is a nullable time.Time. It supports SQL and JSON serialization.
// It will marshal to null if null.
type Date struct {
	Date  time.Time
	Valid bool
}

// Scan implements the Scanner interface.
func (d *Date) Scan(value interface{}) error {
	var err error
	switch x := value.(type) {
	case time.Time:
		f := x.Format("2006-01-02")
		date, e := time.Parse("2006-01-02", f)
		err = e
		d.Date = date
	case nil:
		d.Valid = false
		return nil
	default:
		err = fmt.Errorf("null: cannot scan type %T into lib.Date: %v", value, value)
	}
	d.Valid = err == nil
	return err
}

// Value implements the driver Valuer interface.
func (d Date) Value() (driver.Value, error) {
	if !d.Valid {
		return nil, nil
	}
	return d.Date, nil
}

// NewDate creates a new Date.
func NewDate(t time.Time) Date {
	f := t.Format("2006-01-02")
	date, err := time.Parse("2006-01-02", f)
	return Date{
		Date:  date,
		Valid: err == nil,
	}
}

// DateFromPtr creates a new Date that will be null if t is nil.
func DateFromPtr(t *time.Time) Date {
	if t == nil {
		return Date{
			Date:  time.Now(),
			Valid: false,
		}
	}
	return NewDate(*t)
}

// DateFromString creates a new date from a string.
func DateFromString(t string) Date {
	date, err := time.Parse("2006-01-02", t)
	return Date{
		Date:  date,
		Valid: err == nil,
	}
}

// ValueOrZero returns the inner value if valid, otherwise zero.
func (d Date) ValueOrZero() time.Time {
	if !d.Valid {
		return time.Time{}
	}
	return d.Date
}

// MarshalJSON implements json.Marshaler.
// It will encode null if this time is null.
func (d Date) MarshalJSON() ([]byte, error) {
	if !d.Valid {
		return []byte("null"), nil
	}
	return []byte(`"` + d.Date.Format("2006-01-02") + `"`), nil
}

// UnmarshalJSON implements json.Unmarshaler.
// It supports string, object (e.g. pq.LibDate and friends)
// and null input.
func (d *Date) UnmarshalJSON(data []byte) error {
	var err error
	var v interface{}
	if err = json.Unmarshal(data, &v); err != nil {
		return err
	}
	switch x := v.(type) {
	case string:
		if len(strings.TrimSpace(x)) > 0 {
			tt, err := time.Parse("2006-01-02", x)
			if err != nil {
				return err
			}
			d.Date = tt
		} else {
			d.Valid = false
			return nil
		}
	case map[string]interface{}:
		ti, tiOK := x["Time"].(string)
		valid, validOK := x["Valid"].(bool)
		if !tiOK || !validOK {
			return fmt.Errorf(`json: unmarshalling object into Go value of type lib.Date requires key "Time" to be of type string and key "Valid" to be of type bool; found %T and %T, respectively`, x["Time"], x["Valid"])
		}
		tt, err := time.Parse("2006-01-02", ti)
		if err != nil {
			return err
		}
		d.Date = tt
		d.Valid = valid
		return err
	case nil:
		d.Valid = false
		return nil
	default:
		err = fmt.Errorf("json: cannot unmarshal %v into Go value of type lib.Date", reflect.TypeOf(v).Name())
	}
	d.Valid = err == nil
	return err
}

func (d Date) MarshalText() ([]byte, error) {
	if !d.Valid {
		return []byte("null"), nil
	}
	return []byte(d.Date.Format("2006-01-02")), nil
}

func (d *Date) UnmarshalText(text []byte) error {
	str := string(text)
	if str == "" || str == "null" {
		d.Valid = false
		return nil
	}
	_, err := time.Parse("2006-01-02", str)
	if err != nil {
		return err
	}
	d.Valid = true
	return nil
}

// SetValue changes this Time's value.
func (d *Date) SetValue(v time.Time) {
	f := v.Format("2006-01-02")
	date, err := time.Parse("2006-01-02", f)
	d.Date = date
	d.Valid = err == nil
}

// Ptr returns a pointer to this Time's value, or a nil pointer if this Time is null.
func (d Date) Ptr() *time.Time {
	if !d.Valid {
		return nil
	}
	return &d.Date
}

// IsZero returns true for invalid Times, hopefully for future omitempty support.
// A non-null Time with a zero value will not be considered zero.
func (d Date) IsZero() bool {
	return !d.Valid
}

// Equal returns true if both Time objects encode the same time or are both null.
// Two times can be equal even if they are in different locations.
// For example, 6:00 +0200 CEST and 4:00 UTC are Equal.
func (d Date) Equal(other Date) bool {
	return d.Valid == other.Valid && (!d.Valid || d.Date.Equal(other.Date))
}

// ExactEqual returns true if both Time objects are equal or both null.
// ExactEqual returns false for times that are in different locations or
// have a different monotonic clock reading.
func (d Date) ExactEqual(other Date) bool {
	return d.Valid == other.Valid && (!d.Valid || d.Date == other.Date)
}
