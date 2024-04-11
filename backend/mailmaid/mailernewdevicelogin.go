package mailmaid

import (
	"os"

	"github.com/munu-brasil/munu/backend/service"
)

const (
	constComputer = "computer"
	constMobile   = "mobile"
)

// SendAlertNewDeviceLogin sending email to alert new device login
func (m *Mailer) SendAlertNewDeviceLogin(pr service.AlertNewDeviceLogin, deviceName string) error {

	imageType := gettingUserAgentType(deviceName)
	pr.ImagesAgentType = imageType

	body, err := m.availableTemplates.AlertNewDeviceLoginHTML.Parse(pr)
	if err != nil {
		return err
	}
	emailBody := body.String()
	subject := "Alerta de novo login"

	to := pr.RecipientName + " <" + pr.RecipientEmail + ">"
	_, err = sendMail(connection{
		SMTPHost:     m.Config.Host,
		SMTPUser:     m.Config.User,
		SMTPPassword: m.Config.Password,
		SMTPPort:     m.Config.Port,
	}, message{
		To:       to,
		From:     os.Getenv("MAIL_FROM"),
		Subject:  subject,
		Body:     emailBody,
		TextBody: "Detectamos uma nova sessão iniciada",
	})
	return err
}

func gettingUserAgentType(deviceName string) (deviceNameType string) {
	deviceNameType = "default.png"

	switch deviceName {
	case constComputer:
		deviceNameType = "computer.png"
	case constMobile:
		deviceNameType = "mobile.png"
	}

	return deviceNameType
}
