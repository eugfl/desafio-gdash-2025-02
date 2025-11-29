import asyncio
from services.rabbit_consumer import start_consumer
from core.logger import get_logger

logger = get_logger("ia.main")


async def main():
    logger.info("🚀 IA-Service iniciado — aguardando mensagens do RabbitMQ...")
    await start_consumer()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("IA-Service finalizado pelo usuário.")