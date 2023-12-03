document.addEventListener("DOMContentLoaded", function() {
    createForceDirectedGraph();
});

async function createForceDirectedGraph() {
    const width = 800; // Adjust as needed
    const height = 600; // Adjust as needed

    // Fetch data from your server
    const response = await fetch('/get_entity_network');
    const graph = await response.json();
    console.log(graph); // Check the structure of the received data
    // Create an SVG container for the graph
    const svg = d3.select("#graph-svg")
        .attr("width", width)
        .attr("height", height);

    // Create a D3 force simulation
    const simulation = d3.forceSimulation(graph.nodes)
        .force("link", d3.forceLink(graph.links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

    // Create lines for links
    const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(graph.links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value));

    // Create circles for nodes
    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(graph.nodes)
        .join("circle")
        .attr("r", 5) // Radius of nodes
        .attr("fill", colorNode) // You can define a color function if needed
        .call(drag(simulation));

    // Add tooltips to nodes
    node.append("title")
        .text(d => d.id);

    // Update positions of nodes and links in the simulation's tick event
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

    // Define drag behavior for nodes
    function drag(simulation) {
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

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    // Function to define node colors (customize as needed)
    function colorNode(d) {
        // Add logic to assign colors based on your requirements
        return "steelblue";
    }
}