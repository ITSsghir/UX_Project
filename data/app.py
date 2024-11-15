from data_loader import DataLoader
import time
import json

def main():
    # Initialiser le DataLoader
    data_loader = DataLoader(max_artists=1000)
    
    start_time = time.time()
    print("Starting to load artists...")  # Log the start of the loading process
    
    # Load artists (fetch all available artists)
    data_loader.load_artists()
    
    end_time = time.time()
    print(f"Execution time: {end_time - start_time:.2f} seconds")  # Log execution time
    
    print("\n--- Results ---")
    # Display the total number of artists fetched
    print(f"\nTotal artists fetched: {data_loader.total_artists}")
    
    artists_per_country = data_loader.get_artists_per_country()
    
    total_artists_per_country = 0
    # Count the total number of artists from each country and compare with the total number of artists
    for country_artists in artists_per_country:
        country = country_artists["country"]
        artist_count = country_artists["number_of_artists"]
        total_artists_per_country += artist_count
    
    print(f"Total artists by country: {total_artists_per_country}")
    print(f"Total artists: {data_loader.total_artists}")

if __name__ == "__main__":
    main()