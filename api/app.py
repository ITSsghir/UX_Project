import signal
import asyncio
from services.artist_loader import ArtistLoader
import time
import json

# Global variable to control the running state
running = True

def signal_handler(sig, frame):
    global running
    print("Signal received, shutting down gracefully...")
    running = False

async def main():
    artist_loader = ArtistLoader(max_artists=1000, debug=True)
    start_time = time.time()
    print("Starting artist loading...")
    
    try:
        await artist_loader.load_artists()
    except Exception as e:
        print(f"Error loading artists: {e}")
        return
    
    artist_processor = artist_loader

    end_time = time.time()
    print(f"Execution time: {end_time - start_time:.2f} seconds")
    
 
    total_artists = artist_processor.get_total_artists()
    all_artists = artist_processor.get_all_artists()
    artists_by_country = artist_processor.get_artists_by_country()
    genre_popularity_by_country = artist_processor.get_genre_popularity_by_country()
    artists_per_genre_by_country = artist_processor.get_artists_by_genre_by_country()
    total_artists_by_country = sum(country["number_of_artists"] for country in artists_by_country)
    
    
    print("\n--- Results ---")
    
    print(f"\nTotal artists fetched: {total_artists}")
    
    print("\nArtists by country:")
    print(json.dumps(artists_by_country, indent=4))
    
    #print("\nGenre popularity by country:")
    #print(json.dumps(genre_popularity_by_country, indent=4))
    
    #print("\nArtists per genre by country:")
    #print(json.dumps(artists_per_genre_by_country, indent=4))
    
    print("\nAll artists:")
    print(json.dumps(all_artists, indent=4))
    
    print(f"Total artists by country: {total_artists_by_country}")
    print(f"Total artists: {total_artists}")

if __name__ == "__main__":
    # Set up signal handling
    signal.signal(signal.SIGINT, signal_handler)

    # Run the main function in an asyncio event loop
    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(main())
    except KeyboardInterrupt:
        print("Program interrupted. Exiting...")