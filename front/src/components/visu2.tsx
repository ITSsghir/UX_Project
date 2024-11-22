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

  useEffect(() => {
    if (!svgRef.current || !genreData.length) return;

    const svg = d3.select(svgRef.current);

    const dynamicWidth = Math.max(width, genreData.length * 100);
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

    // Add the y-axis to the chart
    chartGroup
      .append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .attr('class', 'y-axis');

    // Add the x-axis to the chart
    chartGroup
      .append('g')
      .call(d3.axisBottom(xScale))
      .attr('transform', `translate(0, ${innerHeight})`)
      .attr('class', 'x-axis')
      .selectAll('text')
      .attr('text-anchor', 'end')
      .attr('transform', 'rotate(-30)')
      .style('font-size', '10px');

    // Add bars to the chart (if no genre data is available, display a message)
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
      // Set the x and y attributes to position the bars correctly
      // Use the xScale and yScale functions to position the bars
      // Use the bandwidth function to set the width of the bars (20 pixels and centered on its genre)
      .attr('x', (d: any) => {
        // If the xScale function doesn't return a value, return 0
        return xScale(d.genre) ?? 0;
      })
      .attr('y', (d: any) => yScale(d.fans))
      // Set the width of the bars to 20 pixels
      .attr('width', xScale.bandwidth())
      .attr('height', (d: any) => {
        if (yScale(d.fans) === undefined) {
          return innerHeight;
        } else {
          return innerHeight - yScale(d.fans) ?? 0;
        }
      })
      .attr('fill', '#4682B4')
      .on('mouseover', (event, d: any) => {
        d3.select(event.currentTarget).attr('fill', 'orange');
      })
      .on('mousemove', (event) => {
        d3.select(event.currentTarget).attr('fill', 'orange');
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget).attr('fill', '#4682B4'); // Restore the original color
      })
      .on('click', (event, d: any) => {
        setGenreSwitch(d.genre);
        setVisuSwitch('visu3');
      })
      .on('mouseenter', (event, d: any) => {
        setHoveredGenre(d.genre);
      })
      .on('mouseleave', () => {
        setHoveredGenre(null);
      })
    
    // Add labels to the bars, even if the value is 0
    chartGroup
      .selectAll('.label')
      .data(genreData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', (d: any) => (xScale(d.genre) ?? 0) + xScale.bandwidth() / 2) // Utiliser une valeur par défaut si xScale retourne undefined
      .attr('y', (d: any) => (yScale(d.fans) ?? 0) - 20) // Juste au-dessus de la barre
      .attr('dy', '0.75em')
      .attr('text-anchor', 'middle') // Centrer le texte
      .attr('font-size', '12px')
      .attr('fill', 'white')
      .text((d: any) => {
        if (d.fans >= 0) {
          return d.fans.toLocaleString();
        }
        return '';
      })
      .on('mouseenter', (event, d: any) => {
        setHoveredGenre(d.genre);
      })
      .on('mouseleave', () => {
        setHoveredGenre(null);
      })
      .on('mousemove', (event) => {
        d3.select(event.currentTarget).attr('fill', 'orange');
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget).attr('fill', 'white'); // Restore the original color
      })
      .on('click', (event, d: any) => {
        setGenreSwitch(d.genre);
        setVisuSwitch('visu3');
      });
    
    // Add axis labels to the chart
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
        `translate(${margin.left + innerWidth / 2}, ${margin.top + innerHeight + margin.bottom / 2})`
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