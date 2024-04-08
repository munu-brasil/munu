package service

import (
	"sync"
)

type listener func(any)
type typeValidator func(any) bool

type Dispatcher struct {
	handlers map[any][]listener
	lock     *sync.RWMutex
}

func NewDispatcher() *Dispatcher {
	return &Dispatcher{
		handlers: make(map[any][]listener),
		lock:     &sync.RWMutex{},
	}
}

// registerListener registers handler accepting desired event - a listener.
func (d *Dispatcher) registerListener(p any, pipe listener) {
	d.lock.Lock()
	defer d.lock.Unlock()
	if _, ok := d.handlers[p]; !ok {
		d.handlers[p] = []listener{pipe}
	} else {
		d.handlers[p] = append(d.handlers[p], pipe)
	}
}

// dispatch provides thread safe method to send event to all listeners
// Returns true if succeded and false if event was not registered
func (d *Dispatcher) dispatch(event any, validate typeValidator) bool {
	d.lock.RLock()
	defer d.lock.RUnlock()

	for t, listeners := range d.handlers {
		if validate(t) {
			for _, listn := range listeners {
				listn(event)
			}
			return true
		}
	}

	return false
}

func sameType[A, B any](x A, y B) bool {
	_, ok := any(x).(B)

	return ok
}

type Event[T any] interface {
	Emit(T) bool
	Handle(func(T))
}

type event[T any] struct {
	disp *Dispatcher
}

func (e event[T]) Emit(ev T) bool {
	return e.disp.dispatch(ev, func(a any) bool {
		return sameType(a, ev)
	})
}

func (e event[T]) Handle(handler func(T)) {
	e.disp.registerListener(*(new(T)), func(a any) {
		if evnt, ok := any(a).(T); ok {
			handler(evnt)
		}
	})
}
