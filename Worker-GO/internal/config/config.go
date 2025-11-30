package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	// RabbitMQ
	RabbitURL     string
	InputQueue    string
	DLQQueue      string
	MaxRetry      int
	WorkerPoolSize int

	// HTTP Clients
	NestJSURL     string
	PokeAPIURL    string
	HTTPTimeout   time.Duration

	// Cache
	CacheTTL      time.Duration

	// Test Mode
	TestMode     bool
}

func Load() Config {
	return Config{
		RabbitURL:     getEnv("RABBIT_URL", "amqp://guest:guest@rabbitmq:5672/"),
		InputQueue:    getEnv("ENRICHED_QUEUE", "weather.enriched"),
		DLQQueue:      getEnv("DLQ_QUEUE", "weather.enriched.dlq"),
		MaxRetry:      getEnvInt("MAX_RETRY", 3),
		WorkerPoolSize: getEnvInt("WORKER_POOL_SIZE", 5),
		
		NestJSURL:     getEnv("NESTJS_URL", "http://nestjs:3000/api/weather/logs"),
		PokeAPIURL:    getEnv("POKEAPI_URL", "https://pokeapi.co/api/v2"),
		HTTPTimeout:   getEnvDuration("HTTP_TIMEOUT", 10*time.Second),
		
		CacheTTL:      getEnvDuration("CACHE_TTL", 1*time.Hour),
		
		TestMode:      getEnvBool("TEST_MODE", false),
	}
}

func getEnvBool(key string, def bool) bool {
	if v := os.Getenv(key); v != "" {
		if b, err := strconv.ParseBool(v); err == nil {
			return b
		}
	}
	return def
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func getEnvInt(key string, def int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
	}
	return def
}

func getEnvDuration(key string, def time.Duration) time.Duration {
	if v := os.Getenv(key); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			return d
		}
	}
	return def
}
