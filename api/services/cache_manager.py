import os
import pickle

class CacheManager:
    def __init__(self, cache_filepath='cache.pkl', processor=None):
        self.cache_filepath = cache_filepath
        self.cached_artists_data = processor.artists_data if processor else []
        self.cached_total_artists = processor.total_artists if processor else 0
        self.cached_country_popularity = processor.country_popularity if processor else {}
        self.cached_genre_popularity_by_country = processor.genre_popularity_by_country if processor else {}
        self.cached_artists_per_country = processor.artists_by_country if processor else []
        self.cached_artists_by_genre_by_country = processor.artists_by_genre_by_country if processor else []

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
                    self.cached_artists_by_genre_by_country = cached_data.get("artists_by_genre_by_country", [])
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
                    "artists_by_genre_by_country": self.cached_artists_by_genre_by_country
                }, cache_file)
            print("Cache saved.")
        except (pickle.PickleError, IOError) as e:
            print(f"Error saving cache: {e}")

    def clear_cache(self):
        """Clears the cached data."""
        self.cached_artists_data = []
        self.cached_total_artists = 0
        self.cached_country_popularity = {}
        self.cached_genre_popularity_by_country = {}
        self.cached_artists_per_country = []
        self.cached_artists_by_genre_by_country = []
        try:
            os.remove(self.cache_filepath)
            print("Cache cleared.")
        except FileNotFoundError:
            print("No cache file found.")
    
    def exists(self):
        """Check if the cache exists"""
        if os.path.exists(self.cache_filepath):
            return True
        return False