import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { isString } from 'util';

interface Visu2Props {
  dimensions: { width: number; height: number };
  artistsData: any;
  country: string;
  setGenreSwitch: (genre: string) => void;
  setCountrySwitch: (country: string) => void;
  setVisuSwitch: (visu: string) => void;
  listCountries: any;
}

const Visu2: React.FC<Visu2Props> = ({ dimensions, artistsData, country, setGenreSwitch, setCountrySwitch, setVisuSwitch, listCountries }) => {
  const { width, height } = dimensions;
  const svgRef = useRef<SVGSVGElement | null>(null);
  // Filter the data to get those for the selected country
  const genreData = artistsData;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredGenre, setHoveredGenre] = useState<string | null>(null);

  useEffect(() => {
    console.log('genreData:', genreData);
    if (!svgRef.current || !genreData.length) return;

    const svg = d3.select(svgRef.current);

    const dynamicWidth = Math.max(width, genreData.length * 100);
    svg.attr('width', dynamicWidth).attr('height', height + 80);

    svg.selectAll('*').remove();

    const margin = { top: 80, right: 20, bottom: 100, left: 20 };
    const innerWidth = dynamicWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const chartGroup = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(genreData.map((d: any) => d.genre))
      .range([0, innerWidth])
      .padding(0.2);

    let maxFans = d3.max(genreData, (d: any) => d.fans) || 0;
    // Convet the maxFans to a number
    if (isString(maxFans)){
      maxFans = parseInt(maxFans, 10);
    }
    maxFans = Math.ceil(maxFans / 100) * 100;
    const yScale = d3
      .scaleLinear()
      // 
      .domain([0, maxFans])
      .nice()
      .range([innerHeight, 0]);

    chartGroup
      .append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .attr('class', 'y-axis');

    chartGroup
      .append('g')
      .call(d3.axisBottom(xScale))
      .attr('transform', `translate(0, ${innerHeight})`)
      .attr('class', 'x-axis')
      .selectAll('text')
      .attr('text-anchor', 'end')
      .attr('transform', 'rotate(-30)')
      .style('font-size', '10px');

    // Tooltip initialisation
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('id', 'tooltip')
      .style('position', 'absolute')
      .style('background-color', '#f9f9f9')
      .style('border', '1px solid #ccc')
      .style('padding', '10px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('box-shadow', '0 2px 4px rgba(0, 0, 0, 0.2)')
      .style('opacity', 0);

    chartGroup
      .selectAll('.bar')
      .data(genreData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: any) => xScale(d.genre) || 0)
      .attr('y', (d: any) => yScale(d.fans))
      .attr('width', xScale.bandwidth())
      .attr('height', (d: any) => innerHeight - yScale(d.fans))
      .attr('fill', '#4682B4')
      .on('mouseover', (event, d: any) => {
        tooltip.style('opacity', 1); // Show the tooltip
        tooltip.html(`Genre: ${d.genre}<br>Fans: ${d.fans}`); // Set the text of the tooltip
        d3.select(event.currentTarget).attr('fill', 'orange');
      })
      .on('mousemove', (event) => {
        d3.select(event.currentTarget).attr('fill', 'orange');
      })
      .on('mouseout', (event) => {
        tooltip.style('opacity', 0); // Hide the tooltip
        d3.select(event.currentTarget).attr('fill', '#4682B4'); // Restore the original color
      })
      .on('click', (event, d: any) => {
        setGenreSwitch(d.genre);
        setVisuSwitch('visu3');
      })

    svg
      .append('text')
      .attr('class', 'y-axis-label')
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(${margin.left / 2}, ${margin.top + innerHeight / 2}) rotate(-90)`)
      .text('Popularity (Number of Fans)');

    svg
      .append('text')
      .attr('class', 'x-axis-label')
      .attr('text-anchor', 'middle')
      .attr(
        'transform',
        `translate(${margin.left + innerWidth / 2}, ${margin.top + innerHeight + 70})`
      )
      .text('Music Genres');
  }, [genreData, width, height]);

  return (
    // Add a Drop-down menu for country selection after the h2 tag
    <div
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height + 80}px`,
        overflowX: 'auto',
        overflowY: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Statistiques pour le pays: {country}</h2>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
        <button
          onClick={() => {
            setCountrySwitch('');
            setVisuSwitch('');
          }}
          style={{ marginRight: '10px' }}
        >
          Reset
        </button>
        <select
          value={country}
          onChange={(event) => {
            setCountrySwitch(event.target.value);
          }}
          style={{ padding: '5px' }}
        >
          <option value="">Choisissez un pays</option>
          {listCountries.map((country: any) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>
      {hoveredGenre && genreData && (
        <div style={{
          position: 'absolute',
          top: 150,
          left: 10,
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid black',
        }}>
          <h4>Genre: {hoveredGenre}</h4>
          <ul>
            <li>Fans: {genreData.find((element: any) => element.genre === hoveredGenre)?.fans}</li>
          </ul>
        </div>
      )}
      
      {loading && <div>Loading data...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {country && !loading && !error && 
        <svg ref={svgRef}></svg>
      }
    </div>
  );
};

export default Visu2;
