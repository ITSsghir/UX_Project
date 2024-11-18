import concurrent.futures  # Added for threading
from .api_client import APIClient
from .cache_manager import CacheManager
from .artist_processor import ArtistProcessor

class ArtistLoader:
    def __init__(self, max_artists=77492, debug=False):
        self.artist_data = []
        self.total_artists = 0
        self.max_artists = max_artists
        self.debug = debug


        self.processor = ArtistProcessor()
        self.data_cache = CacheManager(f'cache_{max_artists}_artists.pkl', self.processor)
        self.api_client = APIClient()

    def fetch_artists(self):
        return self.api_client.fetch_artists_in_threads(self.max_artists)

    def process_all_artists(self):
        # Fetch artists data
        artists_data = self.fetch_artists()
        if not artists_data:
            raise Exception("No data fetched.")
        if self.debug:
            print(f"Total artists fetched: {len(artists_data)}")
        # Process artists data
        with concurrent.futures.ThreadPoolExecutor() as executor:
            executor.map(self.processor.process_artist, artists_data)
        if self.debug:
            print("All artists processed.")
        self.artist_data = self.processor.artists_data
        self.total_artists = self.processor.get_total_artists()
        
    def load_cache_from_file(self):
        if self.debug:
            print("Loading cache from file...")
        if not self.data_cache.load_cache():
            if self.debug:
                print("Cache not found.")
            return False
        if self.debug:
            print("Cache loaded.")
        self.artist_data = self.data_cache.cached_artists_data

        self.processor.country_popularity = self.data_cache.cached_country_popularity
        self.processor.genre_popularity_by_country = self.data_cache.cached_genre_popularity_by_country
        self.processor.artists_by_genre_by_country = self.data_cache.cached_artists_by_genre_by_country
        self.processor.artists_by_country = self.data_cache.cached_artists_per_country
        self.processor.artists_data = self.data_cache.cached_artists_data
        self.processor.total_artists = len(self.data_cache.cached_artists_data)
        self.total_artists = self.processor.total_artists
        if self.debug:
            print("Total artists loaded from cache:", self.total_artists)
        
        return True

    def load_artists(self):
        if self.debug:
            print("Loading artists...")
        if not self.load_cache_from_file():
            self.process_all_artists()
            self.data_cache.save_cache()
        if self.debug:
            print("Artists loaded successfully!")

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
    
    def get_members(self):
        return self.processor.get_members()