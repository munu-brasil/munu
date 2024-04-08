package service

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"html/template"

	"github.com/gofrs/uuid"
)

type AccessModel string

const (
	TokenAccessModel = AccessModel("token")
	LinkAccessModel  = AccessModel("link")
)

// TwoFactorRequest email Model
type TwoFactorRequest struct {
	Name            string
	PasswordNumber  string
	ConfirmationURL string
	Email           string
	ImagesTemplate  string
}

// AlertNewDeviceLogin Model
type AlertNewDeviceLogin struct {
	UserID          uuid.UUID `db:"user_id" json:"userID"`
	RecipientName   string    `db:"recipient_name" json:"recipientName"`
	RecipientEmail  string    `db:"recipient_email" json:"recipientEmail"`
	Location        string    `db:"location" json:"location"`
	Date            string    `db:"date" json:"date"`
	AlertEmail      bool      `db:"alert_email" json:"alertEmail"`
	ImagesTemplate  string    `db:"images_template" json:"imagesTemplate"`
	ImagesAgentType string    `db:"images_agent_type" json:"imagesAgentType"`
	InvitationLink  string    `db:"invitation_link" json:"invitationLink"`
}

type DefaultEmail struct {
	BackgroundImage string
	ImagesTemplate  string
	Header          SectionTexts
	Title           string
	Message         string
	Sections        []SectionItem
	TextBody        string
	Subject         string
	RecipientName   string
	RecipientEmail  string
	SenderName      string
	Attachments     []MessageAttachment
}

type SectionItem struct {
	Title string       `db:"title"`
	Texts SectionTexts `db:"texts"`
}

type SectionTexts []template.HTML
type SectionItems []SectionItem

type MessageAttachment struct {
	URL  string
	Name string
}

type notificationChannel string

const (
	NotificationChannelPhone notificationChannel = "phone"
	NotificationChannelEmail notificationChannel = "email"
)

type NotificationChannels []notificationChannel

func (nc NotificationChannels) Validate() error {
	validationErrors := NewModelValidationError("NotificationChannels")

	for _, c := range nc {
		if c != NotificationChannelEmail && c != NotificationChannelPhone {
			validationErrors.Append("value", "invalid channel: "+string(c))
		}
	}

	return validationErrors.Check()
}

func (nc NotificationChannels) Has(ch notificationChannel) bool {

	for _, c := range nc {
		if c == ch {
			return true
		}
	}

	return false
}

type RecipientData struct {
	Name  string `db:"name" json:"name"`
	Email string `db:"email" json:"email"`
}
type RecipientsData []RecipientData

// Value implements the driver Valuer interface.
func (i SectionItems) Value() (driver.Value, error) {
	b, err := json.Marshal(i)
	return driver.Value(b), err
}

// Scan implements the Scanner interface.
func (i *SectionTexts) Scan(src interface{}) error {
	var source []byte

	switch t := src.(type) {
	case string:
		source = []byte(t)
	case []byte:
		source = src.([]byte)
	default:
		return errors.New("incompatible type for SectionTexts")
	}
	return json.Unmarshal(source, i)
}

// Value implements the driver Valuer interface.
func (i SectionTexts) Value() (driver.Value, error) {
	b, err := json.Marshal(i)
	return driver.Value(b), err
}

// Scan implements the Scanner interface.
func (i *SectionItems) Scan(src interface{}) error {
	var source []byte

	switch t := src.(type) {
	case string:
		source = []byte(t)
	case []byte:
		source = src.([]byte)
	default:
		return errors.New("incompatible type for SectionItems")
	}
	return json.Unmarshal(source, i)
}

// Scan implements the Scanner interface.
func (i *RecipientsData) Scan(src interface{}) error {
	var source []byte

	switch t := src.(type) {
	case string:
		source = []byte(t)
	case []byte:
		source = src.([]byte)
	default:
		return errors.New("incompatible type for RecipientsData")
	}
	return json.Unmarshal(source, i)
}

// Value implements the driver Valuer interface.
func (i RecipientsData) Value() (driver.Value, error) {
	b, err := json.Marshal(i)
	return driver.Value(b), err
}
