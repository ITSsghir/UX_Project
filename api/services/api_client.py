import aiohttp
import requests
import time
import orjson
import concurrent.futures

class APIClient:
    BASE_URL = "https://wasabi.i3s.unice.fr/api/v1/artist_all/"

    def __init__(self, max_retries=5):
        self.max_retries = max_retries

    def fetch_artists(self, start_index, batch_size=200):
        if not isinstance(start_index, int) or start_index < 0:
            print("Invalid start index. It must be a non-negative integer.")
            return []

        url = f"{self.BASE_URL}{start_index}"
        for attempt in range(self.max_retries):
            try:
                end_index = start_index + batch_size
                print(f"Fetching artists from index range: [{start_index}, {end_index}[")
                with requests.get(url, timeout=20) as response:
                    response.raise_for_status()
                    data = orjson.loads(response.content)
                    print(f"Successfully retrieved data for index range: [{start_index}, {end_index}[")
                    return data
            except requests.HTTPError as e:
                print(f"Client error: {e.response.status_code}. Retrying...")
            except requests.RequestException as e:
                print(f"Network error on attempt {attempt + 1}: {e}")
        return []

    def fetch_artists_in_threads(self, start_indices, batch_size=200):
        results = []
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future_to_index = {executor.submit(self.fetch_artists, index, batch_size): index for index in start_indices}
            for future in concurrent.futures.as_completed(future_to_index):
                index = future_to_index[future]
                try:
                    data = future.result()
                    results.append((index, data))
                except Exception as e:
                    print(f"Error fetching data for index {index}: {e}")
        return results
