import json
import aio_pika
from typing import Dict, Optional
from aio_pika import Message, DeliveryMode
from core.logger import get_logger

logger = get_logger("collector.rabbitmq")


class RabbitMQPublisher:
    def __init__(self, amqp_url: str, exchange: str, queue: str):
        self.amqp_url = amqp_url
        self.exchange_name = exchange
        self.queue_name = queue
        self.connection: Optional[aio_pika.RobustConnection] = None
        self.channel: Optional[aio_pika.RobustChannel] = None
        self.exchange: Optional[aio_pika.Exchange] = None
        self.queue: Optional[aio_pika.Queue] = None

    async def connect(self):
        # Conecta ao RabbitMQ
        try:
            self.connection = await aio_pika.connect_robust(self.amqp_url)
            self.channel = await self.connection.channel()

            self.exchange = await self.channel.declare_exchange(
                self.exchange_name, aio_pika.ExchangeType.FANOUT, durable=True
            )

            # Declara fila e faz bind
            self.queue = await self.channel.declare_queue(
                self.queue_name, durable=True
            )
            await self.queue.bind(self.exchange)

            logger.info(f"✅ Conectado ao RabbitMQ: exchange={self.exchange_name}, queue={self.queue_name}")

        except Exception as e:
            logger.error(f"❌ Erro ao conectar RabbitMQ: {e}")
            raise

    async def publish(self, payload: Dict):
        # Publica um payload JSON na exchange do RabbitMQ.
        if not self.exchange:
            raise RuntimeError("Exchange não inicializada. Execute connect() antes de publicar.")

        try:
            message_body = json.dumps(payload).encode("utf-8")
            message = Message(
                message_body,
                content_type="application/json",
                delivery_mode=DeliveryMode.PERSISTENT,
            )

            await self.exchange.publish(message, routing_key="")
            logger.info(f"📦 Mensagem publicada na fila '{self.queue_name}'")

        except Exception as e:
            logger.error(f"❌ Erro ao publicar mensagem: {e}")
            raise

    async def close(self):
        # Fecha a conexão com o RabbitMQ
        try:
            if self.channel and not self.channel.is_closed:
                await self.channel.close()
                logger.info("🔒 Canal RabbitMQ fechado")

            if self.connection and not self.connection.is_closed:
                await self.connection.close()
                logger.info("🔒 Conexão RabbitMQ encerrada")

        except Exception as e:
            logger.error(f"❌ Erro ao fechar conexão RabbitMQ: {e}")
