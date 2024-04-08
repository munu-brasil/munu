package service

import (
	"database/sql/driver"
	"encoding/json"

	"github.com/gofrs/uuid"
	"github.com/markbates/goth"
	"github.com/pkg/errors"
)

// AuthResponse Service Object Authentication
type AuthResponse struct {
	User  User     `json:"user"`
	JWT   string   `json:"jwt" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZXN0IjoidGVzdCJ9.MZZ7UbJRJH9hFRdBUQHpMjU4TK4XRrYP5UxcAkEHvxE."`
	Roles []string `db:"roles" json:"roles"`
}

type OauthLoginForm struct {
	OauthProviderData
	LoginInfo
}

type OauthProviderData struct {
	User goth.User `json:"user"`
}

// AuthenticationOauth represent table authentication_oauth
type AuthenticationOauth struct {
	AuoaID       int64             `db:"auoa_id" json:"auoaID"`
	UserID       uuid.UUID         `db:"user_id" json:"userID"`
	Email        string            `db:"email" json:"email"`
	Provider     string            `db:"provider" json:"provider"`
	ExternalID   string            `db:"external_id" json:"externalID"`
	ProviderData OauthProviderData `db:"provider_data" json:"providerData"`
}

func (AuthenticationOauth) TableName() string {
	return "authentication_oauth"
}

func (c AuthenticationOauth) AsFixture() Fixture {
	f := FixtureFromStruct(c, false)
	f.Table = c.TableName()
	f.ResetSerialColumn = &struct {
		SeqName string
		Value   int
	}{
		SeqName: "authentication_oauth_auoa_id_seq",
		Value:   int(c.AuoaID) + 1,
	}
	return f
}

// Value implements the driver Valuer interface.
func (i OauthProviderData) Value() (driver.Value, error) {
	b, err := json.Marshal(i)
	return driver.Value(b), err
}

// Scan implements the Scanner interface.
func (i *OauthProviderData) Scan(src interface{}) error {
	var source []byte

	switch val := src.(type) {
	case string:
		source = []byte(val)
	case []byte:
		source = val
	default:
		return errors.New("incompatible type for OauthProviderData")
	}
	return json.Unmarshal(source, i)
}
