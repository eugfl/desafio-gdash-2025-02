package main

import (
	"log"
	"go.uber.org/zap"
	"worker-go/internal/config"
	"worker-go/internal/rabbitmq"
)

func main() {
	// Carrega configuração
	cfg := config.Load()

	// Inicializa logger
	if err := config.InitLogger(); err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	defer config.Logger.Sync()

	logger := config.Logger

	logger.Info("worker_starting",
		zap.String("rabbit_url", cfg.RabbitURL),
		zap.String("input_queue", cfg.InputQueue),
		zap.Int("worker_pool_size", cfg.WorkerPoolSize),
	)

	// Inicia consumer
	if err := rabbitmq.StartConsumer(cfg, logger); err != nil {
		logger.Fatal("consumer_failed", zap.Error(err))
	}
}
