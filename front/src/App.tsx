import React from 'react';
import './App.css';
import Visu1 from './components/visu1';
import Visu2 from './components/visu2';
import Visu3 from './components/visu3';
import Navbar from './components/navbar';
import VisuContainer from './components/visuContainer';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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

function App() {
  const [visuSwitch, setVisuSwitch] = React.useState('');
  const [artistsData, setArtistsData]: [any, any] = React.useState([]);

  React.useEffect(() => {
    get_data().then((data) => {
      setArtistsData(data);
      console.log(data);
    });
  }, []);

  return (
    <Router>
      <div className="App">
        <Navbar setVisuSwitch={setVisuSwitch} />
        <VisuContainer>
          {(dimensions) => (
            <Routes>
              {/* Route pour la Visualisation 1 */}
              <Route path="/" element={<Visu1 width={dimensions.width} height={dimensions.height} artistsData={artistsData} />} />
              {/* Route pour la Visualisation 2 */}
              <Route path="/visualisation2/:countryId" element={<Visu2 width={dimensions.width} height={dimensions.height} artistsData={artistsData} />} />
              {/* Route pour la Visualisation 3 */}
              <Route path="/visualisation3/:genre" element={<Visu3 width={dimensions.width} height={dimensions.height} />} />
            </Routes>
          )}
        </VisuContainer>
      </div>
    </Router>
  );
}

export default App;
