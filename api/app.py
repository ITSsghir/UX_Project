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

def main():
    artist_loader = ArtistLoader(max_artists=200, debug=True)
    start_time = time.time()
    print("Starting artist loading...")
    
    try:
        artist_loader.load_artists()
    except Exception as e:
        print(f"Error loading artists: {e}")
        return
    
    artist_processor = artist_loader

    end_time = time.time()
    print(f"Execution time: {end_time - start_time:.2f} seconds")
    
    members = artist_processor.get_members()
    print("\nMembers:")
    print(json.dumps(members, indent=4))

if __name__ == "__main__":
    # Set up signal handling
    signal.signal(signal.SIGINT, signal_handler)

    try:
        main()
    except KeyboardInterrupt:
        print("Program interrupted. Exiting...")