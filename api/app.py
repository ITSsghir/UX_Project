from services.artist_loader import ArtistLoader
import time
import json

async def main():
    artist_loader = ArtistLoader(max_artists=1000, debug=True)
    
    start_time = time.time()
    print("Starting artist loading...")
    
    try:
        await artist_loader.load_artists()
    except Exception as e:
        print(f"Error loading artists: {e}")
        return

    end_time = time.time()
    print(f"Execution time: {end_time - start_time:.2f} seconds")
    
    print("\n--- Results ---")
    print(f"\nTotal artists fetched: {artist_loader.get_total_artists()}")
    
    artists_by_country = artist_loader.get_artists_by_country()
    genre_popularity_by_country = artist_loader.get_genre_popularity_by_country()
    artists_per_genre_by_country = artist_loader.get_artists_by_genre_by_country()
    total_artists_by_country = sum(country["number_of_artists"] for country in artists_by_country)
    
    print("\nArtists by country:")
    print(json.dumps(artists_by_country, indent=4))
    
    #print("\nGenre popularity by country:")
    #print(json.dumps(genre_popularity_by_country, indent=4))
    
    #print("\nArtists per genre by country:")
    #print(json.dumps(artists_per_genre_by_country, indent=4))
    
    print(f"Total artists by country: {total_artists_by_country}")
    print(f"Total artists: {artist_loader.get_total_artists()}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
