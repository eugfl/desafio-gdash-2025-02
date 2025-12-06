import asyncio
from domain.state import state
from core.logger import get_logger
from core.config import config
from clients.weather_client import WeatherClient
from clients.rabbitmq_client import RabbitMQPublisher

logger = get_logger("collector.scheduler")


async def collect_once(weather: WeatherClient, rabbit: RabbitMQPublisher, city: str):
    logger.info(f"📡 Coletando clima para: {city}")
    payload = await weather.fetch_weather_by_city(city)

    if payload:
        await rabbit.publish(payload)
        logger.info(f"✔ Payload publicado para RabbitMQ ({city})")


async def run_collector_loop():
    weather = WeatherClient()
    rabbit = RabbitMQPublisher(
        amqp_url=config.rabbit_url,
        exchange=config.raw_exchange,
        queue=config.raw_queue,
    )
    await rabbit.connect()

    logger.info(f"🚀 Collector iniciado — intervalo {config.collect_interval_seconds}s")

    warned_no_city = False

    while True:
        city = await state.get_city()

        if not city:
            if not warned_no_city:
                logger.warning("⚠ Nenhuma cidade definida. Aguardando POST /city...")
                warned_no_city = True
            
            await state.wait_for_city_change()
            continue
        if warned_no_city:
            logger.info(f"📌 Cidade recebida -> {city}. Coleta iniciada.")
            warned_no_city = False

        await collect_once(weather, rabbit, city)

        try:
            await asyncio.wait_for(
                state.wait_for_city_change(),
                timeout=config.collect_interval_seconds
            )
            logger.info("🔄 Cidade alterada! Coletando dados da nova cidade imediatamente...")
        except asyncio.TimeoutError:
            pass