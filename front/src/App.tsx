import React from 'react';
import './App.css';
import Visu1 from './components/visu1';
import Visu2 from './components/visu2';
import Visu3 from './components/visu3';
import Navbar from './components/navbar';
import VisuContainer from './components/visuContainer';
import axios from 'axios';

async function get_data() {
  return axios.get('http://localhost:8000/artists')
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
}

function cleanUpData(data: any) {
  // If the country is empty or unknown, replace it with 'Antarctica'
  // If the genres are empty or unknown, replace them with 'Other'
  return data.map((artist: any) => {
    if (!artist.country || artist.country === ''|| artist.country.toLowerCase() === 'unknown') {
      artist.country = 'Antarctica';
    }
    if (!artist.genres || artist.genres.length === 0) {
      artist.genres = ['Other'];
    } else {
      artist.genres = artist.genres.map((genre: any) => {
        if (!genre || genre === '' || genre.toLowerCase() === 'unknown') {
          return 'Other';
        }
        return genre;
      });
    }
    return artist;
  });
}

const filterDataForVisu1 = (artistsData: any) => {
  // Filter data for visu1
  // Return an array of objects with the following structure:
  // { country: string, numberOfArtists: number, numberOfSongs: number, deezerFans: number }
  // Replace any occurrences of '' or 'Unknown' with 'Antarctica'
  return artistsData.map((artist: any) => ({
    country: artist.country === '' || artist.country === 'Unknown' ? 'Antarctica' : artist.country,
    numberOfArtists: 1,
    numberOfSongs: artist.nb_songs,
    deezerFans: artist.deezer_fans,
  }));
}

const filterDataForVisu2 = (artistsData: any, country: string) => {
  // Filter data for visu2
  // Return an array of objects with the following structure:
  // { genre: string, fans: number }
  // Replace any occurrences of '' or 'Unknown' with 'Other'
  const genres: any = [];

  if (!country) return genres;

  const countryArtists = artistsData.filter((element: any) => element.country === country);

  // For each country, get the genres
  countryArtists.forEach((artist: any) => {
    artist.genres.forEach((genre: any) => {
      const genreIndex = genres.findIndex((element: any) => element.genre === genre);
      if (genreIndex === -1) {
        // If the genre is empty or unknown, add it to the 'Other' category (even if it's just some spaces)
        if (!genre || genre === 'Unknown') {
          genres.push({ genre: 'Other', fans: artist.deezer_fans });
        } else {
          genres.push({ genre, fans: artist.deezer_fans });
        }
      } else {
        genres[genreIndex] += artist.deezer_fans;
      }
    });
  });
  return genres;
}

async function getCountries() {
  // Get the list of countries from GeoJSON
  const features = await axios.get('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
    .then((response) => {
      return response.data.features;
    })
    .catch((error) => {
      console.log(error);
    });
  const countries = features.map((feature: any) => feature.properties.name);
  return countries;
}

function App() {
  const [visuSwitch, setVisuSwitch] = React.useState('');
  const [artistsData, setArtistsData]: [any, any] = React.useState([]);
  const [country, setCountry] = React.useState('');
  const [genre, setGenre] = React.useState('');
  const [countries, setCountries] = React.useState([]);


  // Render the chosen visualization based on the visuSwitch state and dimensions from VisuContainer
  const renderChosenVisu = (dimensions: { width: number; height: number }, visuSwitch: string, artistsData: any, country: string, genre: string) => {
    switch (visuSwitch) {
      case 'visu1':
        return <Visu1 dimensions={dimensions} artistsData={filterDataForVisu1(artistsData)} setCountrySwitch={setCountry} setVisuSwitch={setVisuSwitch} />;
      case 'visu2':
        return <Visu2 dimensions={dimensions} artistsData={artistsData} country={country} setGenreSwitch={setGenre} setCountrySwitch={setCountry} setVisuSwitch={setVisuSwitch} listCountries={countries} filterDataForVisu2={filterDataForVisu2} />;
      case 'visu3':
        return <Visu3 dimensions={dimensions} country={country} genre={genre} setCountrySwitch={setCountry} setGenreSwitch={setGenre} setVisuSwitch={setVisuSwitch} />;
      default:
        return <div>Choose a visualization</div>;
    }
  }
  React.useEffect(() => {
    get_data().then((data) => {
      setArtistsData(cleanUpData(data));
    });
    getCountries().then((data) => {
      setCountries(data);
    });
  }, []);

  return (
      <div className="App">
        <Navbar setVisuSwitch={setVisuSwitch} setCountrySwitch={setCountry} setGenreSwitch={setGenre} />
        <VisuContainer>
          {(dimensions) => renderChosenVisu(dimensions, visuSwitch, artistsData, country, genre)}
        </VisuContainer>
      </div>
  );
}

export default App;