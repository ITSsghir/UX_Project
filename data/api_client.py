import requests

class APIClient:
    BASE_URL = "https://wasabi.i3s.unice.fr/api/v1/artist/name/"
    
    @staticmethod
    def fetch_artist_details(artist_name):
        try:
            response = requests.get(f"{APIClient.BASE_URL}{artist_name}")
            response.raise_for_status()  # Vérifie que la requête a réussi
            return response.json()  # Retourne les données JSON
        except requests.exceptions.RequestException as e:
            print(f"Erreur lors de la récupération des détails de l'artiste {artist_name}: {e}")
            return None
