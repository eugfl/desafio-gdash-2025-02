package nestjs

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"worker-go/internal/config"
	"worker-go/internal/models"

	"github.com/go-resty/resty/v2"
	"go.uber.org/zap"
)

// NestJSClient interface para abstrair cliente real e de teste
type NestJSClient interface {
	SendWeatherLog(ctx context.Context, payload *models.NormalizedPayload) error
}

type Client struct {
	baseURL    string
	httpClient *resty.Client
	logger     *zap.Logger
	maxRetries int
}

func NewClient(cfg config.Config, logger *zap.Logger) *Client {
	client := resty.New().
		SetBaseURL(cfg.NestJSURL).
		SetTimeout(cfg.HTTPTimeout).
		SetHeader("Content-Type", "application/json")

	return &Client{
		baseURL:    cfg.NestJSURL,
		httpClient: client,
		logger:     logger,
		maxRetries: cfg.MaxRetry,
	}
}

// SendWeatherLog envia o payload normalizado para o NestJS
func (c *Client) SendWeatherLog(ctx context.Context, payload *models.NormalizedPayload) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	var lastErr error
	for attempt := 0; attempt <= c.maxRetries; attempt++ {
		if attempt > 0 {
			backoff := time.Duration(attempt) * time.Second
			c.logger.Warn("retrying_nestjs",
				zap.Int("attempt", attempt),
				zap.Duration("backoff", backoff),
			)
			time.Sleep(backoff)
		}

		req := c.httpClient.R().
			SetContext(ctx).
			SetBody(body)

		resp, err := req.Post("")
		if err != nil {
			lastErr = fmt.Errorf("request failed: %w", err)
			continue
		}

		if resp.StatusCode() >= 200 && resp.StatusCode() < 300 {
			c.logger.Info("weather_log_sent",
				zap.String("external_id", payload.ExternalID),
				zap.Int("status_code", resp.StatusCode()),
			)
			return nil
		}

		lastErr = fmt.Errorf("unexpected status code: %d", resp.StatusCode())
	}

	return fmt.Errorf("max retries exceeded: %w", lastErr)
}

// HealthCheck verifica se o NestJS está disponível
func (c *Client) HealthCheck(ctx context.Context) error {
	req, err := http.NewRequestWithContext(ctx, "GET", c.baseURL+"/health", nil)
	if err != nil {
		return err
	}

	resp, err := c.httpClient.GetClient().Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("health check failed: status %d", resp.StatusCode)
	}

	return nil
}

