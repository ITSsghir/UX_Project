from api_client import APIClient

class DataLoader:
    def __init__(self):
        self.artist_data = []
        self.total_artists = 0  # Compteur des artistes
        self.country_popularity = {}  # Dictionnaire pour stocker la popularité par pays
        self.genre_popularity_by_country = {}  # Dictionnaire pour stocker la popularité par genre et par pays

    def load_artists(self, max_pages=15):
        # Utilise la fonction pour récupérer les artistes sur un nombre de pages spécifié
        all_artists = []
        
        for page in range(1, max_pages + 1):  # Pour chaque page jusqu'à max_pages
            print(f"Récupération des artistes de la page {page}...")
            artists = APIClient.fetch_all_artists(page)
            
            if artists:
                all_artists.extend(artists)  # Ajouter les artistes récupérés à la liste finale

        if all_artists:
            # Traite les artistes récupérés
            for artist_details in all_artists:
                location = artist_details.get("location", {})
                city = location.get("city", "Inconnu")
                country = location.get("country", "Inconnu")
                deezer_fans = artist_details.get("deezerFans", 0)
                genres = artist_details.get("genres", [])
                
                # Récupérer les albums et les titres des musiques
                albums = artist_details.get("albums", [])
                artist_albums = {}
                
                for album in albums:
                    album_title = album.get("title", "Inconnu")  # Utilisation du champ 'title' pour le nom de l'album
                    album_songs = album.get("songs", [])
                    song_titles = [song.get("title", "Inconnu") for song in album_songs]  # Extraction des titres des chansons
                    artist_albums[album_title] = song_titles  # Associer chaque album à ses titres de musique
                
                # Ajouter l'artiste aux données
                self.artist_data.append({
                    "name": artist_details["name"],
                    "location": f"{city}, {country}",
                    "deezer_fans": deezer_fans,
                    "genres": genres,
                    "albums": artist_albums  # Ajout des albums et des titres
                })
                
                # Calculer la popularité par pays
                if country not in self.country_popularity:
                    self.country_popularity[country] = {
                        "artist_count": 0,
                        "total_popularity": 0
                    }
                
                self.country_popularity[country]["artist_count"] += 1
                self.country_popularity[country]["total_popularity"] += deezer_fans

                # Calculer la popularité par genre et par pays
                if country not in self.genre_popularity_by_country:
                    self.genre_popularity_by_country[country] = {}

                for genre in genres:
                    if genre not in self.genre_popularity_by_country[country]:
                        self.genre_popularity_by_country[country][genre] = 0
                    self.genre_popularity_by_country[country][genre] += deezer_fans
                
            # Mettre à jour le compteur avec le nombre d'artistes récupérés
            self.total_artists += len(all_artists)

    def get_artist_data(self):
        return self.artist_data
    
    def get_total_artists(self):
        return self.total_artists

    def get_country_popularity(self):
        return self.country_popularity

    def get_genre_popularity_by_country(self):
        return self.genre_popularity_by_country
