package rabbitmq

import (
	"context"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"worker-go/internal/clients/nestjs"
	"worker-go/internal/clients/pokeapi"
	"worker-go/internal/config"
	"worker-go/internal/processor"

	"github.com/rabbitmq/amqp091-go"
	"go.uber.org/zap"
)

func StartConsumer(cfg config.Config, logger *zap.Logger) error {
	// Conecta ao RabbitMQ
	conn, err := amqp091.Dial(cfg.RabbitURL)
	if err != nil {
		return err
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		return err
	}
	defer ch.Close()

	_, err = ch.QueueDeclare(
		cfg.InputQueue, // <- "weather.enriched"
		true,           // durable
		false,          // auto-delete
		false,          // exclusive
		false,          // no-wait
		nil,
	)
	if err != nil {
		return err
	}

	// Declara DLQ
	_, err = ch.QueueDeclare(
		cfg.DLQQueue,
		true,  // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		nil,
	)
	if err != nil {
		return err
	}

	// Configura QoS (prefetch)
	if err := ch.Qos(cfg.WorkerPoolSize, 0, false); err != nil {
		return err
	}

	// Consome mensagens
	msgs, err := ch.Consume(
		cfg.InputQueue,
		"",    // consumer tag
		false, // auto-ack
		false, // exclusive
		false, // no-local
		false, // no-wait
		nil,
	)
	if err != nil {
		return err
	}

	logger.Info("consumer_started",
		zap.String("queue", cfg.InputQueue),
		zap.Int("worker_pool_size", cfg.WorkerPoolSize),
	)

	// Inicializa clientes
	pokeapiClient := pokeapi.NewClient(cfg, logger)
	
	var nestjsClient nestjs.NestJSClient
	if cfg.TestMode {
		logger.Warn("🧪 TEST MODE ENABLED - Payloads serão apenas logados, não enviados ao NestJS")
		nestjsClient = nestjs.NewTestModeClient(logger)
	} else {
		nestjsClient = nestjs.NewClient(cfg, logger)
	}
	
	proc := processor.NewProcessor(
		pokeapiClient,
		nestjsClient,
		logger,
		30*time.Second, // timeout de processamento
	)

	// Worker pool
	var wg sync.WaitGroup
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	// Inicia workers
	for i := 0; i < cfg.WorkerPoolSize; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()
			for {
				select {
				case <-ctx.Done():
					return
				case msg, ok := <-msgs:
					if !ok {
						return
					}
					processMessage(ctx, msg, ch, proc, cfg, logger, workerID)
				}
			}
		}(i)
	}

	// Aguarda sinal de shutdown
	<-sigChan
	logger.Info("shutdown_signal_received")

	// Cancela context e aguarda workers
	cancel()
	wg.Wait()

	logger.Info("consumer_stopped")
	return nil
}

func processMessage(
	ctx context.Context,
	msg amqp091.Delivery,
	ch *amqp091.Channel,
	proc *processor.Processor,
	cfg config.Config,
	logger *zap.Logger,
	workerID int,
) {
	retryCount := getRetryCount(msg.Headers)

	logger.Debug("processing_message",
		zap.Int("worker_id", workerID),
		zap.Int("retry_count", retryCount),
	)

	err := proc.Process(ctx, msg.Body)
	if err != nil {
		handleError(msg, ch, cfg, logger, err, retryCount)
		return
	}

	// Sucesso: ACK
	if err := msg.Ack(false); err != nil {
		logger.Error("failed_to_ack", zap.Error(err))
	}
}

func handleError(
	msg amqp091.Delivery,
	ch *amqp091.Channel,
	cfg config.Config,
	logger *zap.Logger,
	err error,
	retryCount int,
) {
	// JSON inválido: descarta sem retry
	if err.Error() == "invalid_json" {
		logger.Warn("invalid_json_discarding")
		msg.Nack(false, false)
		return
	}

	// Retry se não excedeu limite
	if retryCount < cfg.MaxRetry {
		backoff := calculateBackoff(retryCount)
		logger.Warn("retrying_message",
			zap.Int("retry_count", retryCount+1),
			zap.Int("max_retry", cfg.MaxRetry),
			zap.Duration("backoff", backoff),
			zap.Error(err),
		)

		time.Sleep(backoff)

		// Incrementa retry count no header
		headers := msg.Headers
		if headers == nil {
			headers = make(amqp091.Table)
		}
		headers["x-retry"] = retryCount + 1

		// Re-publica com novo header
		ch.Publish("", cfg.InputQueue, false, false, amqp091.Publishing{
			Body:    msg.Body,
			Headers: headers,
		})

		msg.Nack(false, false)
		return
	}

	// Max retries: envia para DLQ
	logger.Error("max_retries_exceeded_sending_to_dlq",
		zap.String("dlq", cfg.DLQQueue),
		zap.Error(err),
	)

	ch.Publish("", cfg.DLQQueue, false, false, amqp091.Publishing{
		Body:    msg.Body,
		Headers: msg.Headers,
	})

	msg.Nack(false, false)
}

func getRetryCount(headers amqp091.Table) int {
	if headers == nil {
		return 0
	}
	if v, ok := headers["x-retry"].(int32); ok {
		return int(v)
	}
	return 0
}

func calculateBackoff(retryCount int) time.Duration {
	delays := []time.Duration{2 * time.Second, 5 * time.Second, 10 * time.Second}
	if retryCount < len(delays) {
		return delays[retryCount]
	}
	return 10 * time.Second
}
