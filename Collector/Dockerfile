# 1. Base Python
FROM python:3.12-slim

# 2. Define diretório de trabalho dentro do container
WORKDIR /app

# 3. Copiaa arquivos de dependências
COPY requirements.txt .

# 4. Instalaa dependências
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copia todo o código do collector
COPY . .

# 6. variáveis de ambiente padrão
ENV COLLECT_INTERVAL_SECONDS=3600
ENV RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
ENV RABBITMQ_EXCHANGE=weather
ENV RABBITMQ_QUEUE=weather.logs

# 7. Comando para rodar a aplicação
CMD ["python", "-m", "main"]
