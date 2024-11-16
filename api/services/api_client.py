import aiohttp
import asyncio
import requests
import time
import orjson

class APIClient:
    BASE_URL = "https://wasabi.i3s.unice.fr/api/v1/artist_all/"

    def __init__(self, max_retries=5):
        self.max_retries = max_retries
        self.semaphore = asyncio.Semaphore(15)

    async def fetch_artists_async(self, session, start_index, batch_size=200):
        if not isinstance(start_index, int) or start_index < 0:
            print("Invalid start index. It must be a non-negative integer.")
            return []

        url = f"{self.BASE_URL}{start_index}"
        async with self.semaphore:
            for attempt in range(self.max_retries):
                try:
                    end_index = start_index + batch_size
                    print(f"Fetching artists from index range: [{start_index}, {end_index}[")
                    async with session.get(url, timeout=20) as response:
                        response.raise_for_status()
                        data = orjson.loads(await response.read())
                        print(f"Successfully retrieved data for index range: [{start_index}, {end_index}[")
                        return data
                except aiohttp.ClientResponseError as e:
                    print(f"Client error: {e.status}. Retrying...")
                    if e.status == 429:
                        await asyncio.sleep(2 ** attempt)
                    else:
                        break
                except (aiohttp.ClientError, asyncio.TimeoutError) as e:
                    print(f"Network error on attempt {attempt + 1}: {e}")
                    await asyncio.sleep(2 ** attempt)
        return []
