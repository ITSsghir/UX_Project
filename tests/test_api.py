import unittest
from data.api_client import APIClient

class TestAPIClient(unittest.TestCase):
    def test_get_artist_data_from_api(self):
        client = APIClient()
        result = client.get_artist_data_by_country('all')  # Vérifier que tous les pays renvoient des données
        self.assertIsNotNone(result)
        self.assertIn('France', result)  # Vérifier qu'il y a des données pour la France
        self.assertIn('artistsCount', result['France'])  # Vérifier la présence des données d'artistes

if __name__ == '__main__':
    unittest.main()
