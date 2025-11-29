import asyncio
import uvicorn
from Collector.src.scheduler.collector_loop import run_collector_loop


async def start():
    collector_task = asyncio.create_task(run_collector_loop())

    server_config = uvicorn.Config("server:app", host="0.0.0.0", port=8000, reload=False)
    server = uvicorn.Server(server_config)
    server_task = asyncio.create_task(server.serve())

    await asyncio.gather(collector_task, server_task)


if __name__ == "__main__":
    asyncio.run(start())
