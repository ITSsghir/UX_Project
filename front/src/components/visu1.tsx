import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import { isNumber } from 'util';

interface MapComponentProps {
  dimensions: { width: number; height: number };
  artistsData: any;
  setCountrySwitch: (country: string) => void;
  setVisuSwitch: (visu: string) => void;
}

interface CountryDetails {
  country: string;
  number_of_artists: number | string;
  number_of_songs: number | string;
  deezer_fans: number | string;
}

const Visu1: React.FC<MapComponentProps> = ({ dimensions, artistsData, setCountrySwitch, setVisuSwitch }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<GeoJsonProperties | null>(null);
  const [countryDetails, setCountryDetails] = useState<CountryDetails | null>(null);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  let genres = artistsData.map((artist: any) => artist.genres).flat();
  genres = new Set(genres);
  genres = Array.from(genres);
  genres = genres.filter((genre: any) => genre !== '');

  const [selectedGenres, setSelectedGenres] = useState<string[]>(genres);
  artistsData = artistsData.filter((artist: any) => artist.country !== '');
  // Filter with selected genres
  artistsData = artistsData.filter((artist: any) => selectedGenres.some((genre) => artist.genres.includes(genre)));

  const maxFans = Math.max(...artistsData.map((artist: any) => artist.deezerFans));
  const colorScale = d3.scaleQuantize<string>()
    .domain([0, maxFans])
    // #3D52AO, #7091E6, #8697C4, #ADBBDA
    .range([ '#ADBBDA', '#8697C4', '#7091E6', '#3D52A0' ])
    .unknown('grey')
    .nice();

  const renderMap = (svg: any, genres: string[]) => {
    svg.selectAll('*').remove();
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
            .attr('fill', (d: any) => {
              const countryName = d.properties?.name || '';
              // Filter artists by selected genres and country
              const countryArtists = artistsData.filter((artist: any) => artist.country === countryName);
              // Filter artists by selected genres
              const genreArtists = countryArtists.filter((artist: any) => selectedGenres.some((genre) => artist.genres.includes(genre)));
              // Calculate the total number of fans for the country
              const totalFans = genreArtists.reduce((acc: number, artist: any) => acc + artist.deezerFans, 0);
              // If there are no artists from the country, color it grey
              // Otherwise, color it based on the total number of fans
              return countryArtists.length === 0 ? 'grey' : colorScale(totalFans);
            })
            .attr('stroke', 'black')
            .attr('stroke-width', 0.5)
            .on('mouseover', (event: any, d: any) => {
              const countryName = d.properties?.name || '';
              setHoveredCountry(d.properties);
              fetchCountryDetails(countryName);
              // Highlight the country on hover, change the stroke color to orange and increase the stroke width
              d3.select(event.currentTarget).attr('stroke', 'black').attr('stroke-width', 2);
            })
            .on('mouseout', (event: any) => {
              setHoveredCountry(null);
              setCountryDetails(null);
              d3.select(event.currentTarget).attr('stroke', 'black').attr('stroke-width', 0.5);
            })
            .on('mousemove', (event: any) => {
                const offsetX = 0; // Horizontal offset from the cursor
                const offsetY = 0; // Vertical offset from the cursor

                // Get cursor position relative to the page
                const { pageX, pageY } = event;

                // Calculate tooltip position dynamically, ensuring it doesn't go out of bounds
                const x = Math.max(0, Math.min(pageX + offsetX, dimensions.width)); // 200 = Tooltip width (approx)
                const y = Math.max(0, Math.min(pageY + offsetY, dimensions.height)); // 100 = Tooltip height (approx)

                setCursorPosition({ x, y });
              })
            .on('click', (event: any, d: any) => {
              const countryId = d.properties?.name || '';
              setCountrySwitch(countryId);
              setVisuSwitch('visu2');
            });
        }
      })
      .catch((error) => {
        console.error('Error loading or rendering map data:', error);
      });
  };

  const fetchCountryDetails = async (countryName: string) => {
    setLoading(true);
    setError(null);

    try {
      const countryArtists = artistsData.filter((element: any) => element.country === countryName);
      // Filter artists by selected genres
      const genreArtists = countryArtists.filter((element: any) => selectedGenres.some((genre) => element.genres.includes(genre)));

      // Calculate the total number of fans for each country, with filtered artists with selected genres
      // If there are no artists from the country with the selected genres, set the data to 0
      const countryDetails: CountryDetails = {
        country: countryName,
        number_of_artists: genreArtists.length,
        number_of_songs: genreArtists.reduce((acc: number, artist: any) => acc + artist.numberOfSongs, 0),
        deezer_fans: genreArtists.reduce((acc: number, artist: any) => acc + artist.deezerFans, 0),
      };

      if (Number(countryDetails.number_of_artists) > 0) {
        setCountryDetails(countryDetails);
      } else {
        setCountryDetails({
          country: countryName,
          number_of_artists: 'No data',
          number_of_songs: 'No data',
          deezer_fans: 'No data',
        });
      }
    } catch (err) {
      console.error('Error fetching country details:', err);
      setError('Failed to fetch country data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If artistsData is empty, set Loading to true
    if (artistsData.length === undefined) {
      setLoading(true);
    } else {
      setLoading(false);
    }

    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    renderMap(svg, selectedGenres);
  }, [dimensions.width, dimensions.height, selectedGenres]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#EDE8F5' }}>
      {loading && <div>Loading...</div>}

      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
      {/* Genre Filter UI */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid black',
          borderRadius: '8px',
          boxShadow: '0px 4px 6px rgba(0,0,0,0.2)',
          maxWidth: '200px',
          maxHeight: '300px',
          /* Fix the scroll bar*/
          overflowY: 'auto',
          scrollBehavior: 'smooth',
          scrollbarGutter: '20px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#3A3F58 #EDEDED',
          textAlign: 'left',
          bottom: '10px',
        }}
      >
          <h4 style={{ margin: 0, fontSize: '1rem', marginTop: '10px' }}>Filter by Genre</h4>
          <div style={{
            display: 'flex',
            position: 'relative',
            justifyContent: 'space-between',
            marginBottom: '5px',
            marginTop: '10px',
          }}>
            <button 
            style={{
              display: 'inline-block',
              padding: '5px 10px',
              borderRadius: '5px',
              border: 'none',
              backgroundColor: '#3A3F58',
              margin: '5px',
              color: 'white',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
            onClick={() => {
              if (selectedGenres.length !== genres.length) {
                setSelectedGenres(genres);
              }
            }}>Select All</button>
            <button 
            style={{
              display: 'inline-block',
              padding: '5px 10px',
              borderRadius: '5px',
              border: 'none',
              backgroundColor: '#3A3F58',
              margin: '5px',
              color: 'white',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
            onClick={() => {
              if (selectedGenres.length !== 0) {
                setSelectedGenres([]);
              }
            }
            }>Clear</button>
          </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          maxHeight: '200px',
          overflowY: 'auto',
          scrollbarGutter: '20px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#3A3F58 #EDEDED',
        }}>
          {genres.map((genre: string) => (
            <label key={genre} style={{ 
              display: 'block',
              margin: '5px 0',
              cursor: 'pointer',
          }}>
              <input
                type="checkbox"
                checked={selectedGenres.includes(genre)}
                onChange={() => {
                  if (selectedGenres.includes(genre)) {
                    setSelectedGenres(selectedGenres.filter((selectedGenre) => selectedGenre !== genre));
                  } else {
                    setSelectedGenres([...selectedGenres, genre]);
                  }
                }}
                style={{ 
                  marginRight: '5px',
                  cursor: 'pointer',
                  border: '1px solid #3A3F58',
                  borderRadius: '5px',
                  padding: '5px',
                  backgroundColor: selectedGenres.includes(genre) ? '#3A3F58' : 'white',
                  color: selectedGenres.includes(genre) ? 'white' : '#3A3F58',
                  transition: 'background-color 0.3s',
                }}
              />
              {genre}
            </label>
          ))}
        </div>
      </div>
      {hoveredCountry && countryDetails && (
      <div
        style={{
          position: 'absolute',
          top: cursorPosition.y - 100,
          left: cursorPosition.x,
          background: 'linear-gradient(135deg, #1F1B24, #2B2E4A)',
          border: '1px solid #3A3F58',
          borderRadius: '10px',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.6), 0 0 10px rgba(50, 150, 250, 0.3)',
          color: '#EDEDED',
          padding: '15px',
          pointerEvents: 'none',
          maxWidth: '300px',
          fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        }}
      >
        <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#7FD1F3' }}>Artist Data for {countryDetails.country}</h4>
        <ul style={{ 
          margin: '10px 0 0', 
          padding: 0, 
          listStyleType: 'none', 
          fontSize: '0.95rem', 
          lineHeight: '1.6',
        }}>
          <li><strong>Artists:</strong> {countryDetails.number_of_artists}</li>
          <li><strong>Songs:</strong> {countryDetails.number_of_songs}</li>
          <li><strong>Deezer Fans:</strong> {countryDetails.deezer_fans}</li>
        </ul>
      </div>
    )}

      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        backgroundColor: 'white',
        padding: '10px',
        border: '1px solid black',
        borderRadius: '8px',
        boxShadow: '0px 4px 6px rgba(0,0,0,0.2)',
        // align the text to the left
        textAlign: 'left',
      }}>
        <h4 style={{ margin: "10px", fontSize: '1.2rem' }}>Nombre de fans par pays</h4>
        <ul>
          <li style={{ fontWeight: 'bold', listStyleType: 'none' }}>
            <span style={{ color: 'grey' }}> <div style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'grey',
              marginRight: '5px',
            }}></div> No data</span>
          </li>
          {artistsData.length > 0 && colorScale.range().map((color, i) => (
          // Display the color range and the corresponding data range (floor it to 0 decimal places)
          // Bold the bullet points
          // Add a space between the color range and the data range
          // If artistsData is empty, display 'No data' for the color range
          <li key={i} style={{ fontWeight: 'bold', listStyleType: 'none' }}>
            {/* Display the color range and the corresponding data range (floor it to 0 decimal places) */}
            {/* Bold the bullet points */}
            {/* Add a space between the color range and the data range */}
            {/* If artistsData is empty, display 'No data' for the color range */}
            <span style={{ color: color }}> <div style={{
              /* Display the color range as a colored circle */
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: color,
              marginRight: '5px',
            }}></div> [{Math.floor(colorScale.invertExtent(color)[0])} - {Math.floor(colorScale.invertExtent(color)[1])}]</span>
          </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Visu1;
