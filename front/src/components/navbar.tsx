import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/navbar.css';

const Navbar = ({ setVisuSwitch }: { setVisuSwitch: Function }) => {
  const [countryInput, setCountryInput] = useState('');
  const [currentView, setCurrentView] = useState('');
  const navigate = useNavigate();

  const handleCountryInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCountryInput(event.target.value);
  };

  const handleNavigateToVisu2 = () => {
    if (countryInput.trim()) {
      navigate(`/visualisation2/${countryInput.toLowerCase()}`);
    } else {
      alert('Please enter a valid country name.');
    }
  };

  return (
    <div className="navbar">
      <button
        onClick={() => {
          setVisuSwitch('');
          setCurrentView('');
          navigate('/'); // Naviguer vers la visualisation 1
        }}
        className="header"
      >
        Projet UX
      </button>
      <div className="container">
        <button
          onClick={() => {
            setVisuSwitch('visu1');
            setCurrentView('visu1');
            navigate('/'); // Naviguer vers la visualisation 1
          }}
          className="choice"
        >
          visu1
        </button>
        <button
          onClick={() => {
            setVisuSwitch('visu2');
            setCurrentView('visu2');
          }}
          className="choice"
        >
          visu2
        </button>
        <button
          onClick={() => {
            setVisuSwitch('visu3');
            setCurrentView('visu3');
          }}
          className="choice"
        >
          visu3
        </button>
      </div>

      {/* Si la vue actuelle est "visu2", afficher un champ de saisie */}
      {currentView === 'visu2' && (
        <div style={{ marginTop: '20px' }}>
          <input
            type="text"
            value={countryInput}
            onChange={handleCountryInputChange}
            placeholder="Enter country"
          />
          <button onClick={handleNavigateToVisu2}>Go to Country</button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
