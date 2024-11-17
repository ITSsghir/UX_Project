import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';

interface MapComponentProps {
  width: number;
  height: number;
  artistsData: any;
}

interface CountryDetails {
  country: string;
  number_of_artists: number;
  number_of_songs: number;
  deezer_fans: number;
}

// width, height, artistsData are props
const Visu1: React.FC<MapComponentProps> = ({ width, height, artistsData }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<GeoJsonProperties | null>(null);
  const [countryDetails, setCountryDetails] = useState<CountryDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Set up the SVG container
    const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height);

    // Calculate the scale based on container size
    const scale = Math.min(width, height) / 5;

    // Set up the projection to fit the world map
    const projection = d3.geoMercator()
        .scale(scale)
        .translate([width / 2, height / 2 + 160]);

    const pathGenerator = d3.geoPath().projection(projection);

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([1, 8]) // Set the zoom scale limits
        .translateExtent([[0, 0], [width, height]]) // Set the panning limits
        .on('zoom', (event) => {
        svg.selectAll('g') // Apply transformations to the <g> group containing the paths
            .attr('transform', event.transform);
        });

    svg.call(zoom); // Apply zoom behavior to the SVG

    // Create a group to hold the map features (for zooming and panning)
    const mapGroup = svg.append('g');

    // Load and render GeoJSON data (excluding Antarctica)
    d3.json<FeatureCollection<Geometry>>('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
        .then((data) => {
        if (data) {
            const filteredFeatures = data.features.filter(
            (feature) => feature.properties?.name !== 'Antarctica'
            );

            mapGroup.selectAll('path')
            .data(filteredFeatures)
            .enter()
            .append('path')
            .attr('d', (d) => pathGenerator(d) || '')
            .attr('fill', 'steelblue')
            .attr('stroke', 'black')
            .attr('stroke-width', 0.5)
            .on('mouseover', (event, d) => {
                const countryName = d.properties?.name || '';
                setHoveredCountry(d.properties);
                fetchCountryDetails(countryName); // Fetch data for the hovered country
                d3.select(event.currentTarget).attr('fill', 'orange');
            })
            .on('mouseout', (event) => {
                setHoveredCountry(null);
                setCountryDetails(null); // Clear the country details when not hovering
                d3.select(event.currentTarget).attr('fill', 'steelblue');
            });
        }
        })
        .catch(error => {
        console.error('Error loading or rendering map data:', error);
        });
    }, [width, height]);


  // Async function to fetch country details based on the hovered country
  const fetchCountryDetails = async (countryName: string) => {
    setLoading(true); // Show loading indicator
    setError(null); // Reset any previous error

    try {
      // Filter artists data by country
      const countryArtists = artistsData.filter((element: any) => element.country === countryName);

      if (countryArtists.length > 0) {
        // Aggregate data
        const numberOfArtists = countryArtists.length;
        const numberOfSongs = countryArtists.number_of_songs;
        const deezerFans = countryArtists.deezer_fans;

        setCountryDetails({
          country: countryName,
          number_of_artists: numberOfArtists,
          number_of_songs: numberOfSongs,
          deezer_fans: deezerFans
        });
      } else {
        setError('No data available for this country');
      }
    } catch (err) {
      console.error('Error fetching country details:', err);
      setError('Failed to fetch country data');
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg ref={svgRef}></svg>
      {hoveredCountry && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid black',
        }}>
          {countryDetails && (
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