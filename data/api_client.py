import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

class APIClient:
    BASE_URL = "https://wasabi.i3s.unice.fr/api/v1/artist_all/"

    @staticmethod
    def fetch_artists(page):
        # Effectue l'appel API pour récupérer les artistes à partir de la page spécifiée
        print(f"Fetching artists from page {page}...")  # Log the page being fetched
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
    def fetch_all_artists(max_pages):
        all_artists = []
        print(f"Fetching artists from {max_pages} pages...")  # Log the start of fetching all artists

        with ThreadPoolExecutor() as executor:
            future_to_page = {executor.submit(APIClient.fetch_artists, page): page for page in range(1, max_pages + 1)}

            for future in as_completed(future_to_page):
                page = future_to_page[future]
                try:
                    artists = future.result()
                    if artists:
                        all_artists.extend(artists)  # Ajouter les artistes récupérés à la liste finale
                except Exception as e:
                    print(f"Erreur lors de la récupération des artistes de la page {page}: {e}")

        print(f"Total artists fetched: {len(all_artists)}")  # Log total artists fetched
        return all_artists