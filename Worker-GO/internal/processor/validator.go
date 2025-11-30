package processor

import (
	"errors"
	"worker-go/internal/models"
)

var (
	ErrInvalidExternalID = errors.New("external_id is required")
	ErrInvalidCity       = errors.New("location.city is required")
	ErrInvalidTemperature = errors.New("temperature is required")
	ErrInvalidTimestamp   = errors.New("timestamp is required")
)

// ValidateNormalized valida se o payload normalizado está completo
func ValidateNormalized(payload *models.NormalizedPayload) error {
	if payload.ExternalID == "" {
		return ErrInvalidExternalID
	}
	if payload.Location.City == "" {
		return ErrInvalidCity
	}
	if payload.Weather.Temperature == 0 {
		return ErrInvalidTemperature
	}
	if payload.Timestamp.IsZero() {
		return ErrInvalidTimestamp
	}
	return nil
}

