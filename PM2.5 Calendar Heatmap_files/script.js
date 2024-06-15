// Fetch and process data
d3.json("pm25_formatted.json").then(function (data) {
  const formattedData = {};
  data.forEach((d) => {
    formattedData[d.date] = d.pm25 === "No Data" ? null : +d.pm25;
  });

  const years = d3.range(2011, 2025);
  const cellSize = 20; // Size of each cell
  const margin = { top: 50, right: 50, bottom: 50, left: 100 };
  const svgWidth = cellSize * 54; // Space for 52 weeks + extra margin
  const svgHeight = (cellSize * 7 + 30) * years.length; // Space for 7 days + margins for each year

  const svg = d3
    .select("#heatmap")
    .append("svg")
    .attr("width", svgWidth + margin.left + margin.right)
    .attr("height", svgHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define color scale according to AQI index
  const color = d3
    .scaleThreshold()
    .domain([50, 100, 150, 200, 300])
    .range(["#00e400", "#ffff00", "#ff7e00", "#ff0000", "#8f3f97", "#7e0023"]);

  const xOffset = (week) => week * cellSize;
  const yOffset = (day, yearIndex) =>
    day * cellSize + yearIndex * (cellSize * 7 + 30);

  years.forEach((year, yearIndex) => {
    svg
      .append("text")
      .attr("class", "year-label")
      .attr("x", -40)
      .attr("y", yearIndex * (cellSize * 7 + 30) + cellSize * 3.5)
      .attr("dy", "-0.3em")
      .attr("text-anchor", "middle")
      .text(year);

    d3.timeMonth
      .range(new Date(year, 0, 1), new Date(year + 1, 0, 1))
      .forEach((month) => {
        const monthData = d3.timeDays(
          new Date(year, month.getMonth(), 1),
          new Date(year, month.getMonth() + 1, 1)
        );

        monthData.forEach((day) => {
          const dayKey = d3.timeFormat("%Y-%m-%d")(day);
          const value = formattedData[dayKey];

          svg
            .append("rect")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("x", xOffset(d3.timeFormat("%U")(day)))
            .attr("y", yOffset(day.getDay(), yearIndex))
            .attr("fill", value !== null ? color(value) : "#ccc")
            .attr("stroke", "#fff")
            .on("mouseover", function (event, d) {
              tooltip.transition().duration(200).style("opacity", 0.9);
              tooltip
                .html(`${dayKey}<br>${value !== null ? value : "No Data"}`)
                .style("left", event.pageX + 5 + "px")
                .style("top", event.pageY - 28 + "px");
            })
            .on("mouseout", function () {
              tooltip.transition().duration(500).style("opacity", 0);
            });

          // Append text element for the value
          if (value !== null) {
            svg
              .append("text")
              .attr("x", xOffset(d3.timeFormat("%U")(day)) + cellSize / 2)
              .attr("y", yOffset(day.getDay(), yearIndex) + cellSize / 2)
              .attr("dy", ".35em")
              .attr("text-anchor", "middle")
              .attr("font-size", "10px")
              .attr("fill", "#000")
              .text(value);
          }
        });
      });
  });

  // Tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Legend data
  const legendData = [
    { value: 0, color: "#00e400", label: "0-50 (Good)" },
    { value: 51, color: "#ffff00", label: "51-100 (Moderate)" },
    {
      value: 101,
      color: "#ff7e00",
      label: "101-150 (Unhealthy for Sensitive Groups)",
    },
    { value: 151, color: "#ff0000", label: "151-200 (Unhealthy)" },
    { value: 201, color: "#8f3f97", label: "201-300 (Very Unhealthy)" },
    { value: 301, color: "#7e0023", label: ">300 (Hazardous)" },
  ];

  // Populate legend
  const legend = d3.select("#legend");

  legendData.forEach((item) => {
    const legendItem = legend.append("div").attr("class", "legend-item");

    legendItem
      .append("div")
      .style("background-color", item.color)
      .style("width", "20px")
      .style("height", "20px")
      .style("display", "inline-block")
      .style("margin-right", "10px");

    legendItem.append("span").text(item.label);
  });

  // Ensure the close button works correctly
  document
    .getElementById("close-legend")
    .addEventListener("click", function () {
      document.getElementById("legend").classList.remove("show");
    });

  // Ensure the toggle button works correctly
  document
    .getElementById("toggle-legend")
    .addEventListener("click", function () {
      document.getElementById("legend").classList.toggle("show");
    });
});
