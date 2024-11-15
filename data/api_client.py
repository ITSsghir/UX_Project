import aiohttp
import asyncio
import requests
import time
import orjson  # Import orjson for fast JSON handling

class APIClient:
    BASE_URL = "https://wasabi.i3s.unice.fr/api/v1/artist_all/"

    def __init__(self, max_retries=5):
        self.max_retries = max_retries
        self.semaphore = asyncio.Semaphore(15)  # Limit to 15 concurrent requests

    async def fetch_artists_async(self, session, start_index, batch_size=200):
        """Fetch artists asynchronously using aiohttp and orjson."""
        if not isinstance(start_index, int) or start_index < 0:
            print("Invalid start index. It must be a non-negative integer.")
            return []

        url = f"{self.BASE_URL}{start_index}"
        async with self.semaphore:  # Acquire the semaphore
            for attempt in range(self.max_retries):
                try:
                    # Calculate the range for logging
                    end_index = start_index + batch_size
                    print(f"Fetching artists from index range: [{start_index}, {end_index}[")
                    async with session.get(url, timeout=20) as response:  # Increased timeout
                        response.raise_for_status()
                        data = orjson.loads(await response.read())
                        print(f"Successfully retrieved data for index range: [{start_index}, {end_index}[")
                        return data
                except aiohttp.ClientResponseError as e:
                    if e.status == 429:  # Too Many Requests
                        wait_time = 2 ** attempt
                        print(f"Rate limit hit. Retrying in {wait_time}s...")
                        await asyncio.sleep(wait_time)
                    else:
                        print(f"Client error: {e.status}.")
                        break
                except aiohttp.ClientError as e:
                    print(f"Network error on attempt {attempt + 1}: {e}")
                    await asyncio.sleep(2 ** attempt)
                except asyncio.TimeoutError:
                    print(f"Request timed out for index {start_index}. Attempt {attempt + 1}.")
                    await asyncio.sleep(2 ** attempt)  # Retry after timeout
        return []

    def fetch_artists_sync(self, start_index):
        """Fetch artists synchronously using requests and orjson."""
        if not isinstance(start_index, int) or start_index < 0:
            print("Invalid start index. It must be a non-negative integer.")
            return []

        url = f"{self.BASE_URL}{start_index}"
        with requests.Session() as session:
            for attempt in range(self.max_retries):
                try:
                    response = session.get(url, timeout=10)  # Set a timeout
                    response.raise_for_status()
                    print(f"Successfully retrieved data for index: {start_index}")
                    return orjson.loads(response.content)  # Use orjson to parse JSON directly
                except requests.exceptions.RequestException as e:
                    wait_time = 2 ** attempt
                    print(f"Sync request error. Retrying in {wait_time}s... {e}")
                    time.sleep(wait_time)
        return []
