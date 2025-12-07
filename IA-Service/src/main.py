import asyncio
from services.rabbit_consumer import start_consumer
from core.logger import get_logger

logger = get_logger("ia.main")


from aiohttp import web

async def health_check(request):
    return web.Response(text="OK")

async def start_web_server():
    app = web.Application()
    app.router.add_get('/', health_check)
    app.router.add_get('/health', health_check)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '0.0.0.0', 8000)
    await site.start()
    logger.info("🌍 Dummy Web Server iniciado na porta 8000")

async def main():
    logger.info("🚀 IA-Service iniciado — aguardando mensagens do RabbitMQ...")
    
    # Inicia servidor web (fake) e consumer (real) simultaneamente
    await asyncio.gather(
        start_web_server(),
        start_consumer()
    )


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("IA-Service finalizado pelo usuário.")