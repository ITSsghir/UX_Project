export async function fetchArtistData() {
    try {
        const response = await fetch('https://wasabi.i3s.unice.fr/api/v1/artist/all/popularity');
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données de l\'API');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur de récupération des données :', error);
    }
}
