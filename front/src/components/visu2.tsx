import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useParams } from 'react-router-dom';

interface Visu2Props {
  width: number;
  height: number;
  artistsData: any;
}

const Visu2: React.FC<Visu2Props> = ({ width, height, artistsData }) => {
  const { countryId } = useParams<{ countryId: string }>();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [genreData, setGenreData] = useState<{ genre: string; fans: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!countryId || !artistsData.length) return;

    setLoading(true);
    setError(null);

    try {
      const countryArtists = artistsData.filter(
        (artist: any) => artist.country?.toLowerCase() === countryId.toLowerCase()
      );

      const genreFansMap: Record<string, number> = {};
      countryArtists.forEach((artist: any) => {
        artist.genres.forEach((genre: string) => {
          if (!genreFansMap[genre]) {
            genreFansMap[genre] = 0;
          }
          genreFansMap[genre] += artist.deezer_fans;
        });
      });

      const computedGenreData = Object.entries(genreFansMap).map(([genre, fans]) => ({
        genre,
        fans,
      }));

      setGenreData(computedGenreData);
    } catch (err) {
      console.error('Error processing genre data:', err);
      setError('Failed to process genre data.');
    } finally {
      setLoading(false);
    }
  }, [countryId, artistsData]);

  useEffect(() => {
    if (!svgRef.current || !genreData.length) return;

    const svg = d3.select(svgRef.current);

    const dynamicWidth = Math.max(width, genreData.length * 80);
    svg.attr('width', dynamicWidth).attr('height', height + 80);

    svg.selectAll('*').remove();

    const margin = { top: 80, right: 20, bottom: 100, left: 70 };
    const innerWidth = dynamicWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const chartGroup = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(genreData.map((d) => d.genre))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(genreData, (d) => d.fans) || 0])
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
      .attr('x', (d) => xScale(d.genre) || 0)
      .attr('y', (d) => yScale(d.fans))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => innerHeight - yScale(d.fans))
      .attr('fill', '#4682B4')
      .on('mouseover', (event, d) => {
        console.log('Mouseover triggered for', d.genre); // Debugging
        tooltip
          .style('opacity', 1)
          .html(
            `<strong>Country:</strong> ${countryId}<br/>
             <strong>Genre:</strong> ${d.genre}<br/>
             <strong>Fans:</strong> ${d.fans.toLocaleString()}`
          )
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY}px`);

        // Change the color of the bar on mouseover
        d3.select(event.currentTarget).attr('fill', '#FF7F50');
      })
      .on('mousemove', (event) => {
        tooltip.style('left', `${event.pageX + 10}px`).style('top', `${event.pageY}px`);
      })
      .on('mouseout', (event) => {
        tooltip.style('opacity', 0); // Hide the tooltip
        d3.select(event.currentTarget).attr('fill', '#4682B4'); // Restore the original color
      });

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
      <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Statistiques pour le pays: {countryId}</h2>
      {loading && <div>Loading data...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default Visu2;
