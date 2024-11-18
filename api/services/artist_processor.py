class ArtistProcessor:
    def __init__(self):
        self.artists_data = []
        self.total_artists = 0
        self.country_popularity = {}
        self.genre_popularity_by_country = {}
        self.artists_by_country = []
        self.artists_by_genre_by_country = []

    def process_artist(self, artist_details):
        """Process artist details and update statistics."""
        def get_value(field, default="Unknown"):
            return field if field and field.strip() else default

        name = get_value(artist_details.get("name", ""))
        location = artist_details.get("location", {})
        city = get_value(location.get("city", ""))
        country = get_value(location.get("country", ""))
        deezer_fans = artist_details.get("deezerFans", 0)
        genres = artist_details.get("genres", [])
        albums = artist_details.get("albums", [])
        nb_albums = len(albums)
        nb_songs = sum(len(album.get("songs", [])) for album in albums)
        members = artist_details.get("members", [])
        

        artist_data = {
            "name": name,
            "location": f"{city}, {country}",
            "deezer_fans": deezer_fans,
            "genres": genres,
            "albums": {
                get_value(album.get("title", "")): [get_value(song.get("title", "")) for song in album.get("songs", [])]
                for album in albums
            },
            "nb_albums": nb_albums,
            "nb_songs": nb_songs,
            "country": country,
            "members": members
        }
        
        self.update_artists_by_country(country, 1, nb_songs, deezer_fans)
        self.update_country_popularity(country, deezer_fans)
        self.update_genre_popularity(country, genres, deezer_fans)
        for genre in genres:
            self.update_artists_by_genre_by_country(genre, name, country, deezer_fans, nb_songs, nb_albums)
        
        self.artists_data.append(artist_data)
        self.total_artists += 1
        
        return artist_data

    def update_artists_by_country(self, country, artist_count, song_count, deezer_fans):
        existing_entry = next((c for c in self.artists_by_country if c["country"] == country), None)
        if existing_entry:
            existing_entry["number_of_artists"] += artist_count
            existing_entry["number_of_songs"] += song_count
            existing_entry["deezer_fans"] += deezer_fans
        else:
            self.artists_by_country.append({
                "country": country,
                "number_of_artists": artist_count,
                "number_of_songs": song_count,
                "deezer_fans": deezer_fans
            })

    def update_country_popularity(self, country, deezer_fans):
        if country not in self.country_popularity:
            self.country_popularity[country] = {"artist_count": 0, "total_popularity": 0}
        self.country_popularity[country]["artist_count"] += 1
        self.country_popularity[country]["total_popularity"] += deezer_fans

    def update_genre_popularity(self, country, genres, deezer_fans):
        if country not in self.genre_popularity_by_country:
            self.genre_popularity_by_country[country] = {}
        for genre in genres:
            if genre not in self.genre_popularity_by_country[country]:
                self.genre_popularity_by_country[country][genre] = 0
            self.genre_popularity_by_country[country][genre] += deezer_fans

    def update_artists_by_genre_by_country(self, genre, name, country, deezer_fans, song_count, album_count):
        existing_entry = next((g for g in self.artists_by_genre_by_country if g["genre"] == genre), None)
        if existing_entry:
            existing_entry["artists"].append({
                "name": name,
                "number_of_songs": song_count,
                "number_of_albums": album_count,
                "deezer_fans": deezer_fans,
                "country": country
            })
        else:
            self.artists_by_genre_by_country.append({
                "genre": genre,
                "artists": [{
                    "name": name,
                    "number_of_songs": song_count,
                    "number_of_albums": album_count,
                    "deezer_fans": deezer_fans,
                    "country": country
                }]
            })

    # Filtering Methods
    def filter_artists_by_country(self, country):
        """Return artists from a specific country."""
        return [artist for artist in self.artists_by_country if artist['country'] == country]

    def filter_genre_popularity_by_country(self, country):
        """Return genre popularity in a specific country."""
        return self.genre_popularity_by_country.get(country, {})

    def filter_artists_by_genre_in_country(self, country, genre):
        """Return artists from a specific genre in a specific country."""
        return [artist for artist in self.artists_by_genre_by_country
                if artist['genre'] == genre and any(a['country'] == country for a in artist['artists'])]

    def get_all_artists(self):
        return self.artists_data
    
    def get_total_artists(self):
        return len(self.artists_data)

    def get_country_popularity(self):
        return self.country_popularity

    def get_artists_by_country(self):
        return self.artists_by_country

    def get_genre_popularity_by_country(self):
        return self.genre_popularity_by_country

    def get_artists_by_genre_by_country(self):
        return self.artists_by_genre_by_country
    
    def get_members(self):
        members = []
        for artist in self.artists_data:
            artist_name = artist.get("name")
            artist_members = artist.get("members")
            members.append(
                {
                    "artist": artist_name,
                    "members": artist_members
                }
            )
        return members