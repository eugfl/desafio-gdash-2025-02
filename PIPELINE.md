# 🔄 Documentação Completa da Pipeline

## 📋 Visão Geral

Sistema de coleta e análise de dados climáticos com IA, integrado com PokéAPI para sugestões contextualizadas.

---

## 🏗️ Arquitetura Completa

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│                      http://localhost:5173                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP REST
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      NESTJS API (Backend)                       │
│                      http://localhost:3000                      │
│                                                                 │
│  • Autenticação JWT + Google OAuth                              │
│  • CRUD de Usuários                                             │
│  • Gerenciamento de Logs Climáticos                             │
│  • Export CSV/XLSX                                              │
│  • Estatísticas Agregadas                                       │
└─────────────────────────────────────────────────────────────────┘
         │                                                  ▲
         │ POST /city                                       │ POST /weather/logs
         ↓                                                  │
┌──────────────────────┐                          ┌────────────────┐
│   COLLECTOR (Python) │                          │  WORKER-GO     │
│   http://localhost   │                          │                │
│         :8000        │                          │  • Consome fila│
│                      │                          │  • PokéAPI     │
│  • FastAPI           │                          │  • Normaliza   │
│  • Open-Meteo API    │                          │  • Envia NestJS│
│  • Scheduler 1h      │                          └────────────────┘
└──────────────────────┘                                   ▲
         │                                                 │
         │ Publica                                         │ Consome
         ↓                                                 │
┌──────────────────────┐         ┌──────────────────────┐│
│ RabbitMQ             │         │  IA-SERVICE (Python) ││
│ weather.raw          │────────▶│                      ││
│                      │ Consome │  • Groq API (IA)     ││
│ http://localhost     │         │  • Rule-based        ││
│      :5672           │         │    fallback          ││
│      :15672 (UI)     │         │  • Enriquece dados   ││
└──────────────────────┘         └──────────────────────┘│
                                          │              │
                                          │ Publica      │
                                          ↓              │
                                 ┌──────────────────────┐│
                                 │ RabbitMQ             ││
                                 │ weather.enriched     ││
                                 └──────────────────────┘┘

┌─────────────────────────────────────────────────────────────────┐
│                         MONGODB                                  │
│                    http://localhost:27017                        │
│                    http://localhost:8081 (Web UI)                │
│                                                                  │
│  Collections:                                                    │
│  • users         → Usuários cadastrados                          │
│  • weatherlogs   → Dados climáticos + Pokémons                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo Detalhado da Pipeline

### Passo 1: Usuário Registra/Faz Login

```
Frontend → POST /api/auth/register ou /api/auth/login
         → NestJS valida e retorna JWT
         → NestJS chama Collector: POST /city {"city": "São Paulo"}
```

### Passo 2: Collector Inicia Coleta

```
Collector:
  • Recebe POST /city
  • Armazena cidade no estado interno
  • Inicia loop de coleta (1x por hora)

  A cada intervalo:
    1. Busca coordenadas (Geocoding API)
    2. Busca dados climáticos (Open-Meteo API)
    3. Monta payload JSON
    4. Publica em RabbitMQ (weather.raw)
```

**Payload publicado:**

```json
{
  "external_id": "uuid",
  "location": { "city": "São Paulo", "lat": -23.55, "lon": -46.63 },
  "temperature": 25.0,
  "humidity": 60.0,
  "wind_speed": 10.0,
  "condition": "céu limpo",
  "precipitation_mm": 0,
  "timestamp": "2025-12-03T10:00:00Z"
}
```

### Passo 3: IA-Service Enriquece Dados

```
IA-Service:
  • Consome mensagem de weather.raw
  • Chama Groq API (IA) para gerar:
    - Insights textuais
    - Tipos de Pokémon recomendados
    - Sugestões de Pokémons específicos
  • Se Groq falhar → Usa regras estáticas
  • Publica em weather.enriched
```

**Payload enriquecido:**

```json
{
  "base": {
    /* payload original */
  },
  "insights": [
    "Clima agradável para atividades ao ar livre",
    "Baixa probabilidade de chuva"
  ],
  "recommended_types": ["fire", "grass"],
  "suggested_pokemons": [{ "name": "Charmander", "reasoning": "Tipo fire..." }]
}
```

### Passo 4: Worker-Go Busca PokéAPI

```
Worker-Go:
  • Consome mensagem de weather.enriched
  • Para cada Pokémon sugerido:
    - Busca dados completos na PokéAPI
    - Cache em memória (1h TTL)
  • Monta payload normalizado
  • Envia para NestJS: POST /api/weather/logs
```

**Payload final:**

```json
{
      "_id": "6930c633984d197db7bff2e9",
      "external_id": "1b5d4c66-717e-455e-a888-4ffc387f0997",
      "location": {
        "lat": -23.5475,
        "lon": -46.63611,
        "city": "São Paulo"
      },
      "weather": {
        "temperature": 20.5,
        "humidity": 83,
        "wind_speed": 10.9,
        "condition": "parcialmente nublado",
        "precipitation_mm": 0
      },
      "insights": [
        "A temperatura está em um nível moderado, ideal para a maioria dos tipos de Pokémon.",
        "A umidade está alta, o que pode ser favorável para Pokémon que preferem ambientes úmidos.",
        "A velocidade do vento está moderada, o que pode afetar a movimentação de alguns Pokémon.",
        "A condição climática é parcialmente nublada, o que pode ser favorável para Pokémon que preferem ambientes com sol parcial."
      ],
      "pokemon_suggestions": [
        {
          "name": "Vaporeon",
          "reasoning": "Vaporeon é um Pokémon de tipo água que se adapta bem a ambientes úmidos e pode se mover facilmente em condições climáticas parciais.",
          "pokemon_data": {
            "id": 134,
            "types": [
              "water"
            ],
            "abilities": [
              "water-absorb",
              "hydration"
            ],
            "stats": {
              "hp": 130,
              "attack": 65,
              "defense": 60,
              "special_attack": 110,
              "special_defense": 95,
              "speed": 65
            },
            "sprites": {
              "front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/134.png",
              "front_shiny": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/134.png"
            }
          }
        },
        {
          "name": "Charizard",
          "reasoning": "Charizard é um Pokémon de tipo fogo que pode se beneficiar da temperatura moderada e da velocidade do vento moderada.",
          "pokemon_data": {
            "id": 6,
            "types": [
              "fire",
              "flying"
            ],
            "abilities": [
              "blaze",
              "solar-power"
            ],
            "stats": {
              "hp": 78,
              "attack": 84,
              "defense": 78,
              "special_attack": 109,
              "special_defense": 85,
              "speed": 100
            },
            "sprites": {
              "front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png",
              "front_shiny": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/6.png"
            }
          }
        },
        {
          "name": "Pikachu",
          "reasoning": "Pikachu é um Pokémon de tipo elétrico que pode se beneficiar da condição climática parcialmente nublada e da velocidade do vento moderada.",
          "pokemon_data": {
            "id": 25,
            "types": [
              "electric"
            ],
            "abilities": [
              "static",
              "lightning-rod"
            ],
            "stats": {
              "hp": 35,
              "attack": 55,
              "defense": 40,
              "special_attack": 50,
              "special_defense": 50,
              "speed": 90
            },
            "sprites": {
              "front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
              "front_shiny": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/25.png"
            }
          }
        }
      ],
      "timestamp": "2025-12-03T23:22:25.766Z",
      "createdAt": "2025-12-03T23:22:27.452Z",
      "updatedAt": "2025-12-03T23:22:27.452Z",
      "__v": 0
    },
```

### Passo 5: NestJS Salva no MongoDB

```
NestJS:
  • Recebe POST /api/weather/logs
  • Valida payload (class-validator)
  • Verifica duplicação (external_id único)
  • Salva no MongoDB (collection: weatherlogs)
  • Retorna status 201
```

### Passo 6: Frontend Consome Dados

```
Frontend:
  • Login → Recebe JWT
  • GET /api/weather/logs → Lista dados
  • Exibe dashboard com:
    - Dados climáticos
    - Pokémons sugeridos (com sprites)
    - Insights da IA
    - Gráficos e estatísticas
```

---

## ⏱️ Tempos da Pipeline

| Etapa                  | Tempo      | Observação                     |
| ---------------------- | ---------- | ------------------------------ |
| Registro → Collector   | ~2s        | HTTP call                      |
| Collector → Open-Meteo | ~1s        | API externa                    |
| Collector → RabbitMQ   | <100ms     | Local                          |
| IA-Service processa    | ~2-5s      | Groq API                       |
| Worker-Go → PokéAPI    | ~1-3s      | 3 Pokémons (com cache < 100ms) |
| Worker-Go → NestJS     | ~200ms     | HTTP local                     |
| NestJS → MongoDB       | ~100ms     | Local                          |
| **Total**              | **~7-12s** | Primeira execução              |
| **Com cache**          | **~3-5s**  | Execuções seguintes            |

---

## 🔁 Resiliência e Tratamento de Erros

### Collector

- ✅ Retry automático na Open-Meteo (3 tentativas)
- ✅ Continua funcionando se RabbitMQ cair temporariamente
- ✅ Logs detalhados de cada operação

### IA-Service

- ✅ Fallback rule-based se Groq falhar
- ✅ Sistema nunca para completamente
- ✅ Logs indicam qual método foi usado

### Worker-Go

- ✅ Retry com backoff exponencial (2s, 5s, 10s)
- ✅ Dead Letter Queue (DLQ) após 3 falhas
- ✅ Cache de PokéAPI (reduz chamadas externas)
- ✅ Graceful shutdown (aguarda processar mensagens)

### NestJS

- ✅ Validação automática de payloads
- ✅ Reject duplicados (external_id único)
- ✅ Continua funcionando se Collector offline

---

## 📊 Monitoramento

### RabbitMQ Management UI

```
http://localhost:15672
User: guest
Pass: guest

Monitore:
  • weather.raw (taxa de publicação)
  • weather.enriched (taxa de consumo)
  • weather.enriched.dlq (mensagens problemáticas)
```

### MongoDB Express

```
http://localhost:8081

Visualize:
  • users collection
  • weatherlogs collection
  • Indexes e performance
```

### Logs dos Serviços

```bash
# Todos os logs
docker-compose logs -f

# Serviço específico
docker logs -f collector
docker logs -f ia-service
docker logs -f worker-go
docker logs -f nestjs
```

---

## 🔧 Troubleshooting

### Pipeline não está processando?

**1. Verificar se todos serviços estão rodando:**

```bash
docker-compose ps
```

**2. Verificar RabbitMQ:**

- Acessar http://localhost:15672
- Ver se filas existem
- Verificar se há mensagens

**3. Verificar logs:**

```bash
# Collector coletou dados?
docker logs collector | grep "Payload publicado"

# IA-Service processou?
docker logs ia-service | grep "Enriquecimento"

# Worker-Go consumiu?
docker logs worker-go | grep "processing_message"

# NestJS salvou?
docker logs nestjs | grep "Weather log salvo"
```

### Dados não aparecem no MongoDB?

```bash
# Verificar se MongoDB está rodando
docker exec -it mongodb mongosh

# No MongoDB shell:
use weather-dashboard
db.weatherlogs.find().limit(1).pretty()
```

### Collector não está coletando?

```bash
# Verificar se cidade foi definida
curl http://localhost:8000/city

# Forçar nova coleta
curl -X POST http://localhost:8000/city \
  -H "Content-Type: application/json" \
  -d '{"city":"São Paulo"}'
```
