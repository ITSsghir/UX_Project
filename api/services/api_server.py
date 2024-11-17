import logging
from aiohttp import web
from services.artist_loader import ArtistLoader  # Assuming the ArtistLoader is in the artist_loader.py file
import aiohttp_cors

# Initialize the artist processor
artist_loader = ArtistLoader(debug=True)
artist_processor = artist_loader.processor

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Sample function to load artist data
def load_artists():
    try:
        artist_loader.load_artists()
        logger.info("Artists loaded successfully!")
    except Exception as e:
        logger.error(f"Error loading artists: {e}")

# Start the server with preloaded artist data
async def on_startup(app):
    load_artists()

async def get_all_artists(request):
    return web.json_response(artist_processor.get_all_artists())

# Get artists by country
async def get_artists_by_country(request):
    country = request.query.get('country')  # e.g., ?country=France
    if not country:
        return web.json_response({"error": "Country is required"}, status=400)

    filtered_artists = artist_processor.filter_artists_by_country(country)
    if not filtered_artists:
        return web.json_response({"error": "No artists found for this country"}, status=404)
    
    return web.json_response(filtered_artists)

# Get genre popularity in a specific country
async def get_genre_popularity(request):
    country = request.query.get('country')  # e.g., ?country=France
    if not country:
        return web.json_response({"error": "Country is required"}, status=400)

    genre_popularity = artist_processor.filter_genre_popularity_by_country(country)
    if not genre_popularity:
        return web.json_response({"error": "No genre popularity data for this country"}, status=404)
    
    return web.json_response(genre_popularity)

# Get artists by genre in a specific country
async def get_artists_by_genre_in_country(request):
    country = request.query.get('country')  # e.g., ?country=France
    genre = request.query.get('genre')  # e.g., ?genre=Pop
    if not country or not genre:
        return web.json_response({"error": "Both country and genre are required"}, status=400)

    filtered_artists = artist_processor.filter_artists_by_genre_in_country(country, genre)
    if not filtered_artists:
        return web.json_response({"error": "No artists found for this genre in the specified country"}, status=404)

    return web.json_response(filtered_artists)
        
def main():
    app = web.Application()
    
    # Set up CORS
    cors = aiohttp_cors.setup(app, defaults={
        "*": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers="*",
            allow_headers="*",
        ),
    })
    
    app.on_startup.append(on_startup)

    # Routes
    app.router.add_get('/artists', get_all_artists)
    app.router.add_get('/artists-by-country', get_artists_by_country)
    app.router.add_get('/genre-popularity', get_genre_popularity)
    app.router.add_get('/artists-by-genre-in-country', get_artists_by_genre_in_country)
    
    # Apply CORS to all routes
    for route in app.router.routes():
        cors.add(route)

    # Run the app
    return app

if __name__ == '__main__':
    try:
        web.run_app(main(), host='0.0.0.0', port=8000)
    except KeyboardInterrupt:
        print("Server interrupted. Exiting...")