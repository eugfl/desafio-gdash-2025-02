import asyncio
import os
from logger import get_logger
from clients.weather_client import WeatherClient
from clients.rabbitmq_client import RabbitMQPublisher

logger = get_logger("collector.main")


async def main():
    client = WeatherClient()
    publisher = RabbitMQPublisher(
        amqp_url=os.getenv("RABBITMQ_URL"),
        exchange=os.getenv("RABBITMQ_EXCHANGE"),
        queue=os.getenv("RABBITMQ_QUEUE"),
    )

    await publisher.connect()

    city = input("Digite o nome da cidade para testar: ").strip()
    payload = await client.fetch_weather_by_city(city)

    if payload:
        await publisher.publish(payload)

    await publisher.close()


if __name__ == "__main__":
    asyncio.run(main())
