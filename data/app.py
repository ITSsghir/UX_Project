from data_loader import DataLoader

def main():
    # Liste d'artistes à récupérer
    artist_names = ["Metallica"]  # Pour l'instant, juste Metallica
    data_loader = DataLoader(artist_names)
    
    # Charger les artistes
    data_loader.load_artists()
    
    # Récupérer les données
    artist_data = data_loader.get_artist_data()
    
    # Afficher les résultats
    for artist in artist_data:
       print(f"Artiste: {artist['name']}, Localisation: {artist['location']}, Nombre de fans Deezer: {artist['deezer_fans']}")

if __name__ == "__main__":
    main()
