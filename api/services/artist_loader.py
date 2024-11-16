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

        self.data_cache = CacheManager('cache.pkl')
        self.processor = ArtistProcessor()
        self.api_client = APIClient()

        self.data_cache.load_cache()

    def fetch_artists(self, start_index):
        return self.api_client.fetch_artists(start_index)  # Changed to synchronous call

    def process_all_artists(self):
        start_indices = range(0, self.max_artists, 200)  # Assuming 200 is the batch size
        results = []
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future_to_index = {executor.submit(self.fetch_artists, index): index for index in start_indices}
            for future in concurrent.futures.as_completed(future_to_index):
                index = future_to_index[future]
                try:
                    artists = future.result()
                    for artist in artists:
                        self.processor.process_artist(artist)
                        self.artist_data.append(artist)
                except Exception as e:
                    if self.debug:
                        print(f"Error fetching artists from index {index}: {e}")

    def load_artists(self):
        if self.debug:
            print("Loading artists...")
        if not self.data_cache.load_cache():
            if self.debug:
                print("No valid cache found, fetching new data...")
            try:
                self.process_all_artists()  # Changed to synchronous call
                self.total_artists = len(self.processor.artists_data)
                if self.debug:
                    print(f"Total artists loaded: {self.total_artists}")
            except Exception as e:
                if self.debug:
                    print(f"Error during artist loading: {e}")
        else:
            if self.debug:
                print("Using cached data.")
            self.artist_data = self.data_cache.cached_artists_data  
            self.total_artists = len(self.artist_data)  
            for artist in self.artist_data:  
                self.processor.process_artist(artist)
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