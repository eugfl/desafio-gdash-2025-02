from typing import Optional
from asyncio import Lock


class CollectorState:
    def __init__(self):
        self.city: Optional[str] = None
        self.lock = Lock()

    async def set_city(self, city: str):
        async with self.lock:
            self.city = city

    async def get_city(self) -> Optional[str]:
        async with self.lock:
            return self.city


state = CollectorState()
