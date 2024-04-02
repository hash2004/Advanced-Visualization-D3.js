d3.json("/topics_data").then(function(data) {
    // Select the SVG container
    const svgContainer = d3.select("#chart-svg");
    // Get the width and height from the container
    const width = svgContainer.node().clientWidth;
    const height = svgContainer.node().clientHeight;

    // Tooltip
    const tooltip = d3.select("#tooltip");

    // Create SVG container
    const svg = d3.select("#chart-svg")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Create a color scale for bubbles (customize as needed)
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Set up the bubble pack layout
    const pack = d3.pack()
        .size([width, height])
        .padding(1.5);

    // Create a hierarchy from the data and sum the values
    const root = d3.hierarchy({ children: data.nodes })
        .sum(d => d.value);

    // Apply the bubble pack layout to the hierarchy
    pack(root);

    // Create a group element for the bubbles
    const bubbleGroup = svg.append("g")
        .attr("transform", "translate(0,0)");

    // Create and style the bubbles
    const bubbles = bubbleGroup.selectAll("circle")
        .data(root.descendants().filter(d => !d.children))
        .enter().append("circle")
        .attr("class", "bubble")
        .attr("r", d => d.r)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .style("fill", (d, i) => colorScale(i))
        .on("mouseover", function(event, d) {
            // Enlarge the bubble on hover
            d3.select(this).transition()
                .duration(200)
                .attr("r", d.r * 1.2);

            // Show tooltip
            tooltip.style("display", "block")
                .html(`Topic ID: ${d.data.topic_id}<br>Keywords: ${d.data.keywords.join(", ")}<br>Value: ${d.data.value}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 15) + "px");
        })
        .on("mouseout", function(event, d) {
            // Reset the bubble size
            d3.select(this).transition()
                .duration(200)
                .attr("r", d.r);

            // Hide tooltip
            tooltip.style("display", "none");
        })
        .on("click", function(event, d) {
            // Implement a click event, e.g., displaying detailed information
            alert(`Clicked on Topic ID: ${d.data.topic_id}`);
        });

    // Brushing
    const brush = d3.brush()
        .extent([[0, 0], [width, height]])
        .on("start brush", brushed)
        .on("end", brushended);

    bubbleGroup.call(brush);

    function brushed(event) {
        if (event.selection === null) return;

        const [[x0, y0], [x1, y1]] = event.selection;
        
        bubbles.classed("selected", function(d) {
            return x0 <= d.x && d.x <= x1 && y0 <= d.y && d.y <= y1;
        });
    }

    function brushended(event) {
        // Reset the "selected" class if the brush is cleared
        if (event.selection === null) {
            bubbles.classed("selected", false);
        }
        // Optional: add logic here for when the brush selection ends
    }

}).catch(function(error) {
    console.log(error);
});


