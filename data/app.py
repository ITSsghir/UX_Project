from data_loader import DataLoader

def main():
    # Initialiser le DataLoader
    data_loader = DataLoader()
    
    # Charger les artistes (récupère les artistes des pages 1 à 15)
    data_loader.load_artists()
    
    # Récupérer les données des artistes
    artist_data = data_loader.get_artist_data()
    
    # Afficher les résultats des artistes
    for artist in artist_data:
        genres = ", ".join(artist["genres"])  # Affiche les genres sous forme de chaîne
        print(f"Artiste: {artist['name']}, Localisation: {artist['location']}, Nombre de fans: {artist['deezer_fans']}, Genre(s): {genres}")
    
    # Afficher le nombre total d'artistes récupérés
    print(f"\nTotal d'artistes récupérés: {data_loader.get_total_artists()}")
    
    # Récupérer et afficher la popularité par pays
    country_popularity = data_loader.get_country_popularity()
    print("\nPopularité par pays :")
    for country, data in country_popularity.items():
        print(f"{country}: Nombre total d'artistes: {data['artist_count']}, Popularité totale: {data['total_popularity']}")

    # Récupérer et afficher la popularité par genre et par pays
    genre_popularity_by_country = data_loader.get_genre_popularity_by_country()
    print("\nPopularité par genre et pays :")
    for country, genres_data in genre_popularity_by_country.items():
        print(f"{country}:")
        for genre, popularity in genres_data.items():
            print(f"  {genre}: Nombre de fans: {popularity}")

if __name__ == "__main__":
    main()
