import aiohttp
import asyncio
from api_client import APIClient

class DataLoader:
    def __init__(self):
        self.artist_data = []
        self.total_artists = 0  # Compteur des artistes
        self.country_popularity = {}  # Dictionnaire pour stocker la popularité par pays
        self.genre_popularity_by_country = {}  # Dictionnaire pour stocker la popularité par genre et par pays
        self.artists_per_country = [] # Liste pour stocker les artistes par pays
        
    async def fetch_artists(self, session, page):
        """Fetch artists from a specific page asynchronously."""
        print(f"Fetching artists from page {page}...")  # Log the page being fetched
        try:
            url = f'{APIClient.BASE_URL}{page}'  # Construct the URL with page number
            async with session.get(url) as response:
                response.raise_for_status()  # Check for HTTP errors
                artists = await response.json()
                print(f"Successfully fetched {len(artists)} artists from page {page}.")  # Log success
                return artists
        except Exception as e:
            print(f"Erreur lors de la récupération des artistes de la page {page}: {e}")
            return []

    async def fetch_all_artists(self, max_pages):
        """Fetch all artists concurrently using asynchronous requests."""
        all_artists = []
        async with aiohttp.ClientSession() as session:
            tasks = [self.fetch_artists(session, page) for page in range(1, max_pages + 1)]
            results = await asyncio.gather(*tasks)

            for artists in results:
                if artists:
                    all_artists.extend(artists)

        print(f"Total artists fetched: {len(all_artists)}")  # Log total artists fetched
        return all_artists

    def load_artists(self, max_pages=15):
        """Load artists by fetching data asynchronously."""
        print(f"Loading artists from {max_pages} pages...")  # Log the start of loading
        all_artists = asyncio.run(self.fetch_all_artists(max_pages))
        if all_artists:
            for artist_details in all_artists:
                self.process_artist(artist_details)
            self.total_artists += len(all_artists)
            print(f"Total artists processed: {self.total_artists}")  # Log total artists processed

    def process_artist(self, artist_details):
        location = artist_details.get("location", {})
        city = location.get("city", "Inconnu")
        country = location.get("country", "Inconnu")
        deezer_fans = artist_details.get("deezerFans", 0)
        genres = artist_details.get("genres", [])
        albums = artist_details.get("albums", [])
        
        artist_albums = {
            album.get("title", "Inconnu"): [song.get("title", "Inconnu") for song in album.get("songs", [])]
            for album in albums
        }

        self.artist_data.append({
            "name": artist_details["name"],
            "location": f"{city}, {country}",
            "deezer_fans": deezer_fans,
            "genres": genres,
            "albums": artist_albums
        })
        
        # Construct the artist per country object (country, number of artists, number of songs, number of deezer fans)
        nb_songs = sum([len(songs) for songs in artist_albums.values()])
        
        self.update_artists_per_country(country, 1, nb_songs, deezer_fans)
        self.update_country_popularity(country, deezer_fans)
        self.update_genre_popularity_by_country(country, genres, deezer_fans)

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