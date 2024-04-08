package postgres

import (
	"database/sql"
	"log"
	"strings"

	"github.com/gofrs/uuid"
	"github.com/jmoiron/sqlx"
	sq "github.com/munu-brasil/munu/backend/lib/sqrl"
	"github.com/munu-brasil/munu/backend/service"
	"github.com/pkg/errors"
	"github.com/rs/xid"
)

type oauthUserAuthentication struct {
	service.User
	service.AuthenticationOauth
}

// ThirdPartyOnboarder service creates and/or signs in a User from a 3rd party provider
type ThirdPartyOnboarder struct {
	DB         *sqlx.DB
	JWTConfig  JWTConfig
	Logger     *log.Logger
	Mailer     Mailer
	Dispatcher *service.Dispatcher
}

// Run onboards a third party user
func (p *ThirdPartyOnboarder) Run(applID string, form service.OauthLoginForm) (a *service.AuthResponse, err error) {
	if len(strings.TrimSpace(applID)) == 0 {
		return nil, errors.New("appliID is required")
	}
	status := "logged"
	usr, err := from3rdPartyAuth(p.DB, form.User.Provider, applID, form.User.UserID)
	if err == nil && usr != nil {
		jwt, err := systemAuthenticatesUser(*usr, p.JWTConfig)
		if err != nil {
			status = "not logged"
		}
		p.checkNewDeviceLogin(applID, status, form, *usr)
		a = &service.AuthResponse{User: *usr, JWT: jwt}
		return a, errors.Wrap(err, "")
	}

	ver := form.User.RawData["verified_email"]
	if t, ok := ver.(bool); t && ok {
		usr, err = fromAnyEmail(p.DB, applID, form.User.Email)
		if err == nil && usr != nil {
			jwt, err := systemAuthenticatesUser(*usr, p.JWTConfig)
			if err != nil {
				status = "not logged"
			}
			p.checkNewDeviceLogin(applID, status, form, *usr)
			a = &service.AuthResponse{User: *usr, JWT: jwt}
			return a, errors.Wrap(err, "")
		}
		if err != nil {
			return nil, errors.Wrap(err, "account check")
		}
	}

	nuser, err := createOauthUser(p.DB, applID, &form.OauthProviderData)
	if err != nil {
		return nil, errors.Wrap(err, "create thirdparty user")
	}

	go service.NewUser(p.Dispatcher).Emit(service.EventNewUser{UserID: nuser.User.UserID})

	jwt, err := systemAuthenticatesUser(nuser.User, p.JWTConfig)
	if err != nil {
		status = "not logged"
	}
	p.checkNewDeviceLogin(applID, status, form, nuser.User)
	a = &service.AuthResponse{User: nuser.User, JWT: jwt}
	return a, errors.Wrap(err, "onboarded auth")
}

func (p *ThirdPartyOnboarder) checkNewDeviceLogin(applID, status string, form service.OauthLoginForm, usr service.User) {
	auloID := xid.New()
	loginInfo := service.LoginInfo{
		IP:         form.IP,
		DeviceID:   form.DeviceID,
		DeviceName: form.DeviceName,
		Location:   form.Location,
		Coord:      form.Coord,
	}

	aulo := &attempingLoggin{
		AuloID:    auloID.String(),
		UserID:    usr.UserID,
		Status:    status,
		LoginInfo: loginInfo,
	}

	alertEmail := checkingNewDeviceLogin(p.DB, p.Logger, usr.UserID, aulo)
	if alertEmail != nil {
		errSendMail := p.Mailer.SendAlertNewDeviceLogin(*alertEmail, "")
		if errSendMail != nil {
			p.Logger.Println("Error send mail alert new device login: " + errSendMail.Error())
		}
	}
}

func from3rdPartyAuth(db service.DB, applID, provider, id string) (*service.User, error) {
	usr := service.User{}
	query := psql.Select(
		"u.user_id", "u.created_at", "u.deleted_at", "u.avatar", "u.appl_id", `u."name"`, "u.info",
	).
		From(`authentication_oauth auo`).
		Join(`"user" u USING(user_id)`).
		Where(sq.Eq{"provider": provider, "external_id": id, "appl_id": applID})

	qSQL, args, err := query.ToSql()
	if err != nil {
		return &usr, err
	}
	err = db.Get(&usr, qSQL, args...)
	return &usr, err
}

// createOauthUser inserts a user into the database
func createOauthUser(tx service.DB, applID string, u *service.OauthProviderData) (*oauthUserAuthentication, error) {
	id, err := uuid.NewV4()
	if err != nil {
		return nil, errors.Wrap(err, "generating user uuid")
	}

	query := psql.Select(
		"user_id", "appl_id", "info", `"name"`, "avatar",
		"created_at", "deleted_at", "provider", "external_id", "provider_data", "auoa_id").
		From("result").
		Prefix(`
			WITH
			inserted_user AS (
				INSERT INTO "user" (user_id, appl_id, "name", avatar) VALUES (?, ?, ?, ?)
				RETURNING user_id, appl_id, "name", avatar, info, created_at, deleted_at, push_tokens
			),
			inserted_auth AS (
				INSERT INTO authentication_oauth (user_id, email, provider, external_id, provider_data)
				SELECT user_id, ?, ?, ?, ?
				FROM inserted_user
				RETURNING auoa_id, user_id, email, provider, external_id, provider_data
			),
			result AS (
				SELECT
					user_id, appl_id, email, "name", avatar, info,
					created_at, deleted_at, provider, external_id, provider_data, auoa_id
				FROM inserted_user
				JOIN inserted_auth USING (user_id)
			)
		`, id, applID, strings.Join([]string{u.User.FirstName, u.User.LastName}, " "), u.User.AvatarURL, u.User.Email, u.User.Provider, u.User.UserID, u)

	qSQL, args, err := query.ToSql()
	if err != nil {
		return nil, errors.Wrap(err, "generating user sql")
	}
	res := oauthUserAuthentication{}
	err = tx.Get(&res, qSQL, args...)
	if err != nil {
		return nil, errors.Wrap(err, "inserting user")
	}

	return &res, nil
}

// fromAnyEmail return user from email for 3p or system account
func fromAnyEmail(db service.DB, appldID, email string) (usr *service.User, err error) {
	usr = &service.User{}
	query := psql.Select(
		"u.user_id", "u.created_at", "u.deleted_at", "u.avatar", "u.appl_id", `u."name"`, "u.info", "u.push_tokens",
	).
		From(`"user" u`).
		LeftJoin("authentication_email ae using(user_id)").
		LeftJoin("authentication_oauth ao using(user_id)").
		Where(sq.Eq{"appl_id": appldID}).
		Where(sq.Eq{"deleted_at": nil}).
		Where("lower(trim(ae.email)) = lower(trim(?)) OR lower(trim(ao.email)) = lower(trim(?))", email, email)

	qSQL, args, err := query.ToSql()
	if err != nil {
		return usr, err
	}
	err = db.Get(usr, qSQL, args...)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return usr, err
	}
	return usr, err
}
