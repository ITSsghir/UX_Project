from api_client import APIClient

class DataLoader:
    def __init__(self, artist_names):
        self.artist_names = artist_names
        self.artist_data = []

    def load_artists(self):
        for name in self.artist_names:
            artist_details = APIClient.fetch_artist_details(name)
            if artist_details:
                location = artist_details.get("location", {})
                city = location.get("city", "Inconnu")
                country = location.get("country", "Inconnu")
                # Ajouter le nombre de fans
                deezer_fans = artist_details.get("deezerFans", 0)  # Par défaut 0 si non spécifié
                self.artist_data.append({
                    "name": artist_details["name"],
                    "location": f"{city}, {country}",
                     "deezer_fans": deezer_fans  # Ajout du nombre de fans Deezer
                })

    def get_artist_data(self):
        return self.artist_data
