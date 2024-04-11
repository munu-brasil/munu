package service

import (
	"net/http"
	"strings"

	"github.com/pkg/errors"
)

// Errors status code
const (
	StatusCodeForbidden    = http.StatusForbidden
	StatusCodeNotFound     = http.StatusNotFound
	StatusCodeUnauthorized = http.StatusUnauthorized

	MessageFobidden     = "User forbidden to access"
	MessageUnauthorized = "User unauthorized to access"
)

// Error represents a handler error. It provides methods for a HTTP status
// code and embeds the built-in error interface.
type Error interface {
	error
	Status() int
}

// StatusError represents an error with an associated HTTP status code.
type StatusError struct {
	Code     int
	ErrorMsg error
}

// FieldError model
type FieldError struct {
	Domain  string `json:"domain"`
	Reason  string `json:"reason"`
	Message string `json:"message"`
}

// ModelValidationError represents format errors
type ModelValidationError struct {
	Domain      string `json:"domain"`
	FieldErrors []FieldError
}

// Error implement error interface
func (m ModelValidationError) Error() string {
	errs := []string{}
	for _, k := range m.FieldErrors {
		errs = append(errs, k.Reason+": "+k.Message)
	}
	return m.Domain + " " + strings.Join(errs, ", ")
}

// Append adds a new FieldError to the list
func (m *ModelValidationError) Append(reason, message string) {
	f := FieldError{
		Reason:  reason,
		Message: message,
	}
	mv := *m
	mv.FieldErrors = append(mv.FieldErrors, f)
	*m = mv
}

// AppendError adds a new error to the list
func (m *ModelValidationError) AppendError(reason string, err error) {
	mv := ModelValidationError{}

	if errors.As(err, &mv) {
		m.FieldErrors = append(m.FieldErrors, mv.FieldErrors...)
		return
	}
	m.Append(reason, err.Error())
}

// Check returns an error if there are errors in the list
func (m ModelValidationError) Check() error {
	if len(m.FieldErrors) > 0 {
		return m
	}
	return nil
}

// As implement errors.As
func (m ModelValidationError) As(obj interface{}) bool {
	target, ok := obj.(*ModelValidationError)
	if ok {
		(*target) = m
	}
	return ok
}

// Is implement errors.Is
func (m ModelValidationError) Is(err error) bool {
	_, ok := err.(ModelValidationError)
	return ok
}

// As implement errors.As
func (s StatusError) As(obj interface{}) bool {
	target, ok := obj.(*StatusError)
	if ok {
		(*target) = s
	}
	return ok
}

// Is implement errors.Is
func (s StatusError) Is(err error) bool {
	_, ok := err.(StatusError)
	return ok
}

// Allows StatusError to satisfy the error interface.
func (se StatusError) Error() string {
	return se.ErrorMsg.Error()
}

// Status Returns our HTTP status code.
func (se StatusError) Status() int {
	return se.Code
}

// NewForbiddenError returns a status forbidden error
func NewForbiddenError() error {
	return StatusError{Code: StatusCodeForbidden, ErrorMsg: errors.New(MessageFobidden)}
}

// WrapForbiddenError returns a status forbidden error with error wrap
func WrapForbiddenError(err error) error {
	return StatusError{Code: StatusCodeForbidden, ErrorMsg: errors.Wrap(err, MessageFobidden)}
}

// NewNotFoundError returns a status forbidden error
func NewNotFoundError(message string) error {
	return StatusError{Code: StatusCodeNotFound, ErrorMsg: errors.New(message)}
}

// WrapNotFoundError returns a status forbidden error with error wrap
func WrapNotFoundError(message string, err error) error {
	return StatusError{Code: StatusCodeNotFound, ErrorMsg: errors.Wrap(err, message)}
}

// NewUnauthorizedError returns a status forbidden error
func NewUnauthorizedError() error {
	return StatusError{Code: StatusCodeUnauthorized, ErrorMsg: errors.New(MessageUnauthorized)}
}

// WrapUnauthorizedError returns a status forbidden error with error wrap
func WrapUnauthorizedError(err error) error {
	return StatusError{Code: StatusCodeUnauthorized, ErrorMsg: errors.Wrap(err, MessageUnauthorized)}
}

func NewModelValidationError(domain string) ModelValidationError {
	return ModelValidationError{
		Domain: domain,
	}
}

// ClassifiedError represents an error with an associated HTTP status code.
type ClassifiedError struct {
	description string
	classified  error
}

// Message returns the unclassified error message
func (s *ClassifiedError) Message() string {
	if s == nil {
		return ""
	}
	return s.description
}

// As implement errors.As
func (s *ClassifiedError) As(obj interface{}) bool {
	target, ok := obj.(*ClassifiedError)
	if ok {
		(*target) = *s
	}
	return ok
}

// Is implement errors.Is
func (s *ClassifiedError) Is(err error) bool {
	if s == nil {
		return false
	}
	_, ok := err.(*ClassifiedError)
	return ok
}

// Allows *ClassifiedError to satisfy the error interface.
func (s *ClassifiedError) Error() string {
	if s == nil {
		return ""
	}
	return s.classified.Error()
}

func WrapClassified(err error, msg string) error {
	return &ClassifiedError{
		classified:  err,
		description: msg,
	}
}

type StatusErrorHelp struct {
	Code         int
	ErrorMsg     error
	ExtendedHelp *string
}

// As implement errors.As
func (s StatusErrorHelp) As(obj interface{}) bool {
	target, ok := obj.(*StatusErrorHelp)
	if ok {
		(*target) = s
	}
	return ok
}

// Is implement errors.Is
func (s StatusErrorHelp) Is(err error) bool {
	_, ok := err.(StatusErrorHelp)
	return ok
}

// Error implement error interface
func (se StatusErrorHelp) Error() string {
	return se.ErrorMsg.Error()
}

// Status Returns our HTTP status code.
func (se StatusErrorHelp) Status() int {
	return se.Code
}

// Status Return data
func (se StatusErrorHelp) ErrorExtendedHelp() *string {
	return se.ExtendedHelp
}

// WrapForbiddenErrorData returns a status forbidden error with error wrap
func WrapForbiddenErrorData(err error, extendedHelp *string) error {
	return StatusErrorHelp{Code: StatusCodeForbidden, ErrorMsg: errors.Wrap(err, MessageFobidden), ExtendedHelp: extendedHelp}
}

// WrapUnauthorizedErrorData returns a status forbidden error with error wrap
func WrapUnauthorizedErrorData(err error, extendedHelp *string) error {
	return StatusErrorHelp{Code: StatusCodeUnauthorized, ErrorMsg: errors.Wrap(err, MessageUnauthorized), ExtendedHelp: extendedHelp}
}

// WrapNotFoundErrorData returns a status forbidden error with error wrap
func WrapNotFoundErrorData(message string, err error, extendedHelp *string) error {
	return StatusErrorHelp{Code: StatusCodeNotFound, ErrorMsg: errors.Wrap(err, message), ExtendedHelp: extendedHelp}
}

type DomainError struct {
	ErrorDetails FieldError
}

// Error implement error interface
func (de DomainError) Error() string {
	return de.ErrorDetails.Domain + ": " + de.ErrorDetails.Message
}

// As implement errors.As
func (de DomainError) As(obj interface{}) bool {
	target, ok := obj.(*DomainError)
	if ok {
		(*target) = de
	}
	return ok
}

// Is implement errors.Is
func (de DomainError) Is(err error) bool {
	_, ok := err.(DomainError)
	return ok
}

func NewDomainError(msg string, err FieldError) error {
	return DomainError{ErrorDetails: err}
}

// WrapNotFoundErrorData returns a status forbidden error with error wrap
func WrapDomainError(err error, domain, reason string) error {
	return DomainError{
		ErrorDetails: FieldError{
			Domain:  domain,
			Reason:  reason,
			Message: err.Error(),
		},
	}
}

// ValidationError is an error for when a table entry isn't valid
type ValidationError struct {
	Messages map[string]string
}

// UserNotFoundError is an error for when an user is not found in the database
type UserNotFoundError struct {
	Message string
}

// PwdResetInvalidError is an error for when a password reset id is not found in the database
type PwdResetInvalidError struct {
	Message string
}

func (e ValidationError) Error() (stringy string) {
	for _, v := range e.Messages {
		stringy += v + "\r\n"
	}
	return
}

func (e UserNotFoundError) Error() string {
	return e.Message
}

func (e PwdResetInvalidError) Error() string {
	return e.Message
}
