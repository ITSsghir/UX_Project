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
    def fetch_all_artists(page=1, max_pages=3):
        # Fonction récursive pour récupérer les artistes sur plusieurs pages
        all_artists = []
        current_page = page
        
        while current_page <= max_pages:
            print(f"Récupération des artistes de la page {current_page}...")
            artists = APIClient.fetch_artists(current_page)
            
            if artists:
                all_artists.extend(artists)  # Ajouter les artistes récupérés à la liste finale
                
            current_page += 1  # Passer à la page suivante

        return all_artists
