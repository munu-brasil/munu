package service

import (
	"github.com/gofrs/uuid"
)

type EventNewUser struct {
	UserID uuid.UUID
}

func NewUser(disp *Dispatcher) Event[EventNewUser] {
	return event[EventNewUser]{
		disp: disp,
	}
}
