package mailmaid

import (
	"html/template"

	"github.com/munu-brasil/munu/backend/service"
)

// SendEmail sends an email from the default template
func (m *Mailer) SendEmail(pr service.DefaultEmail) error {
	if len(pr.ImagesTemplate) == 0 {
		pr.ImagesTemplate = m.Config.ImagesTemplateURL
	}

	funcMap := template.FuncMap{
		"url": func(s string) template.URL {
			return template.URL(s)
		},
	}

	body, err := m.availableTemplates.DefaultEmailHTML.ParseWith(func(t *template.Template) *template.Template {
		return t.Funcs(funcMap)
	}, pr)
	if err != nil {
		return err
	}
	emailBody := body.String()

	to := pr.RecipientName + " <" + pr.RecipientEmail + ">"
	msg := message{
		To:       to,
		From:     m.Config.From,
		Subject:  pr.Subject,
		Body:     emailBody,
		TextBody: pr.TextBody,
	}

	for _, att := range pr.Attachments {
		a := messageAttachment{
			Name: att.Name,
			URL:  att.URL,
		}
		msg.Attachments = append(msg.Attachments, a)
	}

	_, err = sendMail(connection{
		SMTPHost:     m.Config.Host,
		SMTPUser:     m.Config.User,
		SMTPPassword: m.Config.Password,
		SMTPPort:     m.Config.Port,
	}, msg)
	return err
}
