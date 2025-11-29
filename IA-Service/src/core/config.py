import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    RABBIT_URL: str = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
    RAW_QUEUE: str = os.getenv("RAW_QUEUE", "weather.logs")
    ENRICHED_QUEUE: str = os.getenv("ENRICHED_QUEUE", "weather.ai")

    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
