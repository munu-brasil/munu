package postgres

import (
	"database/sql"
	"fmt"
	"math/rand"
	"time"

	"github.com/gofrs/uuid"
	"github.com/pkg/errors"

	sq "github.com/munu-brasil/munu/backend/lib/sqrl"

	"github.com/munu-brasil/munu/backend/service"
)

type confirmationType string

const (
	vEmail = confirmationType("email")
	vPwd   = confirmationType("password")
	vAuth  = confirmationType("authenticate")
)

func NewActionVerification(u uuid.UUID, t confirmationType) (*service.ActionVerification, string, error) {
	randomID := fmt.Sprintf("%06d", rand.Intn(999999))

	v, err := PasswordGen(randomID)
	if err != nil {
		return nil, "", err
	}

	resetUUID, err := uuid.NewV4()
	if err != nil {
		return nil, "", err
	}
	acve := &service.ActionVerification{
		AcveID:       resetUUID,
		UserID:       u,
		Verification: string(v),
		Type:         string(t),
	}

	return acve, randomID, nil
}

func confirmationSave(db service.DB, acve *service.ActionVerification) (*service.ActionVerification, error) {

	ins := psql.Insert("action_verification").
		Columns("acve_id", "user_id", "verification", "type", "created_at").
		Values(acve.AcveID, acve.UserID, acve.Verification, acve.Type, time.Now()).
		Suffix("RETURNING acve_id, user_id, type, created_at")

	qSQL, args, err := ins.ToSql()
	if err != nil {
		return nil, err
	}

	err = db.Get(acve, qSQL, args...)
	if err != nil {
		return nil, errors.Wrap(err, "inserting")
	}
	return acve, nil

}

func confirmationDelete(db service.DB, u *service.ActionVerification) error {
	del := psql.Update("action_verification").
		Set("deleted_at", time.Now()).
		Where(sq.Eq{"acve_id": u.AcveID, "user_id": u.UserID})

	qSQL, args, err := del.ToSql()
	if err != nil {
		return err
	}

	_, err = db.Exec(qSQL, args...)
	return err
}

func confirmationFromID(tx service.DB, acveID string) (service.ActionVerification, error) {
	psrt := service.ActionVerification{}
	query := psql.Select(
		"acve_id",
		"created_at",
		"deleted_at",
		"type",
		"user_id",
		"verification",
	).
		From("action_verification").
		Where(sq.Eq{"acve_id": acveID, "deleted_at": nil}).
		Where("expire_at >= NOW()")

	qSQL, args, err := query.ToSql()
	if err != nil {
		return psrt, errors.Wrap(err, "generate sql")
	}

	err = tx.Get(&psrt, qSQL, args...)
	if err != nil {
		if err == sql.ErrNoRows {
			return psrt, &service.PwdResetInvalidError{
				Message: "No such reset token: " + acveID,
			}
		}
		return psrt, errors.Wrap(err, "get")
	}
	return psrt, nil
}
