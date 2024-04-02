// Define the width and height for the network graph SVG element
const networkWidth = 1000; // Adjust as needed
const networkHeight = 900; // Adjust as needed

// Select the SVG element where the network graph will be rendered
const networkSvg = d3.select("#network-graph-svg")
    .attr("viewBox", [-networkWidth / 2, -networkHeight / 2, networkWidth, networkHeight]) // Adjust viewBox for zoom and pan
    .call(d3.zoom().scaleExtent([1 / 2, 8]).on("zoom", (event) => networkSvg.attr("transform", event.transform))); // Enable zoom and pan


// Define the force simulation for the network graph
const networkSimulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(d => d.id).distance(50))
    .force("charge", d3.forceManyBody().strength(-50))
    .force("center", d3.forceCenter(networkWidth / 2, networkHeight / 2));

// Create a color scale for different types of entities
const color = d3.scaleOrdinal(d3.schemeCategory10);

// Fetch the data from the Flask route
d3.json("/get_radial_network_data").then(graph => {
    // Scale for node size based on weight, defined inside the .then() to have access to 'graph'
    const radiusScale = d3.scaleSqrt()
        .domain([d3.min(graph.nodes, d => d.weight), d3.max(graph.nodes, d => d.weight)])
        .range([5, 20]); // Min and max radius

    // Define the tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Create link elements
    const links = networkSvg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke", "#999");

    // Create node elements
    const nodes = networkSvg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("r", d => radiusScale(d.weight))
        .attr("fill", d => color(d.type))
        .on("mouseover", (event, d) => {
            // Highlight the connected links and nodes
            links.style('stroke', l => (l.source === d || l.target === d) ? 'red' : '#999');
            nodes.style('opacity', n => (n === d || isConnected(d, n)) ? 1 : 0.1);

            // Show tooltip
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`ID: ${d.id}<br>Type: ${d.type}<br>Weight: ${d.weight}`)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            // Reset link and node styles
            links.style('stroke', '#999');
            nodes.style('opacity', 1);

            // Hide tooltip
            tooltip.transition().duration(500).style("opacity", 0);
        });

    // Start the simulation
    networkSimulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    networkSimulation.force("link")
        .links(graph.links);

    function ticked() {
        links
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        nodes
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    }

    function isConnected(a, b) {
        return graph.links.some(l => (l.source === a && l.target === b) || (l.source === b && l.target === a));
    }
}).catch(error => {
    console.error("Error fetching data: ", error);
});