import React, { useState } from 'react';
import '../styles/navbar.css';

interface NavbarProps {
  setVisuSwitch: (visu: string) => void,
  setCountrySwitch: (country: string) => void,
  setGenreSwitch: (genre: string) => void
}

const Navbar: React.FC<NavbarProps> = ({ setVisuSwitch, setCountrySwitch, setGenreSwitch }) => {

  return (
    <div className="navbar">
      <button
        onClick={() => {
          setVisuSwitch('');
        }}
        className="header"
      >
        Wasabi : Là où la musique rencontre les données
      </button>
      <div className="container">
        <button
          onClick={() => {
            setVisuSwitch('visu1');
          }}
          className="choice"
        >
          Artistes par Pays
        </button>
        <button
          onClick={() => {
            setVisuSwitch('visu2');
          }}
          className="choice"
        >
          Genres Musicaux par Pays
        </button>
        <button
          onClick={() => {
            setVisuSwitch('visu3');
          }}
          className="choice"
        >
          Groupes et Artistes par Genre
        </button>
      </div>
    </div>
  );
};

export default Navbar;
