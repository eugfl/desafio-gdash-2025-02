from fastapi import FastAPI
from Collector.src.domain.state import state
from Collector.src.core.logger import get_logger

logger = get_logger("collector.api")
app = FastAPI(
    title="Weather Collector Service ☁️",
    description="""
    Serviço responsável por coletar dados climáticos da Open-Meteo,
    enviar para RabbitMQ e permitir troca dinâmica de cidades
    através da API.

    🔥 Pipeline:
    1. NestJS → POST /city → define alvo da coleta
    2. Collector busca dados a cada 1h
    3. Publica no RabbitMQ para enriquecimento pelo módulo IA
    """,
    version="1.0.0",
    contact={
        "name": "Gabriel Figueiredo",
        "url": "https://github.com/eugfl",
    },
)


# ⤵ Rotas da aplicação
@app.post("/city")
async def update_city(payload: dict):
    city = payload.get("city")

    if not city or not isinstance(city, str):
        return {"error": "Cidade inválida"}

    await state.set_city(city)
    logger.info(f"🌍 Cidade definida para coleta: {city}")

    return {"message": "Cidade atualizada com sucesso", "city": city}
