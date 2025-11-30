#!/bin/sh

RABBIT_HOST=${RABBIT_HOST:-"rabbitmq"}
RABBIT_PORT=${RABBIT_PORT:-5672}
MAX_RETRIES=${MAX_RETRIES:-30}
SLEEP_TIME=${SLEEP_TIME:-2}

echo "🔄 [Worker-Go] Aguardando RabbitMQ (${RABBIT_HOST}:${RABBIT_PORT})..."

for i in $(seq 1 $MAX_RETRIES); do
    if nc -z "$RABBIT_HOST" "$RABBIT_PORT"; then
        echo "✅ [Worker-Go] RabbitMQ está pronto! (Tentativa $i)"
        exec ./worker
        exit 0
    fi

    echo "⏳ [Worker-Go] Tentativa $i/$MAX_RETRIES — aguardando RabbitMQ..."
    sleep "$SLEEP_TIME"
done

echo "❌ [Worker-Go] Falha — RabbitMQ não respondeu após $MAX_RETRIES tentativas."
exit 1
