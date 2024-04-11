package mailmaid

import (
	"bytes"
	"context"
	"encoding/json"
	"html/template"
	"os"
	"reflect"
	"strings"

	"github.com/munu-brasil/munu/backend/service"
	"github.com/ory/mail/v3"
	"github.com/pkg/errors"
)

type mailTemplate[T any] string

func (f mailTemplate[T]) Parse(data T) (bytes.Buffer, error) {
	var body bytes.Buffer

	html, err := os.ReadFile(string(f))
	if err != nil {
		return body, errors.Wrap(err, "read file")
	}

	t, err := template.New(string(f)).Parse(string(html))
	if err != nil {
		return body, errors.Wrap(err, "parse hmtl")
	}
	if err := t.Execute(&body, data); err != nil {
		return body, errors.Wrap(err, "build html")
	}
	return body, nil
}

func (f mailTemplate[T]) ParseWith(parse func(*template.Template) *template.Template, data T) (bytes.Buffer, error) {
	var body bytes.Buffer

	html, err := os.ReadFile(string(f))
	if err != nil {
		return body, errors.Wrap(err, "read file")
	}

	t, err := parse(template.New(string(f))).Parse(string(html))
	if err != nil {
		return body, errors.Wrap(err, "parse hmtl")
	}
	if err := t.Execute(&body, data); err != nil {
		return body, errors.Wrap(err, "build html")
	}
	return body, nil
}

type availableTemplates struct {
	ResetPasswordHtml         mailTemplate[service.TwoFactorRequest]
	ResetPasswordLinkHtml     mailTemplate[service.TwoFactorRequest]
	ConfirmRegistrationHtml   mailTemplate[service.TwoFactorRequest]
	EmailAuthenticateHTML     mailTemplate[service.TwoFactorRequest]
	EmailAuthenticateLinkHTML mailTemplate[service.TwoFactorRequest]
	AlertNewDeviceLoginHTML   mailTemplate[service.AlertNewDeviceLogin]
	DefaultEmailHTML          mailTemplate[service.DefaultEmail]
}

type Mailer struct {
	availableTemplates
	Config MailerConf
}

func p[T ~string](t *T, s, f string) {
	n := s + string(os.PathSeparator) + string(f)
	*t = T(n)
}

func NewMailer(conf MailerConf) *Mailer {
	tmplts := availableTemplates{}
	p(&tmplts.ResetPasswordHtml, conf.TemplatePath, "reset-password.html")
	p(&tmplts.ResetPasswordLinkHtml, conf.TemplatePath, "reset-password-link.html")
	p(&tmplts.ConfirmRegistrationHtml, conf.TemplatePath, "confirm-registration.html")
	p(&tmplts.EmailAuthenticateHTML, conf.TemplatePath, "email-authenticate.html")
	p(&tmplts.EmailAuthenticateLinkHTML, conf.TemplatePath, "email-authenticate-link.html")
	p(&tmplts.AlertNewDeviceLoginHTML, conf.TemplatePath, "alert-new-device-login.html")
	p(&tmplts.DefaultEmailHTML, conf.TemplatePath, "default.html")

	return &Mailer{
		Config:             conf,
		availableTemplates: tmplts,
	}
}

type MailerConf struct {
	Host,
	User,
	Password,
	From,
	TemplatePath,
	ImagesTemplateURL,
	BackgroundImageURL,
	PublicAddress string
	Port int
}

// SendPwdResetRequest sending email to reset password
func (m *Mailer) SendPwdResetRequest(pr service.TwoFactorRequest, model service.AccessModel) error {

	parseTmplt := m.availableTemplates.ResetPasswordHtml.Parse
	if model == service.LinkAccessModel {
		parseTmplt = m.availableTemplates.ResetPasswordLinkHtml.Parse
	}
	if len(pr.ImagesTemplate) == 0 {
		pr.ImagesTemplate = m.Config.ImagesTemplateURL
	}

	body, err := parseTmplt(pr)
	if err != nil {
		return err
	}

	emailBody := body.String()
	subject := "Solicitação de recuperação de senha"

	to := pr.Name + " <" + pr.Email + ">"
	_, err = sendMail(connection{
		SMTPHost:     m.Config.Host,
		SMTPUser:     m.Config.User,
		SMTPPassword: m.Config.Password,
		SMTPPort:     m.Config.Port,
	}, message{
		To:       to,
		From:     m.Config.From,
		Subject:  subject,
		Body:     emailBody,
		TextBody: "Código para recuperar sua senha: " + pr.PasswordNumber + "\r\n\r\nOu acesse: " + pr.ConfirmationURL,
	})
	return err
}

// SendAccountEmailConfirm sending email to confirm account
func (m *Mailer) SendAccountEmailConfirm(pr service.TwoFactorRequest) error {
	if len(pr.ImagesTemplate) == 0 {
		pr.ImagesTemplate = m.Config.ImagesTemplateURL
	}
	body, err := m.availableTemplates.ConfirmRegistrationHtml.Parse(pr)
	if err != nil {
		return err
	}

	subject := "Confirmação de email"
	emailBody := body.String()
	to := pr.Name + " <" + pr.Email + ">"
	_, err = sendMail(connection{
		SMTPHost:     m.Config.Host,
		SMTPUser:     m.Config.User,
		SMTPPassword: m.Config.Password,
		SMTPPort:     m.Config.Port,
	}, message{
		To:       to,
		From:     m.Config.From,
		Subject:  subject,
		Body:     emailBody,
		TextBody: "Confirme seu email",
	})
	return err
}

func (m *Mailer) SendPwdResetAlert(config ...interface{}) error {
	return nil
}

// SendAuthenticationRequest sends an email to authenticate  a user
func (m *Mailer) SendAuthenticationRequest(pr service.TwoFactorRequest, model service.AccessModel) error {
	parseTmplt := m.availableTemplates.EmailAuthenticateHTML.Parse
	if model == service.LinkAccessModel {
		parseTmplt = m.availableTemplates.EmailAuthenticateLinkHTML.Parse
	}
	if len(pr.ImagesTemplate) == 0 {
		pr.ImagesTemplate = m.Config.ImagesTemplateURL
	}
	body, err := parseTmplt(pr)
	if err != nil {
		return err
	}

	emailBody := body.String()
	subject := "Autenticação de usuário"

	to := pr.Name + " <" + pr.Email + ">"
	_, err = sendMail(connection{
		SMTPHost:     m.Config.Host,
		SMTPUser:     m.Config.User,
		SMTPPassword: m.Config.Password,
		SMTPPort:     m.Config.Port,
	}, message{
		To:       to,
		From:     m.Config.From,
		Subject:  subject,
		Body:     emailBody,
		TextBody: "Código para autenticação: " + pr.PasswordNumber + "\r\n\r\nOu acesse: " + pr.ConfirmationURL,
	})
	return err
}

type connection struct {
	SMTPHost     string
	SMTPUser     string
	SMTPPassword string
	SMTPPort     int
}

type message struct {
	To          string
	From        string
	Subject     string
	Body        string
	TextBody    string
	Attachments []messageAttachment
}

type messageAttachment struct {
	URL  string
	Name string
}

func sendMail(conn connection, msg message) (string, error) {
	m := mail.NewMessage()
	m.SetHeader("From", msg.From)
	m.SetHeader("To", msg.To)
	m.SetHeader("Subject", msg.Subject)
	m.SetBody("text/plain", msg.TextBody)
	m.AddAlternative("text/html", msg.Body)

	for _, f := range msg.Attachments {
		dat, err := os.Open(f.URL)
		if err != nil {
			return "failed attachments", errors.Wrap(err, "attachment "+f.URL)
		}
		m.AttachReader(f.Name, dat)
		defer dat.Close()
	}

	d := mail.NewDialer(conn.SMTPHost, conn.SMTPPort, conn.SMTPUser, conn.SMTPPassword)
	d.StartTLSPolicy = mail.MandatoryStartTLS

	err := d.DialAndSend(context.Background(), m)

	return "ok", err
}

const tableTemplate = `<table style="background-color: #f5f5f5; border-radius: 5px;">
	<tr
		style="
		border-bottom-width: 1px;
		border-bottom-style: solid;
		border-color: #fff;
		"
	>
		{{range .Columns }}
			<th
			style="
				padding: 10px 40px;
				color: #000;
				border-bottom-width: 1px;
				border-bottom-style: solid;
				border-color: #fff;
				text-align: center;
			"
			>
			{{.}}
			</th>
		{{end}}
	</tr>
	{{range .Rows }}
		<tr
		style="
			border-bottom-width: 1px;
			border-bottom-style: solid;
			border-color: #fff;
			color: black;
		"
		>
		{{range . }}
			<td style="font-size: 10px; text-align: {{if .AlignRight}}right{{else}}center{{end}};">
				{{.Value}}
			</td>
		{{end}}
		</tr>
	{{end}}
</table>
`

type TableCell struct {
	Value      any
	AlignRight bool
}

func NewTable[T any](t []T) template.HTML {
	cols := structTagsInOrder(reflect.TypeOf(*new(T)), "json")
	colsAlign := structTagsInOrder(reflect.TypeOf(*new(T)), "align")
	rows := [][]TableCell{}

	tmap := []map[string]json.RawMessage{}
	b, err := json.Marshal(t)
	if err != nil {
		return ""
	}
	err = json.Unmarshal(b, &tmap)
	if err != nil {
		return ""
	}
	for _, row := range tmap {
		strrow := []TableCell{}
		for j, col := range cols {
			val := strings.Trim(string(row[col]), "\"")
			strrow = append(strrow, TableCell{
				Value:      val,
				AlignRight: colsAlign[j] == "right",
			})
		}
		rows = append(rows, strrow)
	}

	templ, err := template.New("table").Parse(tableTemplate)
	if err != nil {
		return ""
	}
	var body bytes.Buffer
	if err := templ.Execute(&body, struct {
		Columns []string
		Rows    [][]TableCell
	}{
		Columns: cols,
		Rows:    rows,
	}); err != nil {
		return ""
	}
	return template.HTML(body.String())
}

func NewCustomTable(rows [][]TableCell, backgroundColor *string) template.HTML {
	color := "#f2f2f2"
	if backgroundColor != nil {
		color = *backgroundColor
	}
	templ, err := template.New("table").Parse(`
	<div style="
		border-radius: 20px;
		background-color: ` + color + `;
		width: 95%;
		padding: 5% 2%;
	"
	>
		<table style="width: 80%; margin: auto;" class="responsiveTable">
			{{range .Rows }}
				<tr style="color: black;" class="responsiveRow">
				{{range . }}
					<td style="font-size: 10px; text-align: {{if .AlignRight}}right{{else}}center{{end}};">
						{{.Value}}
					</td>
				{{end}}
				</tr>
			{{end}}
		</table>
	</div>
	`)
	if err != nil {
		return ""
	}
	var body bytes.Buffer
	if err := templ.Execute(&body, struct {
		Rows [][]TableCell
	}{
		Rows: rows,
	}); err != nil {
		return ""
	}
	return template.HTML(body.String())
}

// structTagsInOrder returns the struct tags of a given struct type in order of the fields.
func structTagsInOrder(structType reflect.Type, tag string) []string {
	var tags []string

	// Iterate through the fields of the struct
	for i := 0; i < structType.NumField(); i++ {
		field := structType.Field(i)

		// Get the tag for the field
		tag := field.Tag.Get(tag)
		if len(tag) == 0 {
			tag = field.Name
		}

		// Append the tag to the tags slice
		tags = append(tags, tag)
	}

	return tags
}
