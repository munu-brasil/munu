package service

import (
	"time"

	"github.com/gofrs/uuid"
	"gopkg.in/guregu/null.v3"
)

type ActionVerification struct {
	AcveID       uuid.UUID `db:"acve_id" json:"acveID"`
	CreatedAt    time.Time `db:"created_at" json:"createdAt"`
	DeletedAt    null.Time `db:"deleted_at" json:"-"`
	Type         string    `db:"type" json:"type"`
	UserID       uuid.UUID `db:"user_id" json:"userID"`
	Verification string    `db:"verification" json:"-"`
}

type GetActionVerification struct {
	IsValid string `db:"is_valid" json:"isValid" binding:"required" example:"true"`
}
