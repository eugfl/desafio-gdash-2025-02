# 1. Base Python
FROM python:3.12-slim

# 2. Define diretório de trabalho dentro do container
WORKDIR /app

# 3. Instala netcat (necessário para o wait-for-rabbit.sh)
RUN apt-get update && apt-get install -y netcat-openbsd && apt-get clean

# 4. Copia arquivos de dependências
COPY requirements.txt .

# 5. Instala dependências
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copia todo o código do collector
COPY . .

# 7. Copia script que espera o RabbitMQ
COPY wait-for-rabbit.sh /wait-for-rabbit.sh
RUN chmod +x /wait-for-rabbit.sh

# 9. Comando de inicialização
CMD ["/wait-for-rabbit.sh", "python", "-m", "main"]
