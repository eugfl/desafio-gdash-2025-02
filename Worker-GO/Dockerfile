# 1. Imagem GO
FROM golang:1.22-alpine AS builder

# 2. Define diretório de trabalho
WORKDIR /app

# 3. Copia dependências Go primeiro
COPY go.mod go.sum ./
RUN go mod download

# 4. Copia todo o código da aplicação
COPY . .

# 5. Compila o binário
RUN CGO_ENABLED=0 GOOS=linux go build -o worker ./cmd/worker

# 6. Imagem final minimalista
FROM alpine:latest

# 7. Instala certificados SSL + netcat (necessário para wait-for-rabbit)
RUN apk --no-cache add ca-certificates netcat-openbsd

# 8. Define diretório de runtime do container
WORKDIR /root/

# 9. Copia binário compilado
COPY --from=builder /app/worker .

# 10. Copia o script que aguarda o RabbitMQ
COPY wait-for-rabbit.sh ./wait-for-rabbit.sh

# 11. Dá permissão de execução
RUN chmod +x worker wait-for-rabbit.sh

# 12. Healthcheck — reinicia caso o processo morra
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD pgrep worker || exit 1

# 13. Executa via script de espera → só inicia após RabbitMQ responder
ENTRYPOINT ["./wait-for-rabbit.sh"]
