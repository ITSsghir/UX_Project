import os
import pickle

class CacheManager:
    def __init__(self, cache_filepath='cache.pkl'):
        self.cache_filepath = cache_filepath
        self.cached_artists_data = []
        self.cached_total_artists = 0
        self.cached_country_popularity = {}
        self.cached_genre_popularity_by_country = {}
        self.cached_artists_per_country = []
        self.last_artist_count = 0

    def load_cache(self):
        """Loads cached data from a file if it exists."""
        if os.path.exists(self.cache_filepath):
            try:
                with open(self.cache_filepath, 'rb') as cache_file:
                    cached_data = pickle.load(cache_file)
                    self.cached_artists_data = cached_data.get("artist_data", [])
                    self.cached_total_artists = cached_data.get("total_artists", 0)
                    self.cached_country_popularity = cached_data.get("country_popularity", {})
                    self.cached_genre_popularity_by_country = cached_data.get("genre_popularity_by_country", {})
                    self.cached_artists_per_country = cached_data.get("artists_per_country", [])
                    self.last_artist_count = cached_data.get("last_artist_count", 0)
                print("Cached data loaded.")
                return True
            except (pickle.PickleError, IOError) as e:
                print(f"Error loading cache: {e}")
        return False

    def save_cache(self):
        """Saves the current state of data to a cache file."""
        try:
            print("Saving cached data...")
            with open(self.cache_filepath, 'wb') as cache_file:
                pickle.dump({
                    "artist_data": self.cached_artists_data,
                    "total_artists": self.cached_total_artists,
                    "country_popularity": self.cached_country_popularity,
                    "genre_popularity_by_country": self.cached_genre_popularity_by_country,
                    "artists_per_country": self.cached_artists_per_country,
                    "last_artist_count": self.cached_total_artists,
                }, cache_file)
            print("Cache saved.")
        except (pickle.PickleError, IOError) as e:
            print(f"Error saving cache: {e}")
