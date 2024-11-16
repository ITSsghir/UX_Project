import aiohttp
import asyncio
from .api_client import APIClient
from .cache_manager import CacheManager
from .artist_processor import ArtistProcessor

class ArtistLoader:
    def __init__(self, max_artists=77492, debug=False):
        self.artist_data = []
        self.total_artists = 0
        self.max_artists = max_artists
        self.debug = debug

        self.data_cache = CacheManager('cache.pkl')
        self.processor = ArtistProcessor()
        self.api_client = APIClient()

        self.data_cache.load_cache()

    async def fetch_artists(self, session, start_index):
        return await self.api_client.fetch_artists_async(session, start_index)

    async def process_all_artists(self):
        async with aiohttp.ClientSession() as session:
            tasks = [self.fetch_artists(session, index) for index in range(0, self.max_artists, 200)]
            results = await asyncio.gather(*tasks)
            for artists in results:
                if artists:
                    for artist in artists:
                        await self.processor.process_artist(artist)

    async def load_artists(self):
        if self.debug:
            print("Loading artists...")
        if not self.data_cache.load_cache():  # Use the updated method name
            if self.debug:
                print("No valid cache found, fetching new data...")
        else:
            if self.debug:
                print("Using cached data.")
            # Access the correct attribute name from CacheManager
            self.artist_data = self.data_cache.cached_artists_data  
            self.total_artists = len(self.artist_data)  
            for artist in self.artist_data:  
                # Await the processing of each artist (don't use asyncio.run)
                await self.processor.process_artist(artist)
            return 

    def get_total_artists(self):
        return self.total_artists
    
    def get_artist_data(self):
        return self.artist_data

    def get_artists_by_country(self):
        return self.processor.artists_by_country

    def get_genre_popularity_by_country(self):
        return self.processor.genre_popularity_by_country

    def get_country_popularity(self):
        return self.processor.country_popularity
    
    def get_artists_by_genre_by_country(self):
        return self.processor.artists_by_genre_by_country