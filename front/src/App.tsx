import React from 'react';
import './App.css';
import Visu1 from './components/visu1';
import Visu2 from './components/visu2';
import Visu3 from './components/visu3';
import Navbar from './components/navbar';
import VisuContainer from './components/visuContainer';
import axios from 'axios';

function renderVisu(visuSwitch: string, dimensions: { width: number; height: number }, artistsData: any) {
  switch (visuSwitch) {
    case 'visu1':
      return <Visu1 width={dimensions.width} height={dimensions.height} artistsData={artistsData} />;
    case 'visu2':
      return <Visu2 width={dimensions.width} height={dimensions.height} />;
    case 'visu3':
      return <Visu3 width={dimensions.width} height={dimensions.height} />;
    default:
      return <div></div>;
  }
}

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
    });
  }, []);

  return (
    <div className="App">
      <Navbar setVisuSwitch={setVisuSwitch} />
      <VisuContainer>
        {(dimensions) => renderVisu(visuSwitch, dimensions, artistsData)}
      </VisuContainer>
    </div>
  );
}

export default App;