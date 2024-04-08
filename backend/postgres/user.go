package postgres

import (
	"database/sql"
	"strings"

	"github.com/gofrs/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"

	"github.com/munu-brasil/munu/backend/lib/sql_"
	sq "github.com/munu-brasil/munu/backend/lib/sqrl"
	"github.com/munu-brasil/munu/backend/service"
)

var psql = sq.StatementBuilder.PlaceholderFormat(sq.Dollar)

// UserAuthentication holds auth data
type AuthenticationData struct {
	Email    string
	Password []byte
}

// UserAuthentication holds user auth data
// the order matters here, as the first duplicated property will be filled by sqlx
type UserAuthentication struct {
	service.User
	AuthenticationData
	Permissions service.UserPermissions
}

// NewUser creates a new user model
func NewUser(email, password, name, applID string) (*UserAuthentication, error) {
	id, err := uuid.NewV4()
	if err != nil {
		return nil, errors.Wrap(err, "user uuid")
	}

	matched := service.HasDigitsAndCharacters(password)

	if !matched || len(password) < 8 {
		return nil, errors.New("Password invalid! It must have at least eight caracters (letters and numbers)")
	}

	passHash, err := PasswordGen(password)
	if err != nil {
		return nil, errors.Wrap(err, "hash password")
	}
	return &UserAuthentication{
		User: service.User{
			UserID: id,
			Name:   name,
			ApplID: applID,
		},
		AuthenticationData: AuthenticationData{
			Email:    email,
			Password: passHash,
		},
		Permissions: service.UserPermissions{},
	}, nil
}

// UserGetter service to return user
type UserGetter struct {
	DB *sqlx.DB
}

// Run return user from id
func (g *UserGetter) Run(asUserID, userID uuid.UUID) (*service.User, error) {
	if asUserID.IsNil() || asUserID.String() != userID.String() {
		return nil, service.NewForbiddenError()
	}
	tx, err := g.DB.Beginx()
	if err != nil {
		return nil, err
	}
	u, err := fromUserID(tx, userID)
	if err != nil {
		tx.Rollback()
		return nil, err
	}
	err = tx.Commit()
	if err != nil {
		tx.Rollback()
	}
	return &u.User, err
}

// UserUpdater service to return user
type UserUpdater struct {
	DB *sqlx.DB
}

// Run return user from id
func (uum *UserUpdater) Run(usr *service.User) (*service.User, error) {
	err := usr.Validate()
	if err != nil {
		return nil, err
	}

	query := psql.Update(`"user"`).
		Set("avatar", usr.Avatar).
		Set("name", usr.Name).
		Set("info", usr.Info).
		Set("push_tokens", usr.PushTokens).
		Where(sq.Eq{"user_id": usr.UserID}).
		Suffix("RETURNING *")

	qSQL, args, err := query.ToSql()
	if err != nil {
		return nil, errors.Wrap(err, "user update sql")
	}

	updatedUser := service.User{}
	err = uum.DB.Get(&updatedUser, qSQL, args...)
	if err != nil {
		return nil, errors.Wrap(err, "user update exec")
	}

	return &updatedUser, nil
}

// UserPatch service to return user
type UserPatch struct {
	DB *sqlx.DB
}

// Run return user from id
func (uum *UserPatch) Run(asUserID, userID uuid.UUID, form service.UserUpdateForm) (*service.UserMe, error) {
	if asUserID.IsNil() || asUserID.String() != userID.String() {
		return nil, service.NewForbiddenError()
	}

	err := form.Validate()
	if err != nil {
		return nil, err
	}

	tx, err := uum.DB.Beginx()
	if err != nil {
		return nil, err
	}

	defer func() {
		if err != nil {
			e2 := tx.Rollback()
			if e2 != nil {
				err = errors.Wrap(err, "rollback: "+e2.Error())
			}
		}
	}()

	if form.Avatar != nil || form.Name != nil || form.Info != nil {
		_, err = userPatch(tx, userID, form)
		if err != nil {
			return nil, err
		}
	}

	err = tx.Commit()
	if err != nil {
		return nil, err
	}

	return getUserMe(uum.DB, userID)
}

func userPatch(db service.DB, userID uuid.UUID, form service.UserUpdateForm) (*service.User, error) {

	query := psql.Update(`"user"`).
		Where(sq.Eq{"user_id": userID}).
		Suffix("RETURNING *")

	if form.Avatar != nil {
		query = query.Set("avatar", form.Avatar)
	}
	if form.Name != nil {
		query = query.Set("name", form.Name)
	}
	if form.Info != nil {
		query = query.Set("info", form.Info)
	}

	qSQL, args, err := query.ToSql()
	if err != nil {
		return nil, errors.Wrap(err, "user patch sql")
	}

	resp := service.User{}
	err = db.Get(&resp, qSQL, args...)
	if err != nil {
		return nil, errors.Wrap(err, "user patch exec")
	}

	return &resp, nil
}

// PushTokenSetter service to set a user's push token
type PushTokenSetter struct {
	DB *sqlx.DB
}

// Run create new user
func (c *PushTokenSetter) Run(userID uuid.UUID, token string) error {
	query := psql.Update(`"user"`).
		Set("push_tokens", sq.Expr(`Array[?]`, token)).
		Where(sq.Eq{"user_id": userID}).
		Suffix("RETURNING *")

	qSQL, args, err := query.ToSql()
	if err != nil {
		return errors.Wrap(err, "Error generating user sql")
	}

	_, err = c.DB.Exec(qSQL, args...)
	if err != nil {
		return errors.Wrap(err, "Error inserting user")
	}
	return nil
}

// ValidateEmailService service to return email is valid
type ValidateEmailService struct {
	DB *sqlx.DB
}

// Run returns if email is valid for appl_id
func (ve *ValidateEmailService) Run(veb service.ValidateEmail) (*service.EmailValidateStatus, error) {
	if err := veb.Validate(); err != nil {
		return nil, err
	}

	email := strings.TrimSpace(veb.Email)
	exists, err := existsUser(ve.DB, email, veb.ApplID)
	if err != nil {
		return nil, err
	}

	resp := service.EmailValidateStatus{
		Email:   veb.Email,
		ApplID:  veb.ApplID,
		IsValid: !exists,
	}

	return &resp, nil
}

// createUser inserts a user into the database
func createUser(tx service.DB, u *UserAuthentication) (*UserAuthentication, error) {
	id, err := uuid.NewV4()
	if err != nil {
		return nil, errors.Wrap(err, "generating user uuid")
	}

	// normalize email
	email := strings.TrimSpace(u.Email)
	u.Email = email
	exists, err := existsUser(tx, u.Email, u.ApplID)
	if err != nil {
		return nil, err
	}

	if exists {
		return nil, errors.New("Already exists user with this email")
	}

	query := psql.Select(
		"user_id", "appl_id", "info", `"name"`, "avatar",
		"created_at", "deleted_at", "email", "password").
		From("result").
		Prefix(`
			WITH
			inserted_user AS (
				INSERT INTO "user" (user_id, appl_id, "name", avatar) VALUES (?, ?, ?, ?)
				RETURNING user_id, appl_id, "name", avatar, info, created_at, deleted_at, push_tokens
			),
			inserted_auth AS (
				INSERT INTO authentication_email (user_id, email, password)
				SELECT user_id, ?, ?
				FROM inserted_user
				RETURNING user_id, email, password
			),
			result AS (
				SELECT
					user_id, appl_id, email, "name", avatar, info,
					created_at, deleted_at, password
				FROM inserted_user
				JOIN inserted_auth USING (user_id)
			)
		`, id, u.ApplID, u.Name, u.Avatar, u.Email, u.Password)

	qSQL, args, err := query.ToSql()
	if err != nil {
		return nil, errors.Wrap(err, "generating user sql")
	}

	err = tx.Get(u, qSQL, args...)
	if err != nil {
		return nil, errors.Wrap(err, "inserting user")
	}

	return u, nil
}

// existsUser to verify if user exists
func existsUser(tx service.DB, email, applID string) (bool, error) {
	vUsr := struct {
		Exists bool `db:"exists_user"`
	}{}
	query := psql.Select(`
		CASE
			WHEN user_id IS NOT NULL THEN true
			ELSE false
		END AS exists_user`).
		From(`"user"`).
		LeftJoin("authentication_email ae using(user_id)").
		LeftJoin("authentication_oauth ao using(user_id)").
		Where(sq.Eq{"appl_id": applID, "deleted_at": nil}).
		Where("lower(trim(ae.email)) = lower(trim(?)) OR lower(trim(ao.email)) = lower(trim(?))", email, email)

	qSQL, args, err := query.ToSql()
	if err != nil {
		return true, errors.Wrap(err, "Error generating exists user sql")
	}

	err = tx.Get(&vUsr, qSQL, args...)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return true, errors.Wrap(err, "Error checking exists user")
	}

	return vUsr.Exists, nil
}

// UserMeGetter service to return user
type UserMeGetter struct {
	DB *sqlx.DB
}

// Run return user from id
func (uum *UserMeGetter) Run(asUserID, userID uuid.UUID) (*service.UserMe, error) {
	if asUserID.IsNil() || asUserID.String() != userID.String() {
		return nil, service.NewForbiddenError()
	}

	res, err := getUserMe(uum.DB, userID)

	return res, err
}

func getUserMe(db service.DB, userID uuid.UUID) (*service.UserMe, error) {

	query := psql.Select(
		sql_.Ref(`"user"`, "user_id"),
		sql_.As(sql_.Coalesce(sql_.Ref("authentication_email", "email"), sql_.Ref("authentication_oauth", "email")), "email"),
		sql_.Ref(`"user"`, "name"),
		sql_.Ref(`"user"`, "avatar"),
		sql_.Ref(`"user"`, "info"),
		sql_.Ref(`"user"`, "appl_id"),
		sql_.Ref(`"user"`, "created_at"),
		sql_.Ref(`"user"`, "deleted_at")).
		From(`"user"`).
		LeftJoin(sql_.Using("authentication_email", "user_id")).
		LeftJoin(sql_.Using("authentication_oauth", "user_id")).
		Where(sq.Eq{"user_id": userID})

	qSQL, args, err := query.ToSql()
	if err != nil {
		return nil, errors.Wrap(err, "userMe get sql")
	}

	resp := service.UserMe{}
	err = db.Get(&resp, qSQL, args...)
	if err != nil {
		return nil, errors.Wrap(err, "userMe get exec")
	}

	return &resp, nil
}
