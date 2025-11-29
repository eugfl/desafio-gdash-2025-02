import aio_pika
from core.config import config
from core.logger import get_logger

from schemas.weather_payload import WeatherPayload
from schemas.enriched_output import EnrichedWeatherPayload
from services.ia_service import enrich_payload
from services.rabbit_publisher import RabbitPublisher

logger = get_logger("ia.consumer")


async def start_consumer():
    conn = await aio_pika.connect_robust(config.rabbit_url)
    channel = await conn.channel()

    queue = await channel.declare_queue(config.raw_queue, durable=True)
    publisher = RabbitPublisher()
    await publisher.connect(channel)

    logger.info(f"🎧 Consumindo RAW → {config.raw_queue}")

    try:
        async with queue.iterator() as messages:
            async for msg in messages:
                async with msg.process():
                    try:
                        raw = WeatherPayload.model_validate_json(msg.body)
                        enriched: EnrichedWeatherPayload = await enrich_payload(raw)

                        logger.info(f"🤖 OK {raw.external_id} → enviando enriquecido")
                        await publisher.publish_enriched(enriched)

                    except Exception as e:
                        logger.error(f"❌ Falha ao processar → {e}")
    finally:
        await channel.close()
        await conn.close()
        logger.info("🔌 Conexão com RabbitMQ encerrada.")
