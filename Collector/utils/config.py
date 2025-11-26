import os


class Config:
    COLLECT_INTERVAL_SECONDS = int(os.getenv("COLLECT_INTERVAL_SECONDS", 3600))
    RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
    RABBITMQ_EXCHANGE = os.getenv("RABBITMQ_EXCHANGE", "weather")
    RABBITMQ_QUEUE = os.getenv("RABBITMQ_QUEUE", "weather.logs")


config = Config()
