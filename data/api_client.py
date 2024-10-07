import requests

class APIClient:
    def __init__(self, base_url):
        self.base_url = base_url

    def fetch_artist_data(self):
        response = requests.get(f"{self.base_url}/artist/all/popularity")
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception("Erreur lors de la récupération des données de l'API")
