import { fetchArtistData } from '../utils/api_helpers.js';
import { createTooltip } from '../components/tooltip.js';

// The svg
var svg = d3.select("#my_dataviz"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
    .scale(130)
    .center([0, 20])
    .translate([width / 2, height / 1.5]);

// Data and color scale
var data = d3.map(); // Map to hold the artist data
var colorScale = d3.scaleThreshold()
    .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
    .range(d3.schemeBlues[7]);

// Tooltip
var tooltip = createTooltip();

// Load external data and boot
d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    .defer(fetchArtistData) // Récupère les données des artistes
    .await(ready);

async function ready(error, topo, artistData) {
    if (error) throw error;

    // Suppose que artistData est un tableau d'objets contenant des pays et leur popularité
    // Exemple : [{ country: 'France', popularity: 200000 }, { country: 'USA', popularity: 50000000 }, ...]

    // Remplis la map avec les données de popularité des artistes
    artistData.forEach(artist => {
        data.set(artist.country, artist.popularity); // Assure-toi que les noms des pays correspondent aux propriétés dans topo
    });

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        .attr("d", path.projection(projection))
        .attr("fill", function(d) {
            d.total = data.get(d.properties.name) || 0; 
            return colorScale(d.total);
        })
        .on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("Pays: " + d.properties.name + "<br>Popularité: " + d.total)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
}
