import requests

class APIClient:
    BASE_URL = "https://wasabi.i3s.unice.fr/api/v1/artist_all/"

    @staticmethod
    def fetch_artists(start):
        """Fetch artists starting from a specific index."""
        print(f"Fetching artists starting from index {start}...")  # Log the start index
        with requests.Session() as session:  # Use a session for better performance
            response = session.get(f"{APIClient.BASE_URL}{start}")
        
            try:
                response.raise_for_status()  # Check if the request was successful
                artists = response.json()
                print(f"Successfully fetched {len(artists)} artists starting from index {start}.")
                return artists
            except requests.exceptions.RequestException as e:
                print(f"Error fetching artists starting from index {start}: {e}")
                return []