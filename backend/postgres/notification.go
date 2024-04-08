package postgres

import (
	"errors"
	"log"

	"github.com/jmoiron/sqlx"
	"github.com/munu-brasil/munu/backend/mailmaid"
	"github.com/munu-brasil/munu/backend/service"
)

type NotificationCenterConfig struct {
	ApplicationBaseURL string
}

type NotificationCenter struct {
	Config     NotificationCenterConfig
	DB         *sqlx.DB
	Logger     *log.Logger
	Dispatcher *service.Dispatcher
	Mailer     *mailmaid.Mailer
}

func (n *NotificationCenter) Start() error {
	if n.DB == nil || n.Dispatcher == nil {
		return errors.New("missing services")
	}

	return nil
}
