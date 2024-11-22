import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { isString } from 'util';
import { group } from 'console';

interface Visu2Props {
  dimensions: { width: number; height: number };
  artistsData: any;
  country: string;
  setGenreSwitch: (genre: string) => void;
  setCountrySwitch: (country: string) => void;
  setVisuSwitch: (visu: string) => void;
  listCountries: any;
  filterDataForVisu2: (artistsData: any, country: string) => any;
}

function trimData(data: any) {
  // Remove any entries with missing data, i.e. genre, but keep those with 0 fans
  const filteredData = data.filter((entry: any) => entry.genre !== '' && entry.fans !== '');
  // Sort the data by number of fans in descending order
  filteredData.sort((a: any, b: any) => b.fans - a.fans);
  return filteredData;
}

const Visu2: React.FC<Visu2Props> = ({ dimensions, artistsData, country, setGenreSwitch, setCountrySwitch, setVisuSwitch, listCountries, filterDataForVisu2 }) => {
  const { width, height } = dimensions;
  const svgRef = useRef<SVGSVGElement | null>(null);
  // Filter the data to get those for the selected country
  const genreData = trimData(filterDataForVisu2(artistsData, country));
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredGenre, setHoveredGenre] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    d3.select('*').remove(); // Clean the canvas
    if (!svgRef.current || !genreData.length) return;

    const svg = d3.select(svgRef.current);

    const dynamicWidth = Math.min(width, genreData.length * 100);
    svg.attr('width', dynamicWidth).attr('height', height + 80);

    svg.selectAll('*').remove();

    const margin = { top: 80, right: 20, bottom: 100, left: 70 };
    const innerWidth = dynamicWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const chartGroup = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(genreData.map((d: any) => d.genre))
      .range([0, innerWidth])
      .padding(0.2);

    let maxFans = d3.max(genreData, (d: any) => d.fans) || 0;
    if (isString(maxFans)) {
      maxFans = parseInt(maxFans, 10);
    }
    maxFans = Math.ceil(maxFans / 100) * 100;

    const yScale = d3
      .scaleLinear()
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

    chartGroup
      .selectAll('.bar')
      .data(genreData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.5)
      .attr('x', (d: any) => xScale(d.genre) ?? 0)
      .attr('y', (d: any) => yScale(d.fans))
      .attr('width', xScale.bandwidth())
      .attr('height', (d: any) => innerHeight - yScale(d.fans))
      .attr('fill', '#4682B4')
      .on('mouseover', (event, d: any) => {
        d3.select(event.currentTarget)
          .attr('stroke-color', 'black')
          .attr('fill', '#4169E1')
          .attr('stroke-width', 3)
          .attr('stroke-opacity', 1);
        setHoveredGenre(d.genre);
      })
      .on('mousemove', (event) => {
        setMousePosition({ x: event.pageX, y: event.pageY });
        d3.select(event.currentTarget)
          .attr('stroke-color', 'black')
          .attr('fill', '#4169E1')
          .attr('stroke-width', 3)
          .attr('stroke-opacity', 1);
      })
      .on('mouseout', () => {
        setHoveredGenre(null);
        d3.select('.bar')
          .attr('fill', '#4682B4')
          .attr('stroke-width', 1)
          .attr('stroke-opacity', 0.5);
        setMousePosition({ x: 0, y: 0 });
      })
      .on('mouseleave', (event) => {
        setHoveredGenre(null);
      })
      .on('mouseenter', (event, d: any) => {
        setHoveredGenre(d.genre);
      })
      .on('click', (event, d: any) => {
        setGenreSwitch(d.genre);
        setVisuSwitch('visu3');
      });

    chartGroup
      .selectAll('.label')
      .data(genreData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', (d: any) => (xScale(d.genre) ?? 0) + xScale.bandwidth() / 2)
      .attr('y', (d: any) => yScale(d.fans) - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', 'black')
      .text((d: any) => (d.fans >= 0 ? d.fans.toLocaleString() : ''))
      .on('mouseover', (event, d: any) => {
        setHoveredGenre(d.genre);
        setMousePosition({ x: event.pageX, y: event.pageY });
      })
      .on('mouseout', () => {
        setHoveredGenre(null);
        setMousePosition({ x: 0, y: 0 });
      })
      .on('mouseleave', () => {
        setHoveredGenre(null);
      })
      .on('mouseenter', (event, d: any) => {
        setHoveredGenre(d.genre);
      });

    // Add a mouseleave listener to the SVG container to reset hoveredGenre
    svg.on('mouseleave', () => {
      setHoveredGenre(null);
      setMousePosition({ x: 0, y: 0 });
    });
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
    {hoveredGenre && genreData && (
        <div style={{
          position: 'absolute',
          top: mousePosition.y - 150,
          left: mousePosition.x - 75,
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '5px',
          zIndex: 1,
          border: '1px solid #3A3F58',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.6), 0 0 10px rgba(50, 150, 250, 0.3)',
          maxWidth: '200px'
        }}>
          <h4>Genre: {hoveredGenre}</h4>
          <ul>
            <li>Fans: {genreData.find((element: any) => element.genre === hoveredGenre)?.fans}</li>
          </ul>
        </div>
      )}
      <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Statistiques pour le pays: 
        <span style={{ 
          color: '#3A3F58',
          fontWeight: 'bold',
          marginLeft: '5px',
          marginRight: '5px',
        }}>
          {country}
        </span>
      </h2>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
        <button
          onClick={() => {
            setCountrySwitch('');
            setVisuSwitch('');
          }}
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
        >
          Reset
        </button>
        <select
          value={country}
          onChange={(event) => {
            setCountrySwitch(event.target.value);
          }}
          style={{
            display: 'inline-block',
            padding: '5px 10px',
            borderRadius: '5px',
            border: '1px solid #3A3F58',
            margin: '5px',
            cursor: 'pointer',
            transition: 'border-color 0.3s',
          }}
        >
          <option value="">Choisissez un pays</option>
          {listCountries.map((country: any) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>

      
      {loading && <div>Loading data...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {country && genreData.length === 0 && <div>No data available for the selected country</div>}
      {genreData.length > 0 &&
        <svg ref={svgRef}></svg>
      }
    </div>
  );
};

export default Visu2;