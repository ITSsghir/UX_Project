import requests

class APIClient:
    BASE_URL = "https://wasabi.i3s.unice.fr/api/v1/artist_all/"

    @staticmethod
    def fetch_artists(page):
        # Effectue l'appel API pour récupérer les artistes à partir de la page spécifiée
        response = requests.get(f"{APIClient.BASE_URL}{page}")
        
        try:
            response.raise_for_status()  # Vérifie que la requête a réussi
            artists = response.json()

            # Affichage pour voir combien d'artistes ont été retournés
            print(f"Appel à {APIClient.BASE_URL}{page} => Nombre d'artistes récupérés: {len(artists)}")

            return artists
        except requests.exceptions.RequestException as e:
            print(f"Erreur lors de la récupération des artistes de la page {page}: {e}")
            return []

    @staticmethod
    def fetch_all_artists(page):
        # Cette méthode est désormais sans paramètre max_pages
        all_artists = []
        artists = APIClient.fetch_artists(page)  # Récupère les artistes pour la page donnée

        if artists:
            all_artists.extend(artists)  # Ajouter les artistes récupérés à la liste finale

        return all_artists
