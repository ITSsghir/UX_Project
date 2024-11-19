import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';

interface MapComponentProps {
  dimensions: { width: number; height: number };
  artistsData: any;
  setCountrySwitch: (country: string) => void;
  setVisuSwitch: (visu: string) => void;
}

interface CountryDetails {
  country: string;
  number_of_artists: number;
  number_of_songs: number;
  deezer_fans: number;
}

const Visu1: React.FC<MapComponentProps> = ({ dimensions, artistsData, setCountrySwitch, setVisuSwitch }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<GeoJsonProperties | null>(null);
  const [countryDetails, setCountryDetails] = useState<CountryDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const renderMap = (svg: any) => {
    const scale = Math.min(dimensions.width, dimensions.height) / 5;
    const projection = d3.geoMercator()
      .scale(scale)
      .translate([dimensions.width / 2, dimensions.height / 2 + 60]);

    const pathGenerator = d3.geoPath().projection(projection);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .translateExtent([[0, 0], [dimensions.width, dimensions.height]])
      .on('zoom', (event) => {
        svg.selectAll('g').attr('transform', event.transform);
      });

    svg.call(zoom);

    const mapGroup = svg.append('g');

    d3.json<FeatureCollection<Geometry>>('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
        .then((data) => {
          if (data) {
            const filteredFeatures = data.features;
            mapGroup.selectAll('path')
              .data(filteredFeatures)
              .enter()
              .append('path')
              .attr('d', (d: any) => pathGenerator(d) || '')
              .attr('fill', 'steelblue')
              .attr('stroke', 'black')
              .attr('stroke-width', 0.5)
              .on('mouseover', (event: any, d: any) => {
                const countryName = d.properties?.name || '';
                setHoveredCountry(d.properties);
                fetchCountryDetails(countryName);
                d3.select(event.currentTarget).attr('fill', 'orange');
              })
              .on('mouseout', (event: any) => {
                setHoveredCountry(null);
                setCountryDetails(null);
                d3.select(event.currentTarget).attr('fill', 'steelblue');
              })
              .on('click', (event: any, d: any) => {
                const countryId = d.properties?.name || '';
                // Get country name and setCurrentCountry to the country name
                console.log('Clicked on:', countryId);
                setCountrySwitch(countryId);
                setVisuSwitch('visu2');
              });
          }
        })
        .catch(error => {
          console.error('Error loading or rendering map data:', error);
        });
  };
  const fetchCountryDetails = async (countryName: string) => {
    setLoading(true);
    setError(null);

    try {
      const countryArtists = artistsData.filter((element: any) => element.country === countryName);

      const countryDetails: CountryDetails = {
        country: countryName,
        number_of_artists: countryArtists.length,
        number_of_songs: countryArtists.reduce((acc: number, artist: any) => acc + artist.numberOfSongs, 0),
        deezer_fans: countryArtists.reduce((acc: number, artist: any) => acc + artist.deezerFans, 0),
      };
      if (countryDetails.number_of_artists > 0) {
        setCountryDetails(countryDetails);
      } else {
        setError('No data available for this country');
      }
    } catch (err) {
      console.error('Error fetching country details:', err);
      setError('Failed to fetch country data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    renderMap(svg);
  }, [dimensions.width, dimensions.height]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg ref={svgRef}></svg>
      {hoveredCountry && countryDetails && (
        <div style={{
          position: 'absolute',
          top: 150,
          left: 10,
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid black',
        }}>
          <h4>Artist Data for {countryDetails.country}</h4>
          <ul>
            <li>Number of Artists: {countryDetails.number_of_artists}</li>
            <li>Number of Songs: {countryDetails.number_of_songs}</li>
            <li>Deezer Fans: {countryDetails.deezer_fans}</li>
          </ul>
        </div>
      )}
      {loading && (
        <div style={{
          position: 'absolute',
          top: 150,
          left: 10,
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid black',
        }}>
          Loading data...
        </div>
      )}
      {error && (
        <div style={{
          position: 'absolute',
          top: 150,
          left: 10,
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid red',
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default Visu1;
