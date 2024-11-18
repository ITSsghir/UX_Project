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
        Projet UX
      </button>
      <div className="container">
        <button
          onClick={() => {
            setVisuSwitch('visu1');
          }}
          className="choice"
        >
          visu1
        </button>
        <button
          onClick={() => {
            setVisuSwitch('visu2');
          }}
          className="choice"
        >
          visu2
        </button>
        <button
          onClick={() => {
            setVisuSwitch('visu3');
          }}
          className="choice"
        >
          visu3
        </button>
      </div>
    </div>
  );
};

export default Navbar;
