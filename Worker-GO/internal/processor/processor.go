package processor

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"worker-go/internal/clients/nestjs"
	"worker-go/internal/clients/pokeapi"
	"worker-go/internal/models"

	"go.uber.org/zap"
)

type Processor struct {
	normalizer   *Normalizer
	nestjsClient nestjs.NestJSClient
	logger       *zap.Logger
	timeout      time.Duration
}

func NewProcessor(
	pokeapiClient *pokeapi.Client,
	nestjsClient nestjs.NestJSClient,
	logger *zap.Logger,
	timeout time.Duration,
) *Processor {
	normalizer := NewNormalizer(pokeapiClient, logger)
	return &Processor{
		normalizer:   normalizer,
		nestjsClient: nestjsClient,
		logger:       logger,
		timeout:      timeout,
	}
}

var ErrInvalidJSON = errors.New("invalid_json")

// Process processa uma mensagem do RabbitMQ
func (p *Processor) Process(ctx context.Context, data []byte) error {
	// Parse do payload enriquecido
	var enriched models.EnrichedWeatherPayload
	if err := json.Unmarshal(data, &enriched); err != nil {
		p.logger.Error("failed_to_parse_enriched_payload", zap.Error(err))
		return ErrInvalidJSON
	}

	p.logger.Info("processing_message",
		zap.String("external_id", enriched.Base.ExternalID),
		zap.String("city", enriched.Base.Location.City),
		zap.Int("pokemon_count", len(enriched.SuggestedPokemons)),
	)

	// Cria context com timeout
	processCtx, cancel := context.WithTimeout(ctx, p.timeout)
	defer cancel()

	// Normaliza e enriquece com PokéAPI
	normalized, err := p.normalizer.Normalize(processCtx, &enriched)
	if err != nil {
		p.logger.Error("failed_to_normalize", zap.Error(err))
		return err
	}

	// Valida payload normalizado
	if err := ValidateNormalized(normalized); err != nil {
		p.logger.Error("validation_failed", zap.Error(err))
		return err
	}

	// Envia para NestJS
	if err := p.nestjsClient.SendWeatherLog(processCtx, normalized); err != nil {
		p.logger.Error("failed_to_send_to_nestjs", zap.Error(err))
		return err
	}

	p.logger.Info("message_processed_successfully",
		zap.String("external_id", normalized.ExternalID),
	)

	return nil
}
