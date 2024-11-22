import React, { useEffect, useRef } from 'react';
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
}

const Visu3: React.FC<Visu3Props> = ({
  dimensions,
  country,
  genre,
  setCountrySwitch,
  setGenreSwitch,
  setVisuSwitch,
  artistsData,
}) => {
  const { width, height } = dimensions;
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clean the canvas

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

    artistsData.forEach((artist, i) => {
      const artistNode = {
        id: `artist-${artist.id}`,
        name: artist.name,
        type: 'artist',
        radius: 50 + artist.nb_members * 5, // Larger groups get larger bubbles
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

    // Create simulation for force-directed graph
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(10)
      )
      .force('charge', d3.forceManyBody().strength(0))
      .force('center', d3.forceCenter(innerWidth / 2, innerHeight / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius + 10))
      // Limit to the width and height of the canvas (including the margin), so nodes don't go off-screen
      // Resize the nodes to fit within the canvas
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
    const labels = chartGroup
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

    function ticked() {
      chartGroup
        .selectAll('circle')
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      chartGroup
        .selectAll('line')
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      chartGroup
        .selectAll('text')
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    }

    return () => {
      simulation.stop();
      tooltip.remove();
    };
  }, [dimensions, artistsData, width, height]);

  return (
    <div>
      <h1>Visualisation des artistes et membres</h1>
      <p>Genre: {genre}</p>
      <p>Pays: {country}</p>
      <button
        onClick={() => {
          setVisuSwitch('');
          setCountrySwitch('');
          setGenreSwitch('');
        }}
      >
        Réinitialiser
      </button>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default Visu3;
