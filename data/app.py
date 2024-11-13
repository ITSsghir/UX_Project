from data_loader import DataLoader
import time
import json

def main():
    # Initialiser le DataLoader
    data_loader = DataLoader()
    
    start_time = time.time()
    
    # Charger les artistes (récupère les artistes des pages 1 à 15)
    data_loader.load_artists(2)
    
    end_time = time.time()
    print(f"Temps d'exécution: {end_time - start_time} second")
    
    print("\n--- Résultats ---")
    print("Country Popularity:")
    print(json.dumps(data_loader.get_country_popularity(), indent=4))
    
    ## Récupérer les données des artistes
    #artist_data = data_loader.get_artist_data()
    
    # Afficher les résultats des artistes
    #for artist in artist_data:
    #    genres = ", ".join(artist["genres"])  # Affiche les genres sous forme de chaîne
    #    print(f"Artiste: {artist['name']}, Localisation: {artist['location']}, Nombre de fans: {artist['deezer_fans']}, Genre(s): {genres}")
        
    #    # Afficher les albums et les titres des musiques
    #    if artist["albums"]:
    #        print("  Albums :")
    #        for album_title, songs in artist["albums"].items():
    #            print(f"    - Album: {album_title}")
    #            for song in songs:
    #                print(f"      - Musique: {song}")
    #    else:
    #        print("  Aucun album trouvé.")

    # Afficher le nombre total d'artistes récupérés
    print(f"\nTotal d'artistes récupérés: {data_loader.total_artists}")
    
    artists_per_country = data_loader.get_artists_per_country()
    
    print("Artistes par pays")
    # Beautiful JSON print
    print(json.dumps(artists_per_country, indent=4))
    
    total_artists_per_country = 0
    # Count the total number of artists from each country and compare with the total number of artists
    for country_artists in artists_per_country:
        country = country_artists["country"]
        artist_count = country_artists["number_of_artists"]
        total_artists_per_country += artist_count
        print(f"{country}: {artist_count} artistes")
    
    print(f"Total artistes par pays: {total_artists_per_country}")
    print(f"Total artists: {data_loader.total_artists}")
    
    # Récupérer et afficher la popularité par pays
    #country_popularity = data_loader.get_country_popularity()
    #print("\nPopularité par pays :")
    #for country, data in country_popularity.items():
    #    print(f"{country}: Nombre total d'artistes: {data['artist_count']}, Popularité totale: {data['total_popularity']}")

    # Récupérer et afficher la popularité par genre et par pays
    #genre_popularity_by_country = data_loader.get_genre_popularity_by_country()
    #print("\nPopularité par genre et pays :")
    #for country, genres_data in genre_popularity_by_country.items():
    #    print(f"{country}:")
    #    for genre, popularity in genres_data.items():
    #        print(f"  {genre}: Nombre de fans: {popularity}")

if __name__ == "__main__":
    main()