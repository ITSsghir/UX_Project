import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Member {
  name: string;
  type: string;
  end_date: string;
  begin_date: string;
  gender: string;
  birth_date: string;
}

interface Artist {
  id: number;
  name: string;
  genres: string[];
  country: string;
  members: Member[];
  nb_members: number;
}

interface Visu3Props {
  dimensions: { width: number; height: number };
  country: string;
  genre: string;
  setCountrySwitch: (country: string) => void;
  setGenreSwitch: (genre: string) => void;
  setVisuSwitch: (visu: string) => void;
  artistsData: Artist[];
  listCountries: string[];
  filterDataForVisu3: (artistsData: Artist[], country: string, genre: string) => Artist[];
}

const Visu3: React.FC<Visu3Props> = ({
  dimensions,
  country,
  genre,
  setCountrySwitch,
  setGenreSwitch,
  setVisuSwitch,
  artistsData,
  listCountries,
  filterDataForVisu3,
}) => {
  const { width, height } = dimensions;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [filteredData, setFilteredData] = useState<Artist[]>(filterDataForVisu3(artistsData, country, genre));
  const [filteredGenres, setFilteredGenres] = useState<string[]>([]);
  const genres = new Set<string>();
  filteredData.forEach((artist) => {
    artist.genres.forEach((genre) => {
      genres.add(genre);
    }
    );
  }
  );
  setFilteredGenres(Array.from(genres));


  useEffect(() => {
    setVisuSwitch('visu3');
  }, [setVisuSwitch]);

  // Step 1: Filter data by country and genre when either is selected
  useEffect(() => {
    if (country && genre) {
      setGenreSwitch(genre);
      setCountrySwitch(country);
      const newFilteredData = filterDataForVisu3(artistsData, country, genre);
      setFilteredData(newFilteredData);
      if (country) {
        const genres = new Set<string>();
        artistsData.forEach((artist) => {
          if (artist.country === country) {
            artist.genres.forEach((genre) => {
              genres.add(genre);
            });
          }
        });
        setFilteredGenres(Array.from(genres));
      }
    }
    if (!svgRef.current || !country || !genre || !filteredData.length) return;

    if(!country && genre) {
      setFilteredData([]);
      setFilteredGenres([]);
      setGenreSwitch('');
    }

    const svg = d3.select(svgRef.current);
    if (!svg) return;
    svg.selectAll('*').remove(); // Clear the canvas

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const chartGroup = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Process data to create nodes for artists and members
    const nodes: any[] = [];
    const links: any[] = [];

    filteredData.forEach((artist, i) => {
      const artistNode = {
        id: `artist-${artist.id}`,
        name: artist.name,
        type: 'artist',
        radius: 50 + artist.nb_members * 5,
        color: colorScale(artist.id.toString()),
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
      };
      nodes.push(artistNode);

      artist.members.forEach((member, j) => {
        const memberNode = {
          id: `member-${artist.id}-${j}`,
          name: member.name,
          type: 'member',
          radius: 15,
          artistId: artistNode.id,
          details: member,
          color: colorScale(artist.id.toString()),
          x: Math.random() * innerWidth,
          y: Math.random() * innerHeight,
        };
        nodes.push(memberNode);
        links.push({ source: artistNode.id, target: memberNode.id });
      });
    });

    // Force simulation setup
    d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(10))
      .force('charge', d3.forceManyBody().strength(0))
      .force('center', d3.forceCenter(innerWidth / 2, innerHeight / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius + 10))
      .force('x', d3.forceX().strength(0.1).x((d: any) => Math.max(d.radius, Math.min(innerWidth - d.radius, d.x))))
      .force('y', d3.forceY().strength(0.1).y((d: any) => Math.max(d.radius, Math.min(innerHeight - d.radius, d.y))))
      .on('tick', ticked);

    // Draw links between artists and members
    chartGroup
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1);

    // Draw circles for nodes
    const circles = chartGroup
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', (d: any) => d.radius)
      .attr('fill', (d: any) => d.color)
      .attr('stroke', '#333')
      .attr('stroke-width', 2);

    // Add text labels for artist nodes
    chartGroup
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('font-size', '10px')
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .text((d: any) => (d.type === 'artist' ? d.name : ''));

    // Tooltip setup
    const tooltip = d3
      .select('body')
      .append('div')
      .style('position', 'absolute')
      .style('background', '#fff')
      .style('padding', '5px 10px')
      .style('border', '1px solid #ccc')
      .style('border-radius', '5px')
      .style('display', 'none')
      .style('pointer-events', 'none');

    // Tooltip interactions
    circles
      .on('mouseover', (event: any, d: any) => {
        if (d.type === 'member') {
          tooltip
            .style('display', 'block')
            .html(
              `<strong>${d.details.name}</strong><br>
               Type: ${d.details.type || 'N/A'}<br>
               Begin: ${d.details.begin_date || 'N/A'}<br>
               End: ${d.details.end_date || 'N/A'}<br>
               Gender: ${d.details.gender || 'N/A'}<br>
               Birth Date: ${d.details.birth_date || 'N/A'}`
            )
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY + 10}px`);
        }
      })
      .on('mousemove', (event: any) => {
        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY + 10}px`);
      })
      .on('mouseout', () => {
        tooltip.style('display', 'none');
      });

    // Handle ticks in the simulation
    function ticked() {
      chartGroup
        .selectAll('line')
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      chartGroup
        .selectAll('circle')
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      chartGroup
        .selectAll('text')
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    }
  }, [country, genre, width, height, artistsData, filterDataForVisu3]);

  return (
    <div>
      <h2>Visualization 3: Artists and Members Network</h2>
      {/* Country Dropdown */}
      <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '20px',
      }}
      >
        <label style={{ marginRight: '20px' }}>
          Select Country:
          <select value={country} onChange={(e) => {
            setCountrySwitch(e.target.value);
            setGenreSwitch('');
          }
          } style={{
            display: 'inline-block',
              padding: '5px 10px',
              borderRadius: '5px',
              border: 'none',
              backgroundColor: '#3A3F58',
              margin: '5px',
              color: 'white',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
          }}>
            {listCountries.map((countryOption, index) => (
              <option key={index} value={countryOption}>
                {countryOption}
              </option>
            ))}
          </select>
        </label>

        {/* Genre Dropdown (only visible when a country is selected) */}
        {country && filteredGenres.length > 0 && (
          <>
            <label style={{ marginRight: '20px' }}>
              Select Genre:
              <select value={genre} onChange={(e) => setGenreSwitch(e.target.value)} style={{
                display: 'inline-block',
                padding: '5px 10px',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: '#3A3F58',
                margin: '5px',
                color: 'white',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}>
                <option value="">Choose a genre</option>
                {filteredGenres.map((genreOption, index) => (
                  <option key={index} value={genreOption}>
                    {genreOption}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
    </div>
      {country && genre && filteredData.length > 0 && (
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        border: '1px solid #3A3F58',
        borderRadius: '5px',
        padding: '10px',
        marginBottom: '20px',
      }}>
        {/* D3 Visualization */}
        {country && genre && <svg ref={svgRef}></svg>}
      </div>
      )}
    </div>
  );
};

export default Visu3;