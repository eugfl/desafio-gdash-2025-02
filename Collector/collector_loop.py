import asyncio
from state import state
from logger import get_logger
from utils.config import Config
from clients.weather_client import WeatherClient
from clients.rabbitmq_client import RabbitMQPublisher

logger = get_logger("collector.scheduler")


async def run_collector_loop():
    weather = WeatherClient()
    rabbit = RabbitMQPublisher(
        amqp_url=Config.RABBITMQ_URL,
        exchange=Config.RABBITMQ_EXCHANGE,
        queue=Config.RABBITMQ_QUEUE
    )
    await rabbit.connect()

    logger.info(f"🚀 Collector iniciado — intervalo {Config.COLLECT_INTERVAL_SECONDS}s")

    warned_no_city = False

    while True:
        city = await state.get_city()

        if not city:
            if not warned_no_city:
                logger.warning("⚠ Nenhuma cidade definida. Aguardando POST /city...")
                warned_no_city = True
            await asyncio.sleep(5)
            continue
        else:
            if warned_no_city:
                logger.info(f"📌 Cidade recebida -> {city}. Coleta iniciada.")
                warned_no_city = False

        logger.info(f"📡 Coletando clima para: {city}")
        payload = await weather.fetch_weather_by_city(city)

        if payload:
            await rabbit.publish(payload)
            logger.info(f"✔ Payload publicado para RabbitMQ ({city})")

        await asyncio.sleep(Config.COLLECT_INTERVAL_SECONDS)
