import asyncio
from utils.logger import get_logger
from clients.weather_client import WeatherClient

logger = get_logger("collector.main")


async def main():
    client = WeatherClient()

    city = input("Digite o nome da cidade para testar: ").strip()
    logger.info(f"Consultando clima para '{city}'...")

    try:
        payload = await client.fetch_weather_by_city(city)
        if payload is None:
            logger.error(f"Falha: nenhum payload retornado para a cidade '{city}'.")
            return

        logger.info("Resultado final:")
        print("\n=== PAYLOAD ===")
        print(payload)
        print("===============\n")

    except Exception as e:
        logger.error(f"Erro inesperado ao processar a cidade '{city}': {e}")
        logger.error("TRACEBACK COMPLETO:")
        import traceback
        logger.error(traceback.format_exc())


if __name__ == "__main__":
    asyncio.run(main())
