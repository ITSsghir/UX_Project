import requests

class DataLoader:
    def __init__(self, api_client):
        self.api_client = api_client

    def load_artist_data(self):
        # Récupère les données de l'API
        artist_data = self.api_client.fetch_artist_data()
        
        # Traite les données ici (par exemple, filtrage, agrégation)
        processed_data = self.process_data(artist_data)
        
        return processed_data

    def process_data(self, data):
        # Traitement spécifique sur les données
        # Par exemple, sélectionner certains attributs ou faire des calculs
        return data  # Renvoie les données traitées
