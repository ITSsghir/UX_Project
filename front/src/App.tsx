import React, { useEffect, useState } from 'react';
import './App.css';
import Visu1 from './components/visu1';
import Visu2 from './components/visu2';
import Visu3 from './components/visu3';
import Navbar from './components/navbar';
import VisuContainer from './components/visuContainer';
import axios from 'axios';

async function get_data() {
  try {
    const response = await axios.get('http://localhost:8000/artists');
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

const process_data = async (data: any) => {
  const artists = data;
  const countries = await getCountries();
  // If country isn't in the list of countries, check if it's an alias
  artists.forEach((artist: any) => {
    if (!countries.includes(artist.country)) {
      artist.country = correctCountryName(artist.country);
    }
  });
  return artists;
}

const correctCountryName = (country: string) => {
  if (country === 'United States' || country === 'United States of America') return 'USA';
  if (country === 'UK' || country === 'United Kingdom') return 'United Kingdom';
  return country;
}

const filterDataForVisu1 = (artistsData: any) => {
  // Remove any entries with missing data, i.e. country, but keep those with 0 fans
  const artistsDataFiltered = artistsData.filter((entry: any) => entry.country !== '' && entry.deezer_fans !== '');
  // Sort the data by country
  artistsDataFiltered.sort((a: any, b: any) => a.country.localeCompare(b.country));
  // Correct country names
  // Group the data by country
  return artistsDataFiltered.map((artist: any) => ({
    country: correctCountryName(artist.country),
    numberOfArtists: 1,
    numberOfSongs: artist.nb_songs,
    deezerFans: artist.deezer_fans,
    genres: artist.genres,
  }));
};

const filterDataForVisu2 = (artistsData: any, country: string) => {
  const genres: any = [];
  if (!country) return genres;

  const countryArtists = artistsData.filter((element: any) => element.country === country);

  countryArtists.forEach((artist: any) => {
    artist.genres.forEach((genre: any) => {
      const genreIndex = genres.findIndex((element: any) => element.genre === genre);
      if (genreIndex === -1) {
        genres.push({ genre, fans: artist.deezer_fans });
      } else {
        genres[genreIndex].fans += artist.deezer_fans;
      }
    });
  });
  return genres;
};

const filterDataForVisu3 = (artistsData: any, country: string, genre: string) => {
  const artists = artistsData.filter((element: any) => element.country === country);
  const genreArtists = artists.filter((element: any) => element.genres.includes(genre));
  return genreArtists;
}

async function getCountries() {
  try {
    const response = await axios.get('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
    const features = response.data.features;
    const countries = features.map((feature: any) => feature.properties.name);
    return countries;
  } catch (error) {
    console.error(error);
    return [];
  }
}

const App = () => {
  const [visuSwitch, setVisuSwitch] = useState('');
  const [artistsData, setArtistsData] = useState<any>([]);
  const [country, setCountry] = useState('');
  const [genre, setGenre] = useState('');
  const [countries, setCountries] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await get_data();
      const dataProcessed = await process_data(data);
      setArtistsData(dataProcessed);
    };
    fetchData();
    getCountries().then((data) => setCountries(data));
  }, []);

  const renderChosenVisu = (
    dimensions: { width: number; height: number },
    visuSwitch: string,
    artistsData: any,
    country: string,
    genre: string
  ) => {
    switch (visuSwitch) {
      case 'visu1':
        return (
          <Visu1
            dimensions={dimensions}
            artistsData={filterDataForVisu1(artistsData)}
            setCountrySwitch={setCountry}
            setVisuSwitch={setVisuSwitch}
          />
        );
      case 'visu2':
        return (
          <Visu2
            dimensions={dimensions}
            artistsData={artistsData}
            country={country}
            setGenreSwitch={setGenre}
            setCountrySwitch={setCountry}
            setVisuSwitch={setVisuSwitch}
            listCountries={countries}
            filterDataForVisu2={filterDataForVisu2}
          />
        );
      case 'visu3':
        return (
          <Visu3
            dimensions={dimensions}
            artistsData={filterDataForVisu3(artistsData, country, genre)}
            country={country}
            genre={genre}
            setCountrySwitch={setCountry}
            setGenreSwitch={setGenre}
            setVisuSwitch={setVisuSwitch}
          />
        );
      default:
        return <div>Choose a visualization</div>;
    }
  };

  return (
    <div className="App">
      <Navbar setVisuSwitch={setVisuSwitch} setCountrySwitch={setCountry} setGenreSwitch={setGenre} />
      <VisuContainer>{(dimensions) => renderChosenVisu(dimensions, visuSwitch, artistsData, country, genre)}</VisuContainer>
    </div>
  );
};

export default App;