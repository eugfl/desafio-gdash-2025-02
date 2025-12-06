# 1. Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar todas as dependências (dev + prod)
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Copiar templates para o dist para que o NestJS/Mailer consiga encontrá-los
RUN mkdir -p dist/templates && cp -r src/templates/* dist/templates/

# 2. Production Stage
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production

# Copiar build da stage anterior
COPY --from=builder /app/dist ./dist

# Expor porta
EXPOSE 3000

# Start
CMD ["node", "dist/main"]
