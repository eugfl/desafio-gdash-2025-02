// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Weather Dashboard API')
    .setDescription(
      `
# 🌦️ Weather Dashboard - API Documentation

## 📋 Visão Geral
API completa para gerenciamento de dados climáticos com IA e sugestões de Pokémons baseadas no clima.

## 🔄 Pipeline de Dados
\`\`\`
Usuário Registra/Login
    ↓
NestJS → Collector (Python)
    ↓
Open-Meteo API (coleta clima)
    ↓
RabbitMQ (weather.raw)
    ↓
IA-Service (Groq) - Enriquece dados
    ↓
RabbitMQ (weather.enriched)
    ↓
Worker-Go - Busca PokéAPI
    ↓
NestJS API - Salva MongoDB
    ↓
Frontend consome dados
\`\`\`

## 🔐 Autenticação
A maioria dos endpoints requer autenticação JWT.

**Como autenticar:**
1. Faça login em \`POST /api/auth/login\`
2. Copie o \`access_token\` da resposta
3. Clique no botão **Authorize** (cadeado no topo)
4. Cole o token: \`Bearer SEU_TOKEN_AQUI\`
5. Clique em **Authorize**

## 👤 Usuário Padrão
- **Email:** admin@example.com
- **Senha:** 123456

## 🎯 Recursos Principais
- ✅ Autenticação JWT (Local + Google OAuth)
- ✅ CRUD completo de usuários
- ✅ Logs climáticos com insights de IA
- ✅ Sugestões de Pokémons baseadas no clima
- ✅ Export de dados (CSV/XLSX)
- ✅ Estatísticas agregadas
- ✅ Paginação e filtros

## 📊 Tecnologias
- **Backend:** NestJS + TypeScript
- **Banco de Dados:** MongoDB
- **Autenticação:** JWT + Passport
- **Validação:** class-validator
- **Documentação:** Swagger/OpenAPI
    `,
    )
    .setVersion('1.0.0')
    .setContact(
      'Gabriel Figueiredo',
      'https://github.com/eugfl',
      'gabrielfigueiredolima911@gmail.com',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Autenticação e autorização')
    .addTag('Users', 'Gerenciamento de usuários')
    .addTag('Weather', 'Dados climáticos e Pokémons')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Weather Dashboard API',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: `
      .topbar-wrapper img { content:url('https://nestjs.com/img/logo-small.svg'); width:40px; height:auto; }
      .swagger-ui .topbar { background-color: #E0234E; }
    `,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 NestJS rodando em: http://localhost:${port}`);
  console.log(`📚 Swagger disponível em: http://localhost:${port}/api/docs`);
}

bootstrap();
