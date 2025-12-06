# 1. Build Stage
FROM node:20-alpine AS build

WORKDIR /app

# Copia apenas package.json e lock para instalar dependências
COPY package*.json ./

RUN npm install

# Copia restante do projeto
COPY . .

# Config necessário para o Vite rodar no Docker
ENV HOST=0.0.0.0
EXPOSE 5173

# Inicia o servidor de desenvolvimento com hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
