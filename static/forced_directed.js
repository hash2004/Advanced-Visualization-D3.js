const fdgsvg = d3.select("#graph-svg"),
    width = +fdgsvg.attr("width"),
    height = +fdgsvg.attr("height");

// Define the force simulation
const simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(d => d.id).distance(50))
    .force("charge", d3.forceManyBody().strength(-50))
    .force("center", d3.forceCenter(width / 2, height / 2));

// Define tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Load the data from the Flask endpoint
d3.json("/get_entity_network").then(graph => {
    // Create link elements
    const links = fdgsvg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6);

    // Create a color scale for different communities
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Scale for node size based on centrality
    const radiusScale = d3.scaleSqrt()
        .domain([d3.min(graph.nodes, d => d.centrality), d3.max(graph.nodes, d => d.centrality)])
        .range([5, 20]); // Min and max radius


    // Create node elements
    const nodes = fdgsvg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("r", 5) // radius of nodes
        // .attr("r", d => radiusScale(d.centrality)) // use centrality for radius
        .attr("fill", d => color(d.community)) // use community for color
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

    // Define ticked function
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

    // Start simulation
    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    // Drag behavior functions
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    // Mouseover and mouseout functions for tooltip and focus
    function mouseover(event, d) {
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html(d.id)
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px");

        // Focus on the current node and its connections
        nodes.style("opacity", o => o === d || isConnected(d, o) ? 1 : 0.1);
        links.style("opacity", o => o.source === d || o.target === d ? 1 : 0.1);
    }

    function mouseout() {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);

        // Reset opacity
        nodes.style("opacity", 1);
        links.style("opacity", 0.6);
    }

    // Check if two nodes are connected
    const linkedByIndex = {};
    graph.links.forEach(d => {
        linkedByIndex[`${d.source.id},${d.target.id}`] = true;
    });

    function isConnected(a, b) {
        return linkedByIndex[`${a.id},${b.id}`] || linkedByIndex[`${b.id},${a.id}`] || a.id === b.id;
    }
    const brush = d3.brush()
    .extent([[0, 0], [width, height]])
    .on("start", brushStarted)
    .on("brush", brushed)
    .on("end", brushEnded);

fdgsvg.append("g")
    .attr("class", "brush")
    .call(brush);
    function brushStarted(event) {
        // Reset any previously selected nodes and links
        nodes.classed("selected", false);
        links.classed("selected", false);
    }
    
    function brushed(event) {
        if (event.selection === null) return;
    
        const [[x0, y0], [x1, y1]] = event.selection;
    
        // Select nodes and links within the brushed area
        nodes.classed("selected", d => 
            x0 <= d.x && d.x <= x1 && y0 <= d.y && d.y <= y1
        );
        links.classed("selected", d => 
            x0 <= d.source.x && d.source.x <= x1 && y0 <= d.source.y && d.source.y <= y1 &&
            x0 <= d.target.x && d.target.x <= x1 && y0 <= d.target.y && d.target.y <= y1
        );
    }
    
    function brushEnded(event) {
        // If no area is selected (brush is cleared), reset the selection
        if (event.selection === null) {
            nodes.classed("selected", false);
            links.classed("selected", false);
        }
        // Additional actions can be performed here after selection
    }
    

}).catch(error => {
    console.error("Error fetching data: ", error);
});