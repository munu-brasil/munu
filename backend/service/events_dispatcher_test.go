package service

import (
	"testing"
)

func TestDispatcher(t *testing.T) {
	// dispatcher := NewDispatcher()
	eventsDispatched := 0

	if eventsDispatched != 3 {
		t.Errorf("expected %d events, got %d", 3, eventsDispatched)
	}
}
