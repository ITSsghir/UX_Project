### Not working

import pytest
from aiohttp import web
# Import the app from the services.api module (don't use relative imports)
from api.services.api_server import app

@pytest.fixture
async def client(aiohttp_client):
    return await aiohttp_client(app)

async def test_get_artists_by_country_valid(client):
    response = await client.get('/artists-by-country?country=France')
    assert response.status == 200
    data = await response.json()
    
    # Check if the response is a list
    assert isinstance(data, list)
    assert len(data) == 1  # Expecting one entry for the country

    country_data = data[0]
    assert 'country' in country_data  # Check the presence of 'country' key
    assert 'number_of_artists' in country_data  # Check the presence of 'number_of_artists' key
    assert 'number_of_songs' in country_data  # Check the presence of 'number_of_songs' key
    assert 'deezer_fans' in country_data  # Check the presence of 'deezer_fans' key

    # Check types of the values
    assert isinstance(country_data['country'], str)  # Ensure 'country' is a string
    assert isinstance(country_data['number_of_artists'], int)  # Ensure 'number_of_artists' is an integer
    assert isinstance(country_data['number_of_songs'], int)  # Ensure 'number_of_songs' is an integer
    assert isinstance(country_data['deezer_fans'], int)  # Ensure 'deezer_fans' is an integer

async def test_get_genre_popularity_valid(client):
    response = await client.get('/genre-popularity?country=France')
    assert response.status == 200
    data = await response.json()
    
    # Check if the response is a dictionary
    assert isinstance(data, dict)

    # Check if the expected genres are present in the response
    expected_genres = [
        "Electronic", "EBM", "Industrial", "Electro", 
        "Alternative Rock", "Synthpop", "Hip Hop", "French Hip Hop"
    ]
    
    for genre in expected_genres:
        assert genre in data  # Check presence of genre key
        assert isinstance(data[genre], int)  # Check that the popularity value is an integer

async def test_get_artists_by_genre_in_country_valid(client):
    response = await client.get('/artists-by-genre-in-country?country=France&genre=Hip Hop')
    assert response.status == 200
    data = await response.json()
    
    # Check if the response is a list
    assert isinstance(data, list)
    assert len(data) == 1  # Expecting one genre in the response

    genre_data = data[0]
    assert 'genre' in genre_data  # Check the presence of 'genre' key
    assert 'artists' in genre_data  # Check the presence of 'artists' key
    assert isinstance(genre_data['artists'], list)  # Ensure 'artists' is a list

    # Check if the artists list contains expected fields
    for artist in genre_data['artists']:
        assert 'name' in artist  # Check the presence of 'name' key
        assert 'number_of_songs' in artist  # Check the presence of 'number_of_songs' key
        assert 'number_of_albums' in artist  # Check the presence of 'number_of_albums' key
        assert 'deezer_fans' in artist  # Check the presence of 'deezer_fans' key
        assert 'country' in artist  # Check the presence of 'country' key

        # Check types of the values
        assert isinstance(artist['name'], str)  # Ensure 'name' is a string
        assert isinstance(artist['number_of_songs'], int)  # Ensure 'number_of_songs' is an integer
        assert isinstance(artist['number_of_albums'], int)  # Ensure 'number_of_albums' is an integer
        assert isinstance(artist['deezer_fans'], int)  # Ensure 'deezer_fans' is an integer
        assert isinstance(artist['country'], str)  # Ensure 'country' is a string

async def test_get_artists_by_country_invalid(client):
    response = await client.get('/artists-by-country')  # Missing country parameter
    assert response.status == 400  # Expecting a 400 Bad Request
    data = await response.json()
    assert data == {"error": "Country is required"}  # Check error message

async def test_get_genre_popularity_invalid(client):
    response = await client.get('/genre-popularity')  # Missing country parameter
    assert response.status == 400  # Expecting a 400 Bad Request
    data = await response.json()
    assert data == {"error": "Country is required"}  # Check error message

async def test_get_artists_by_genre_in_country_invalid(client):
    response = await client.get('/artists-by-genre-in-country?country=France')  # Missing genre parameter
    assert response.status == 400  # Expecting a 400 Bad Request
    data = await response.json()
    assert data == {"error": "Both country and genre are required"}  # Check error message

async def test_get_artists_by_country_invalid_country(client):
    response = await client.get('/artists-by-country?country=InvalidCountry')  # Invalid country
    assert response.status == 404  # Expecting a 404 Not Found
    data = await response.json()
    assert data == {"error": "No artists found for this country"}  # Check error message

async def test_get_genre_popularity_invalid_country(client):
    response = await client.get('/genre-popularity?country=InvalidCountry')  # Invalid country
    assert response.status == 404  # Expecting a 404 Not Found
    data = await response.json()
    assert data == {"error": "No genre popularity data for this country"}  # Check error message

async def test_get_artists_by_genre_in_country_invalid_genre(client):
    response = await client.get('/artists-by-genre-in-country?country=France&genre=InvalidGenre')  # Invalid genre
    assert response.status == 404  # Expecting a 404 Not Found
    data = await response.json()
    assert data == {"error": "No artists found for this genre in the specified country"}  # Check error message
    
# Run the tests
pytest.main(['-v'])