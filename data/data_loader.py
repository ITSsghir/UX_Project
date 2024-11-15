import aiohttp
import asyncio
import pickle
import os
import time
from concurrent.futures import ThreadPoolExecutor
from api_client import APIClient

class DataLoader:
    def __init__(self, max_artists=77492, debug=False):
        self.api_client = APIClient()  # Initialize APIClient
        self.artist_data = []
        self.total_artists = 0
        self.country_popularity = {}
        self.genre_popularity_by_country = {}
        self.artists_per_country = []
        self.artists_per_genre = []
        self.cache_file = 'cache.pkl'
        self.max_artists = max_artists
        self.semaphore = asyncio.Semaphore(15)
        self.queue = asyncio.Queue()
        self.debug = debug
        self.last_artist_count = 0
        self.load_cached_data()

    # Load cached data (unchanged except duplicate removal)
    def load_cached_data(self):
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, 'rb') as f:
                    cached_data = pickle.load(f)
                    self.artist_data = cached_data.get("artist_data", [])
                    self.total_artists = cached_data.get("total_artists", 0)
                    self.country_popularity = cached_data.get("country_popularity", {})
                    self.genre_popularity_by_country = cached_data.get("genre_popularity_by_country", {})
                    self.artists_per_country = cached_data.get("artists_per_country", [])
                    self.last_artist_count = cached_data.get("last_artist_count", 0)
                if self.debug:
                    print("Attempting to load cached data.")
                print("Cached data loaded.")
                return True
            except (pickle.PickleError, IOError) as e:
                print(f"Error loading cache: {e}")
        return False

    # Save cached data (unchanged except duplicate removal)
    def save_cached_data(self):
        try:
            with open(self.cache_file, 'wb') as f:
                pickle.dump({
                    "artist_data": self.artist_data,
                    "total_artists": self.total_artists,
                    "country_popularity": self.country_popularity,
                    "genre_popularity_by_country": self.genre_popularity_by_country,
                    "artists_per_country": self.artists_per_country,
                    "last_artist_count": self.total_artists,
                }, f)
            if self.debug:
                print("Saving cached data.")
            print("Cache saved.")
        except (pickle.PickleError, IOError) as e:
            print(f"Error saving cache: {e}")

    async def fetch_artists(self, session, start_index):
        return await self.api_client.fetch_artists_async(session, start_index)  # Use APIClient

    async def process_artist(self, artist_details):
        """Process artist details and update relevant statistics."""
        # Use a helper function to get values with a default of "Inconnu"
        def get_value(field, default="Inconnu"):
            return field if field and field.strip() else default

        # Extract relevant artist details
        name = get_value(artist_details.get("name", ""))
        location = artist_details.get("location", {})
        city = get_value(location.get("city", ""))
        country = get_value(location.get("country", ""))
        deezer_fans = artist_details.get("deezerFans", 0)
        genres = artist_details.get("genres", [])
        albums = artist_details.get("albums", [])
        nb_albums = len(albums)
        nb_songs = sum(len(album.get("songs", [])) for album in albums)
        
        artist_albums = {
            get_value(album.get("title", "")): [get_value(song.get("title", "")) for song in album.get("songs", [])]
            for album in albums
        }

        artist_data = {
            "name": name,
            "location": f"{city}, {country}",
            "deezer_fans": deezer_fans,
            "genres": genres,
            "albums": artist_albums,
            "nb_albums": nb_albums,
            "nb_songs": nb_songs,
            "country": country
        }
        
        # Construct the artist per country object (country, number of artists, number of songs, number of deezer fans)
        nb_songs = sum(len(songs) for songs in artist_albums.values())
        
        self.update_artists_per_country(country, 1, nb_songs, deezer_fans)
        self.update_country_popularity(country, deezer_fans)
        self.update_genre_popularity_by_country(country, genres, deezer_fans)
        for genre in genres:
            self.update_artists_per_genre(genre, name, deezer_fans, nb_songs, nb_albums)

        return artist_data  # Return processed artist data

    async def worker(self):
        """Worker to process artists from the queue."""
        while True:
            artist_details = await self.queue.get()
            if artist_details is None:  # Exit signal
                break
            await self.process_artist(artist_details)  # Await the coroutine
            self.queue.task_done()

    async def fetch_all_artists(self):
        """Fetch all artists concurrently using asynchronous requests."""
        all_artists = []
        
        # Check if max_artists exceeds the allowed limit
        if self.max_artists > 77492:
            print(f"Error: Requested number of artists ({self.max_artists}) exceeds the maximum allowed limit (77492).")
            return all_artists  # Return an empty list if the limit is exceeded
        if self.max_artists == 0:
            print("Error: Requested number of artists is 0.")
            return all_artists
        if self.max_artists < 0:
            print("Error: Requested number of artists is negative.")
            return all_artists

        # Create a single ClientSession for connection pooling
        async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(limit=100)) as session:
            tasks = []
            for start_index in range(0, self.max_artists, 200):  # Adjust batch size if needed
                tasks.append(self.fetch_artists(session, start_index))

            # Start timing the fetching process
            start_time_fetch = time.time()
            results = await asyncio.gather(*tasks)
            end_time_fetch = time.time()

            for artists in results:
                if artists:
                    all_artists.extend(artists)
                    for artist in artists:
                        await self.queue.put(artist)  # Add artist to the processing queue
            if self.debug:
                print(f"Total artists fetched: {len(all_artists)}")
                print(f"Time taken to fetch all artists: {end_time_fetch - start_time_fetch:.2f} seconds")

        # Start worker tasks for processing artists
        workers = [asyncio.create_task(self.worker()) for _ in range(5)]  # Adjust number of workers as needed
        await self.queue.join()  # Wait until all artists are processed

        # Stop workers
        for _ in workers:
            await self.queue.put(None)  # Send exit signal to workers
        await asyncio.gather(*workers)  # Wait for all workers to finish

        return all_artists

    def load_artists(self):
        """Load artists by fetching data asynchronously."""
        if self.debug:
            print("Loading artists...")
        # Load cached data first
        if not self.load_cached_data():  # Attempt to load cached data
            if self.debug:
                print("No valid cache found, fetching new data...")
        else:
            if self.debug:
                print("Using cached data.")
            return  # Exit early if cached data is sufficient

        # Fetch artists if no valid cache is found
        self.artist_data = []
        self.country_popularity = {}
        self.genre_popularity_by_country = {}
        self.artists_per_country = []
        all_artists = asyncio.run(self.fetch_all_artists())
        if all_artists:
            self.total_artists = len(all_artists)
            if self.debug:
                print(f"Total artists fetched: {self.total_artists}")
            self.save_cached_data()  # Save processed data to cache
        else:
            print("No artists fetched, cache not updated.")  # Debug statement
    

    def update_artists_per_country(self, country, number_of_artists, number_of_songs, deezer_fans):
        # Get the object from the list by country
        artist_per_country = next((country_artists for country_artists in self.artists_per_country if country_artists["country"] == country), None)
        if artist_per_country:
            artist_per_country["number_of_artists"] += number_of_artists
            artist_per_country["number_of_songs"] += number_of_songs
            artist_per_country["deezer_fans"] += deezer_fans
        else:
            self.artists_per_country.append({
                "country": country,
                "number_of_artists": number_of_artists,
                "number_of_songs": number_of_songs,
                "deezer_fans": deezer_fans
            })
        
    def update_country_popularity(self, country, deezer_fans):
        self.country_popularity.setdefault(country, {"artist_count": 0, "total_popularity": 0})
        self.country_popularity[country]["artist_count"] += 1
        self.country_popularity[country]["total_popularity"] += deezer_fans

    def update_genre_popularity_by_country(self, country, genres, deezer_fans):
        self.genre_popularity_by_country.setdefault(country, {})
        for genre in genres:
            self.genre_popularity_by_country[country].setdefault(genre, 0)
            self.genre_popularity_by_country[country][genre] += deezer_fans
    
    def update_artists_per_genre(self, genre, name, deezer_fans, nb_songs, nb_albums):
        # Get the object from the list by genre
        artist_per_genre = next((genre_artists for genre_artists in self.artists_per_genre if genre_artists["genre"] == genre), None)
        
        if artist_per_genre:
            # Construct the object (name, number of songs, number of albums, number of deezer fans)
            artist_per_genre[genre].append({
                "name": name,
                "number_of_songs": nb_songs,
                "number_of_albums": nb_albums,
                "deezer_fans": deezer_fans
            })
        else:
            self.artists_per_genre.append({
                "genre": genre,
                genre: [{
                    "name": name,
                    "number_of_songs": nb_songs,
                    "number_of_albums": nb_albums,
                    "deezer_fans": deezer_fans
                }]
            })
            

    def get_artist_data(self):
        return self.artist_data
    
    def get_total_artists(self):
        return self.total_artists

    def get_country_popularity(self):
        return self.country_popularity

    def get_genre_popularity_by_country(self):
        return self.genre_popularity_by_country

    def get_artists_per_country(self):
        return self.artists_per_country
    
    def get_artists_per_genre(self):
        return self.artists_per_genre