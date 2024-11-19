import React from 'react'


interface Visu3Props {
  dimensions: { width: number; height: number };
  country: string;
  genre: string;
  setCountrySwitch: (country: string) => void;
  setGenreSwitch: (genre: string) => void;
  setVisuSwitch: (visu: string) => void;
}
const Visu3: React.FC<Visu3Props> = ({ dimensions, country, genre, setCountrySwitch, setGenreSwitch, setVisuSwitch }) => {
  return (
    <div>
      <h1>Visu3</h1>
      <p>Genre: {genre}</p>
      <p>Country: {country}</p>
      <button onClick={() => {
        setVisuSwitch('');
        setCountrySwitch('');
        setGenreSwitch('');
      } }>Reset</button>
    </div>
  )
}

export default Visu3