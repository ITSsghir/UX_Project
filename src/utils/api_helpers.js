export async function fetchArtistData() {
    const response = await fetch('/api/artists'); // Interroge l'endpoint de ton backend
    if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
    }
    const artistData = await response.json();
    return artistData; // Renvoie les données traitées
}
