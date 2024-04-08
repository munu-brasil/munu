package service

import (
	"time"

	"github.com/gofrs/uuid"
	"gopkg.in/guregu/null.v3"
)

// OneTimeLogin represent table one_time_login
type OneTimeLogin struct {
	OtloID     int64     `db:"otlo_id" json:"otloID"`
	UserID     uuid.UUID `db:"user_id" json:"userID"`
	Token      uuid.UUID `db:"token" json:"token"`
	ValidUntil time.Time `db:"valid_until" json:"validUntil"`
	DeletedAt  null.Time `db:"deleted_at" json:"deletedAt"`
	CreatedAt  time.Time `db:"created_at" json:"createdAt"`
}

func (OneTimeLogin) TableName() string {
	return "one_time_login"
}

func (c OneTimeLogin) AsFixture() Fixture {
	f := FixtureFromStruct(c, false)
	f.Table = c.TableName()
	return f
}

type OneTimeLoginForm struct {
	UserID     uuid.UUID `db:"user_id" json:"userID"`
	ValidUntil time.Time `db:"valid_until" json:"validUntil"`
}
