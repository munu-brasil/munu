package service

import (
	"time"

	"database/sql/driver"
	"encoding/json"
	"errors"
	"strings"

	"github.com/gofrs/uuid"
	"github.com/lib/pq"

	"gopkg.in/guregu/null.v3"
)

// Application types
const (
	ApplicationMunu = "munu"
)

type applicationIDValidator struct {
	list []string
}

func (cs applicationIDValidator) List() []string {
	return cs.list
}

func (cs applicationIDValidator) Validate(s string) bool {
	for _, item := range cs.list {
		if item == s {
			return true
		}
	}
	return false
}

var ValidApplID = applicationIDValidator{
	list: []string{
		ApplicationMunu,
	},
}

// UserInfo holds additional user information
type UserInfo struct {
}

// User is user
type User struct {
	UserID     uuid.UUID  `db:"user_id" json:"userID"`
	Name       string     `db:"name" json:"name"`
	Avatar     *string    `db:"avatar" json:"avatar,omitempty"`
	PushTokens PushTokens `db:"push_tokens" json:"pushTokens"`
	Info       UserInfo   `db:"info" json:"info"`
	ApplID     string     `db:"appl_id" json:"applID"`
	CreatedAt  time.Time  `db:"created_at" json:"createdAt"`
	DeletedAt  null.Time  `db:"deleted_at" json:"deletedAt"`
}

func (user User) TableName() string {
	return `"user"`
}

func (user User) AsFixture() Fixture {
	f := FixtureFromStruct(user, false)
	f.Table = user.TableName()
	return f
}

func (user User) Validate() error {
	validationErrors := NewModelValidationError("User")

	if len(strings.Trim(user.Name, " ")) == 0 {
		validationErrors.Append("name", "required")
	}
	if len(strings.Trim(user.ApplID, " ")) == 0 {
		validationErrors.Append("applID", "required")
	}
	return validationErrors.Check()
}

// UserUpdateForm model
type UserUpdateForm struct {
	Name   *string   `db:"name" json:"name,omitempty"`
	Avatar *string   `db:"avatar" json:"avatar,omitempty"`
	Info   *UserInfo `db:"info" json:"info,omitempty"`
}

func (user UserUpdateForm) Validate() error {
	validationErrors := NewModelValidationError("User")

	if user.Name != nil && len(strings.Trim(*user.Name, " ")) == 0 {
		validationErrors.Append("name", "required")
	}
	return validationErrors.Check()
}

// UserMe model
type UserMe struct {
	UserID    uuid.UUID `db:"user_id" json:"userID"`
	Email     *string   `db:"email" json:"email,omitempty"`
	Name      string    `db:"name" json:"name"`
	Avatar    *string   `db:"avatar" json:"avatar,omitempty"`
	Info      UserInfo  `db:"info" json:"info"`
	ApplID    string    `db:"appl_id" json:"applID"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
	DeletedAt null.Time `db:"deleted_at" json:"deletedAt"`
}

type ScannableUser struct {
	*User
}

// PushTokens is the column type for the table "User", a pq.StringArray
type PushTokens struct {
	pq.StringArray
}

type FormUserDoctor struct {
	ForDoctID uuid.UUID  `json:"forDoctID"`
	Name      string     `db:"name" json:"name"`
	Email     string     `db:"email" json:"email"`
	Password  string     `json:"password" example:"mypassword123"`
	SpecID    []int      `db:"spec_id" json:"specID"`
	SuofID    *uuid.UUID `db:"suof_id" json:"suofID"`
	LoginInfo
}

// verificar forma de reutilizar esse struct redundante
type LoginInfo struct {
	IP         string  `json:"ip" binding:"required" exemple:"127.0.0.1"`
	DeviceID   string  `json:"deviceID" binding:"required" exemple:"device_id"`
	DeviceName string  `json:"deviceName" binding:"required" exemple:"device_id"`
	Location   string  `json:"location" binding:"required" exemple:"Seattle - USA"`
	Coord      *string `db:"coord" json:"coord"`
}

type AuthenticationEmail struct {
	AuemID    int64     `db:"auem_id" json:"auemID"`
	UserID    uuid.UUID `db:"user_id" json:"userID"`
	Email     string    `db:"email" json:"email"`
	Password  []byte    `db:"password" json:"password"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
}

func (auth AuthenticationEmail) TableName() string {
	return "authentication_email"
}

func (auth AuthenticationEmail) AsFixture() Fixture {
	f := FixtureFromStruct(auth, false)
	f.Table = auth.TableName()
	f.ResetSerialColumn = &struct {
		SeqName string
		Value   int
	}{
		SeqName: "authentication_email_auem_id_seq",
		Value:   int(auth.AuemID) + 1,
	}
	return f
}

type ValidateEmail struct {
	Email  string `db:"email" json:"email"`
	ApplID string `db:"appl_id" json:"applID"`
}

type EmailValidateStatus struct {
	Email   string `db:"email" json:"email"`
	ApplID  string `db:"appl_id" json:"applID"`
	IsValid bool   `db:"is_valid" json:"isValid"`
}

func (ve *ValidateEmail) Validate() error {
	validationErrors := NewModelValidationError("ValidateEmail")
	if len(strings.TrimSpace(ve.Email)) == 0 {
		validationErrors.Append("email", "required")
	}
	if len(strings.TrimSpace(ve.ApplID)) == 0 {
		validationErrors.Append("applID", "required")
	}
	return validationErrors.Check()
}

// Value implements the driver Valuer interface.
func (i UserInfo) Value() (driver.Value, error) {
	b, err := json.Marshal(i)
	return driver.Value(b), err
}

// Scan implements the Scanner interface.
func (i *UserInfo) Scan(src interface{}) error {
	var source []byte
	// let's support string and []byte
	switch s := src.(type) {
	case string:
		source = []byte(s)
	case []byte:
		source = src.([]byte)
	default:
		return errors.New("incompatible type for UserInfo")
	}
	return json.Unmarshal(source, i)
}

// Value implements the driver Valuer interface.
func (i ScannableUser) Value() (driver.Value, error) {
	b, err := json.Marshal(i)
	return driver.Value(b), err
}

// Scan implements the Scanner interface.
func (i *ScannableUser) Scan(src interface{}) error {
	var source []byte
	/// let's support string and []byte
	switch s := src.(type) {
	case string:
		source = []byte(s)
	case []byte:
		source = src.([]byte)
	default:
		return errors.New("incompatible type for ScannableUser")
	}
	return json.Unmarshal(source, i)
}

// MarshalJSON implements the json.Marshaler interface.
func (c PushTokens) MarshalJSON() ([]byte, error) {
	jsonValue, err := json.Marshal(c.StringArray)
	if err != nil {
		return nil, err
	}
	return jsonValue, nil
}

// UnmarshalJSON implements the json.Unmarshaler interface.
func (c *PushTokens) UnmarshalJSON(b []byte) error {
	return json.Unmarshal(b, &c.StringArray)
}
