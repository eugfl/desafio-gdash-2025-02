package nestjs

import (
	"context"
	"encoding/json"
	"worker-go/internal/models"

	"go.uber.org/zap"
)

// TestModeClient é um cliente que apenas loga o payload (para testes sem NestJS)
type TestModeClient struct {
	logger *zap.Logger
}

func NewTestModeClient(logger *zap.Logger) *TestModeClient {
	return &TestModeClient{logger: logger}
}

func (c *TestModeClient) SendWeatherLog(ctx context.Context, payload *models.NormalizedPayload) error {
	body, err := json.MarshalIndent(payload, "", "  ")
	if err != nil {
		return err
	}

	c.logger.Info("🧪 TEST MODE - Payload que seria enviado ao NestJS:",
		zap.String("external_id", payload.ExternalID),
		zap.String("city", payload.Location.City),
		zap.Int("pokemon_count", len(payload.PokemonSuggestions)),
		zap.String("payload", string(body)),
	)

	return nil
}

