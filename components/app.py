from flask import Flask, jsonify
from data.data_loader import DataLoader
from data.api_client import APIClient

app = Flask(__name__)

api_client = APIClient()
data_loader = DataLoader(api_client)

@app.route('/api/artists', methods=['GET'])
def get_artists():
    try:
        artist_data = data_loader.load_artist_data()
        return jsonify(artist_data)  # Renvoie les données traitées sous forme JSON
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
