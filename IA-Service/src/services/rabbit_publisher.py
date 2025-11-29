import aio_pika
from typing import Optional
from core.config import config
from core.logger import get_logger

logger = get_logger("ia.publisher")


class RabbitPublisher:
    def __init__(self):
        self.channel: Optional[aio_pika.RobustChannel] = None
        self.queue: Optional[aio_pika.Queue] = None

    async def connect(self, channel=None):
        if channel:
            self.channel = channel
        else:
            conn = await aio_pika.connect_robust(config.rabbit_url)
            self.channel = await conn.channel()

        self.queue = await self.channel.declare_queue(
            config.enriched_queue, durable=True
        )

    async def publish_enriched(self, enriched):
        if not self.channel:
            raise RuntimeError("Canal do RabbitMQ não inicializado")

        body = enriched.model_dump_json().encode()

        await self.channel.default_exchange.publish(
            aio_pika.Message(body=body, delivery_mode=aio_pika.DeliveryMode.PERSISTENT),
            routing_key=config.enriched_queue,
        )

        logger.info(f"📤 Publicado em → {config.enriched_queue}")
