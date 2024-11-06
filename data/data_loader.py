from api_client import APIClient

class DataLoader:
    def __init__(self):
        self.artist_data = []
        self.total_artists = 0  # Compteur des artistes
        self.country_popularity = {}  # Dictionnaire pour stocker la popularité par pays
        self.genre_popularity_by_country = {}  # Dictionnaire pour stocker la popularité par genre et par pays

    def load_artists(self):
        # Utilise la fonction récursive pour récupérer les artistes sur 15 pages
        artists = APIClient.fetch_all_artists(page=1, max_pages=15)
        
        if artists:
            for artist_details in artists:
                location = artist_details.get("location", {})
                city = location.get("city", "Inconnu")
                country = location.get("country", "Inconnu")
                deezer_fans = artist_details.get("deezerFans", 0)
                genres = artist_details.get("genres", [])
                
                # Ajouter l'artiste aux données
                self.artist_data.append({
                    "name": artist_details["name"],
                    "location": f"{city}, {country}",
                    "deezer_fans": deezer_fans,
                    "genres": genres
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
            self.total_artists += len(artists)

    def get_artist_data(self):
        return self.artist_data
    
    def get_total_artists(self):
        return self.total_artists

    def get_country_popularity(self):
        return self.country_popularity

    def get_genre_popularity_by_country(self):
        return self.genre_popularity_by_country
