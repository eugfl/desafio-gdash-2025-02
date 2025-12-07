package main

import (
	"log"
	"net/http"

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

	// Start dummy web server for Render health check (Free Tier workaround)
	go func() {
		http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("OK"))
		})
		http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("OK"))
		})
		
		logger.Info("starting_dummy_web_server", zap.String("port", "8000"))
		if err := http.ListenAndServe(":8000", nil); err != nil {
			logger.Error("dummy_web_server_failed", zap.Error(err))
		}
	}()

	// Inicia consumer
	if err := rabbitmq.StartConsumer(cfg, logger); err != nil {
		logger.Fatal("consumer_failed", zap.Error(err))
	}
}
