#!/bin/sh

RABBIT_HOST=${RABBIT_HOST:-"rabbitmq"}
RABBIT_PORT=${RABBIT_PORT:-5672}
MAX_RETRIES=${MAX_RETRIES:-30}
SLEEP_TIME=${SLEEP_TIME:-2}

echo "🔄 Aguardando RabbitMQ (${RABBIT_HOST}:${RABBIT_PORT}) iniciar..."

for i in $(seq 1 $MAX_RETRIES); do
    if nc -z "$RABBIT_HOST" "$RABBIT_PORT"; then
        echo "✅ RabbitMQ está pronto! (Tentativa $i)"
        exec python -m main
        exit 0
    fi

    echo "⏳ Tentativa $i/$MAX_RETRIES — ainda aguardando RabbitMQ..."
    sleep "$SLEEP_TIME"
done

echo "❌ ERRO: RabbitMQ não respondeu após $MAX_RETRIES tentativas"
exit 1
