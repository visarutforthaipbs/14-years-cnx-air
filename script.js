d3.json("pm25_formatted.json").then(function (data) {
  const formattedData = {};
  data.forEach((d) => {
    formattedData[d.date] = d.pm25 === "No Data" ? null : Math.round(+d.pm25);
  });

  const years = d3.range(2011, 2025);
  const cellSize = 16; // Size of each cell, reduced for compactness
  const margin = { top: 100, right: 30, bottom: 30, left: 100 };
  const gapBetweenYears = 5; // Reduce the gap between year columns

  const svgWidth =
    (cellSize * 7 + gapBetweenYears) * years.length +
    margin.left +
    margin.right;
  const svgHeight = cellSize * 55 + margin.top + margin.bottom;

  const svg = d3
    .select("#heatmap")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define new color scale according to the provided image for PM2.5 (µg/m³)
  const color = d3
    .scaleThreshold()
    .domain([9, 35.4, 55.4, 125.4, 225.4, Infinity])
    .range([
      "#00ff00", // ≤9.0 (Good)
      "#ffff00", // 9.1-35.4 (Moderate)
      "#ffa500", // 35.5-55.4 (Unhealthy for Sensitive Groups)
      "#ff4500", // 55.5-125.4 (Unhealthy)
      "#800080", // 125.5-225.4 (Very Unhealthy)
      "#800000", // ≥225.5 (Hazardous)
      "#ccc", // For No Data
    ]);

  const xOffset = (day) => day * cellSize;
  const yOffset = (week, yearIndex) =>
    week * cellSize + yearIndex * (cellSize * 7 + gapBetweenYears);

  years.forEach((year, yearIndex) => {
    svg
      .append("text")
      .attr("class", "year-label")
      .attr("x", yearIndex * (cellSize * 7 + gapBetweenYears) + cellSize * 3.5)
      .attr("y", -20)
      .attr("dy", "-0.3em")
      .attr("text-anchor", "middle")
      .text(year);

    d3.timeWeek
      .range(new Date(year, 0, 1), new Date(year + 1, 0, 1))
      .forEach((week) => {
        d3.timeDays(week, d3.timeDay.offset(week, 7)).forEach((day) => {
          const dayKey = d3.timeFormat("%Y-%m-%d")(day);
          const value = formattedData[dayKey];

          svg
            .append("rect")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr(
              "x",
              xOffset(day.getDay()) +
                yearIndex * (cellSize * 7 + gapBetweenYears)
            )
            .attr("y", yOffset(d3.timeFormat("%U")(week), 0))
            .attr("fill", value !== null ? color(value) : "#ccc")
            .attr("stroke", "#fff")
            .on("mouseover", function (event) {
              tooltip.transition().duration(200).style("opacity", 0.9);
            })
            .on("mousemove", function (event) {
              const tooltipText = `${dayKey}<br>`;
              let tooltipLabel = "";

              if (value === null) {
                tooltipLabel = "ไม่มีข้อมูล"; // No Data
              } else if (value <= 9) {
                tooltipLabel = "อากาศดี"; // Excellent
              } else if (value <= 35.4) {
                tooltipLabel = "ปานกลาง"; // Good
              } else if (value <= 55.4) {
                tooltipLabel = "มีผลต่อกลุ่มเสี่ยง"; // Moderate
              } else if (value <= 125.4) {
                tooltipLabel = "มีผลต่อสุขภาพ"; // Unhealthy
              } else if (value <= 225.4) {
                tooltipLabel = "อันตรายมาก"; // Very Unhealthy
              } else {
                tooltipLabel = "ภัยพิบัติ"; // Hazardous
              }

              tooltip
                .html(tooltipText + tooltipLabel)
                .style("left", event.pageX + 15 + "px")
                .style("top", event.pageY + 15 + "px");
            })
            .on("mouseout", function () {
              tooltip.transition().duration(500).style("opacity", 0);
            });

          if (value !== null) {
            svg
              .append("text")
              .attr(
                "x",
                xOffset(day.getDay()) +
                  cellSize / 2 +
                  yearIndex * (cellSize * 7 + gapBetweenYears)
              )
              .attr("y", yOffset(d3.timeFormat("%U")(week), 0) + cellSize / 2)
              .attr("dy", ".35em")
              .attr("text-anchor", "middle")
              .attr("font-size", "8px")
              .attr("fill", "#000")
              .text(value);
          }
        });
      });
  });

  const months = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  months.forEach((month, i) => {
    svg
      .append("text")
      .attr("class", "month-label")
      .attr("x", -50)
      .attr("y", i * cellSize * 4.5 + cellSize / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .text(month);
  });

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
});
