package postgres

import (
	"database/sql"
	"log"
	"strings"
	"time"

	"github.com/gofrs/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"
	"github.com/rs/xid"

	"golang.org/x/crypto/bcrypt"

	jwt "github.com/golang-jwt/jwt/v5"
	sq "github.com/munu-brasil/munu/backend/lib/sqrl"

	wphash "github.com/GerardSoleCa/wordpress-hash-go"
	"github.com/munu-brasil/munu/backend/service"
)

// PasswordGen generates the password hash
func PasswordGen(pass string) ([]byte, error) {
	return bcrypt.GenerateFromPassword([]byte(pass), 12)
}

// LoginForm model to login in application
type LoginForm struct {
	Email      string `json:"email" binding:"required" example:"user@mail.com"`
	Password   string `json:"password" binding:"required" example:"mypassword123"`
	ApplID     string `json:"applID" binding:"required" example:"munu"`
	RememberMe bool   `json:"rememberMe"`
	service.LoginInfo
}

// TokenLoginForm model to login in application
type TokenLoginForm struct {
	AcveID       string `json:"acveID" binding:"required" example:"user@mail.com"`
	Verification string `json:"verification" binding:"required" example:"123456"`
	service.LoginInfo
}

type attempingLoggin struct {
	AuloID string    `json:"auloID" binding:"required" example:"bs3g5a8t874ckhbhqvk0"`
	UserID uuid.UUID `json:"userID" binding:"required" example:"d59719d5-cffe-474c-a907-8b900e9e8et4"`
	Status string    `json:"status" example:"logged"`
	Token  *string
	service.LoginInfo
}

type Mailer interface {
	SendAlertNewDeviceLogin(service.AlertNewDeviceLogin, string) error
	SendPwdResetRequest(service.TwoFactorRequest, service.AccessModel) error
	SendAuthenticationRequest(service.TwoFactorRequest, service.AccessModel) error
}

// Authenticator Service
type Authenticator struct {
	DB        *sqlx.DB
	Logger    *log.Logger
	Mailer    Mailer
	JWTConfig JWTConfig
}

type JWTConfig struct {
	Secret          string
	HoursTillExpire time.Duration
	SigningMethod   *jwt.SigningMethodHMAC
}

// ValidOneTime model
type ValidOneTime struct {
	Valid  bool       `db:"valid"`
	UserID *uuid.UUID `db:"user_id"`
}

// EmailLogin anthenticator
func (u *Authenticator) EmailLogin(log *LoginForm) (a *service.AuthResponse, err error) {
	if u.Mailer == nil {
		return nil, errors.New("missing mailer service")
	}
	usr, err := fromEmail(u.DB, log.Email, log.ApplID)
	if err != nil {
		return nil, errors.Wrap(err, "user from email")
	}

	jwt, err := authenticate(*usr, log.Password, u.JWTConfig)

	status := "not logged"
	if len(jwt) > 0 {
		status = "logged"
	}

	auloID := xid.New()

	loginInfo := service.LoginInfo{
		IP:         log.IP,
		DeviceID:   log.DeviceID,
		DeviceName: log.DeviceName,
		Location:   log.Location,
		Coord:      log.Coord,
	}

	aulo := &attempingLoggin{
		AuloID:    auloID.String(),
		UserID:    usr.User.UserID,
		Status:    status,
		Token:     &jwt,
		LoginInfo: loginInfo,
	}

	alertEmail := checkingNewDeviceLogin(u.DB, u.Logger, usr.User.UserID, aulo)
	if alertEmail != nil {
		errSendMail := u.Mailer.SendAlertNewDeviceLogin(*alertEmail, log.DeviceName)
		if errSendMail != nil {
			u.Logger.Println("Error send mail alert new device login: " + errSendMail.Error())
		}
	}

	roles := service.GetRoleByPermissions(usr.Permissions).StringArray()
	a = &service.AuthResponse{User: usr.User, JWT: jwt, Roles: roles}
	return a, err
}

// OneTimeLogin anthenticator
func (u *Authenticator) OneTimeLogin(token string) (*service.AuthResponse, error) {
	res, err := validOneTimeLogin(u.DB, token)
	if err != nil {
		return nil, err
	}

	if !res.Valid || res.UserID == nil {
		return nil, service.NewNotFoundError("Token invalid")
	}

	aRes, err := authenticateOneTime(u.DB, u.JWTConfig, res.UserID)
	if err != nil {
		return nil, err
	}

	return aRes, nil
}

// RefreshToken anthenticator
func (u *Authenticator) RefreshToken(userID uuid.UUID) (a *service.AuthResponse, err error) {
	usr, err := fromUserID(u.DB, userID)
	if err != nil {
		return nil, errors.Wrap(err, "user from id")
	}

	jwt, err := systemAuthenticatesUser(usr.User, u.JWTConfig)

	roles := service.GetRoleByPermissions(usr.Permissions).StringArray()
	a = &service.AuthResponse{User: usr.User, JWT: jwt, Roles: roles}
	return a, err
}

func authenticate(usr UserAuthentication, password string, cfg JWTConfig) (jwttoken string, err error) {
	err = validatePasswordHash([]byte(usr.Password), []byte(password))
	if err != nil {
		return jwttoken, &service.ValidationError{
			Messages: map[string]string{"password": "Wrong email/password combination"},
		}
	}

	return systemAuthenticatesUser(usr.User, cfg)
}

func systemAuthenticatesUser(usr service.User, cfg JWTConfig) (jwttoken string, err error) {
	claims := service.Claims{
		UserID: usr.UserID.String(),
		ApplID: usr.ApplID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(cfg.HoursTillExpire)),
		},
	}

	token := jwt.NewWithClaims(cfg.SigningMethod, claims)
	jwttoken, err = token.SignedString([]byte(cfg.Secret))

	return jwttoken, err
}

func checkingNewDeviceLogin(db service.DB, log *log.Logger, userID uuid.UUID, atlo *attempingLoggin) *service.AlertNewDeviceLogin {

	if atlo.Coord != nil && len(strings.TrimSpace(*atlo.Coord)) == 0 {
		s := "(0,0)"
		atlo.Coord = &s
	}

	newDevLogin := service.AlertNewDeviceLogin{}
	qSQL := `
			WITH
			all_names AS (
				SELECT user_id, name FROM "user"
			),
			insert_auth_log AS (
				INSERT INTO auth_log (aulo_id, user_id, ip, device_id, device_name, "location", coord, status, token)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
				RETURNING *
			),
			all_auth_log AS (
				SELECT * FROM insert_auth_log
				UNION ALL
				SELECT * FROM auth_log
			),
			last_auth_log_device AS (
				SELECT user_id, device_id, count(device_id) AS logged_with_device
				FROM all_auth_log
				WHERE status = 'logged'
				GROUP BY user_id, device_id
			),
			auth_log_device AS (
				SELECT lald.user_id, COALESCE(ae.email, ao.email) AS recipient_email, alna."name" AS recipient_name,
				COALESCE($6, '(0,0)')::varchar AS "location",
				TO_CHAR(now(), 'DD "de" Mon às HH24:MM') AS "date",
				CASE
					WHEN logged_with_device = 1 THEN TRUE
					ELSE FALSE
				END AS alert_email
				FROM last_auth_log_device lald
				LEFT JOIN "authentication_email" ae ON ae.user_id = lald.user_id
				LEFT JOIN "authentication_oauth" ao ON ao.user_id = lald.user_id
				JOIN all_names alna ON alna.user_id = lald.user_id
				WHERE lald.user_id = $2
				AND device_id = $4
			)
			SELECT user_id, recipient_email, recipient_name, "location", "date", alert_email
			FROM auth_log_device
			WHERE alert_email = true
			`
	args := []interface{}{atlo.AuloID, userID, atlo.IP, atlo.DeviceID, atlo.DeviceName, atlo.Location, atlo.Coord, atlo.Status, atlo.Token}

	err := db.Get(&newDevLogin, qSQL, args...)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil
		}
		log.Println("Error checking alert email: " + err.Error())
		return nil
	}

	return &newDevLogin
}

// PwdRecoverer is the service object to recover an User's password
type PwdRecoverer struct {
	DB     *sqlx.DB
	Mailer Mailer
	Config struct {
		AuthURL func(applID string) string
	}
}

// Run starts an User`s password reset flow
func (p *PwdRecoverer) Run(email string, applID string, resetURL, emailModel *string) (*service.ActionVerification, error) {
	u, err := fromEmail(p.DB, email, applID)
	if err != nil {
		return nil, errors.Wrap(err, "user for email "+email)
	}

	ac, secret, err := NewActionVerification(u.User.UserID, vPwd)
	if err != nil {
		return nil, errors.Wrap(err, "action confirmation")
	}

	tx, err := p.DB.Beginx()
	if err != nil {
		return nil, errors.Wrap(err, "begin transaction")
	}

	acve, err := confirmationSave(tx, ac)
	if err != nil {
		tx.Rollback()
		return nil, errors.Wrap(err, "insert action confirmation")
	}

	err = tx.Commit()
	if err != nil {
		tx.Rollback()
		return nil, errors.Wrap(err, "commit")
	}

	rstURL := p.Config.AuthURL(applID)
	if resetURL != nil {
		rstURL = *resetURL
	}
	confirmationURL := rstURL + "/" + ac.AcveID.String() + "/" + secret

	pwdReset := service.TwoFactorRequest{
		Name:            string(u.Name),
		PasswordNumber:  secret,
		ConfirmationURL: confirmationURL,
		Email:           u.Email,
	}

	model := service.TokenAccessModel
	if emailModel != nil {
		if *emailModel == string(service.LinkAccessModel) {
			model = service.LinkAccessModel
		}
	}
	err = p.Mailer.SendPwdResetRequest(pwdReset, model)
	if err != nil {
		return nil, errors.Wrap(err, "Failed to send")
	}
	return acve, nil
}

// PwdReseter service resets an User`s password
type PwdReseter struct {
	DB     *sqlx.DB
	Mailer Mailer
}

// Run resets an user's password
func (p *PwdReseter) Run(acveID, verification, password string) error {
	tx, err := p.DB.Beginx()
	if err != nil {
		return err
	}

	psrt, err := confirmationFromID(tx, acveID)
	if err != nil {
		tx.Rollback()
		return err
	}

	// validate verification
	err = bcrypt.CompareHashAndPassword([]byte(psrt.Verification), []byte(verification))
	if err != nil {
		tx.Rollback()
		return &service.ValidationError{
			Messages: map[string]string{"verification": "Invalid verification id"},
		}
	}

	matched := service.HasDigitsAndCharacters(password)

	if !matched || len(password) < 8 {
		return errors.New("Password invalid! It must have at least eight caracters (letters and numbers)")
	}

	if !matched || len(password) < 8 {
		tx.Rollback()
		return &service.ValidationError{
			Messages: map[string]string{"password": "Invalid password"},
		}
	}

	// update user password
	passHash, err := PasswordGen(password)
	if err != nil {
		tx.Rollback()
		return err
	}
	err = updatePassword(tx, psrt.UserID, passHash)
	if err != nil {
		tx.Rollback()
		return errors.Wrap(err, "Failed to update user password")
	}

	// remove verification
	err = confirmationDelete(tx, &psrt)
	if err != nil {
		tx.Rollback()
		return errors.Wrap(err, "Failed to update user password")
	}

	err = tx.Commit()
	if err != nil {
		tx.Rollback()
		return errors.Wrap(err, "Failed to commit password reset")
	}

	// TODO: send password reset email
	return nil
}

func updatePassword(tx service.DB, userID uuid.UUID, pass []byte) error {
	query := psql.Update(`authentication_email`).
		Set("password", pass).
		Where(sq.Eq{"user_id": userID})

	qSQL, args, err := query.ToSql()
	if err != nil {
		return errors.Wrap(err, "generating user password update sql")
	}

	_, err = tx.Exec(qSQL, args...)
	if err != nil {
		return errors.Wrap(err, "updating user password")
	}
	return nil
}

// GetActionVerification service to get a verification of resets an User`s password
type GetActionVerification struct {
	DB *sqlx.DB
}

// Run resets an user's password
func (gav *GetActionVerification) Run(acveID string, token string) (*service.GetActionVerification, error) {
	res, err := getPwdReseter(gav.DB, acveID, token)
	return res, err
}

func getPwdReseter(db service.DB, acveID string, verification string) (*service.GetActionVerification, error) {
	res := service.GetActionVerification{
		IsValid: "false",
	}
	psrt, err := confirmationFromID(db, acveID)
	if err != nil {
		return &res, err
	}

	// validate verification
	err = bcrypt.CompareHashAndPassword([]byte(psrt.Verification), []byte(verification))
	if err != nil {
		return &res, &service.ValidationError{
			Messages: map[string]string{"verification": "Invalid verification code"},
		}
	}
	res.IsValid = "true"
	return &res, nil
}

// EmailTokenAuthRequest holds data to start an emai token authentication process
type EmailTokenAuthRequest struct {
	Email      string
	ApplID     string
	emailModel *string
}

// EmailTokenAuth is the service object to authenticate an User by their email
type EmailTokenAuth struct {
	DB     *sqlx.DB
	Mailer Mailer
}

// Run starts an User`s password reset flow
func (p *EmailTokenAuth) Run(req EmailTokenAuthRequest) (*service.ActionVerification, error) {
	u, err := fromEmail(p.DB, req.Email, req.ApplID)
	if err != nil {
		return nil, errors.Wrap(err, "retrieve user for email "+req.Email)
	}

	ac, secret, err := NewActionVerification(u.User.UserID, vAuth)
	if err != nil {
		return nil, errors.Wrap(err, "create action confirmation")
	}

	tx, err := p.DB.Beginx()
	if err != nil {
		return nil, errors.Wrap(err, "begin transaction")
	}

	acve, err := confirmationSave(tx, ac)
	if err != nil {
		tx.Rollback()
		return nil, errors.Wrap(err, "insert action confirmation")
	}

	err = tx.Commit()
	if err != nil {
		tx.Rollback()
		return nil, errors.Wrap(err, "commit")
	}

	pwdReset := service.TwoFactorRequest{
		Name:            string(u.Name),
		PasswordNumber:  secret,
		ConfirmationURL: "",
		Email:           u.Email,
	}
	model := service.TokenAccessModel
	if req.emailModel != nil {
		if *req.emailModel == string(service.LinkAccessModel) {
			model = service.LinkAccessModel
		}
	}
	err = p.Mailer.SendAuthenticationRequest(pwdReset, model)
	if err != nil {
		return nil, errors.Wrap(err, "failed to send")
	}
	return acve, nil
}

// EmailTokenAuthenticator service signs in a User from a verification token
type EmailTokenAuthenticator struct {
	DB        *sqlx.DB
	Mailer    Mailer
	JWTConfig JWTConfig
	Logger    *log.Logger
}

// Run resets an user's password
func (p *EmailTokenAuthenticator) Run(form *TokenLoginForm) (a *service.AuthResponse, err error) {
	tx, err := p.DB.Beginx()
	if err != nil {
		return nil, err
	}

	psrt, err := confirmationFromID(tx, form.AcveID)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	// validate verification
	err = bcrypt.CompareHashAndPassword([]byte(psrt.Verification), []byte(form.Verification))
	if err != nil {
		tx.Rollback()
		return nil, &service.ValidationError{
			Messages: map[string]string{"verification": "Invalid verification id"},
		}
	}

	usr, err := fromUserID(tx, psrt.UserID)
	if err != nil {
		return nil, errors.Wrap(err, "user id")
	}

	jwt, err := systemAuthenticatesUser(usr.User, p.JWTConfig)
	status := "not logged"
	if len(jwt) > 0 {
		status = "logged"
	}

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
		UserID:    usr.User.UserID,
		Status:    status,
		Token:     &jwt,
		LoginInfo: loginInfo,
	}

	alertEmail := checkingNewDeviceLogin(tx, p.Logger, usr.User.UserID, aulo)
	if alertEmail != nil {
		errSendMail := p.Mailer.SendAlertNewDeviceLogin(*alertEmail, form.DeviceName)
		if errSendMail != nil {
			p.Logger.Println("Error send mail alert new device login: " + errSendMail.Error())
		}
	}

	roles := service.GetRoleByPermissions(usr.Permissions).StringArray()
	a = &service.AuthResponse{User: usr.User, JWT: jwt, Roles: roles}
	if err != nil {
		tx.Rollback()
		return nil, errors.Wrap(err, "auth")
	}

	// remove verification
	err = confirmationDelete(tx, &psrt)
	if err != nil {
		tx.Rollback()
		return nil, errors.Wrap(err, "fail remove")
	}

	err = tx.Commit()
	if err != nil {
		tx.Rollback()
		return nil, errors.Wrap(err, "commit trans.")
	}

	return a, nil
}

// fromEmail return user from email
func fromEmail(db service.DB, email, appldID string) (usr *UserAuthentication, err error) {
	usr = &UserAuthentication{}
	query := psql.Select()

	switch appldID {
	case service.ApplicationMunu:
		query = psql.Select(
			"u.user_id", "u.created_at", "u.deleted_at", "u.avatar", "u.appl_id", `u."name"`, "u.info", "u.push_tokens",
			"COALESCE(ae.email, ao.email) as email", "ae.password", "'[]'::JSONB AS permissions",
		).
			From(`"user" u`).
			LeftJoin("authentication_email ae using(user_id)").
			LeftJoin("authentication_oauth ao using(user_id)").
			Where(sq.Eq{"appl_id": appldID}).
			Where(sq.Eq{"deleted_at": nil}).
			Where("lower(trim(ae.email)) = lower(trim(?))", email)

	default:
		return nil, errors.New("unknown applID " + appldID)
	}

	qSQL, args, err := query.ToSql()
	if err != nil {
		return usr, err
	}

	err = db.Get(usr, qSQL, args...)
	if err != nil {
		if err == sql.ErrNoRows {
			return usr, &service.UserNotFoundError{
				Message: "No user with this email: " + string(email),
			}
		}
		return usr, err
	}
	return usr, err
}

// fromUserID return user from user_id
func fromUserID(db service.DB, userID uuid.UUID) (usr *UserAuthentication, err error) {
	usr = &UserAuthentication{}
	query := psql.Select(
		"u.user_id", "u.created_at", "u.deleted_at", "u.avatar", "u.appl_id", `u."name"`, "u.info",
		"COALESCE(ae.email, ao.email) as email", "ae.password", "'[]'::JSONB AS permissions",
	).
		From(`"user" u`).
		LeftJoin("authentication_email ae using(user_id)").
		LeftJoin("authentication_oauth ao using(user_id)").
		Where(sq.Eq{"deleted_at": nil}).
		Where(sq.Eq{"u.user_id": userID})

	qSQL, args, err := query.ToSql()
	if err != nil {
		return usr, err
	}
	err = db.Get(usr, qSQL, args...)
	if err != nil {
		if err == sql.ErrNoRows {
			return usr, &service.UserNotFoundError{
				Message: "No user with this id: " + userID.String(),
			}
		}
		return usr, err
	}
	return usr, err
}

func validatePasswordHash(hash, pswd []byte) error {
	wpPwdHashStart := "$P$B"
	if strings.HasPrefix(string(hash), wpPwdHashStart) {
		match := wphash.CheckPassword(string(pswd), string(hash))
		if !match {
			return errors.New("invalid WP hash match")
		}
		return nil
	}

	// validate verification
	err := bcrypt.CompareHashAndPassword(hash, pswd)
	return err

}
