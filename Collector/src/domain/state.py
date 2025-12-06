from typing import Optional
from asyncio import Lock, Event


class CollectorState:
    def __init__(self):
        self.city: Optional[str] = None
        self.lock = Lock()
        self.city_changed = Event()

    async def set_city(self, city: str):
        async with self.lock:
            old_city = self.city
            self.city = city
            
            if old_city != city:
                self.city_changed.set()  

    async def get_city(self) -> Optional[str]:
        async with self.lock:
            return self.city
    
    async def wait_for_city_change(self):
        await self.city_changed.wait()
        self.city_changed.clear()


state = CollectorState()
