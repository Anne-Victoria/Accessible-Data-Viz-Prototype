/* global d3  */
import { getProcessedData } from './fetchData.mjs';

const drawCountryBarChart = (data) => {
  const margin = {
    top: 50,
    right: 50,
    bottom: 100,
    left: 100,
  };

  const totalWidth = 800;
  const totalHeight = 500;
  const width = totalWidth - margin.left - margin.right;
  const height = totalHeight - margin.top - margin.bottom;

  const xDomain = data.map((d) => d[0]);

  const svg = d3
    .select('#countries-barchart')
    .append('svg')
    .attr('width', totalWidth)
    .attr('height', totalHeight)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const xScale = d3.scaleBand().domain(xDomain).range([0, width]).padding(0.2);

  svg
    .append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll('text')
    .attr('transform', 'translate(-10,0) rotate(-45)')
    .style('text-anchor', 'end');

  svg
    .append('text')
    .attr('text-anchor', 'end')
    .attr('x', width)
    .attr('y', height + margin.bottom - 10)
    .text('Country');

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d[1])])
    .range([height, 0]);

  svg.append('g').call(d3.axisLeft(yScale));

  svg
    .append('text')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-90)')
    .attr('x', 0)
    .attr('y', -0.5 * margin.left)
    .text('Total number of fans');

  svg
    .selectAll('mybar')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', (d) => xScale(d[0]))
    .attr('y', (d) => yScale(d[1]))
    .attr('width', xScale.bandwidth())
    .attr('height', (d) => height - yScale(d[1]))
    .attr('fill', 'salmon')
    .attr('aria-label', (d) => `${d[0]} ${d[1]} fans`);
};

const calculateTotalNumberOfFansByCountry = (data) => {
  let result = data;
  result = d3.rollups(
    result,
    (v) => d3.sum(v, (d) => d.fans),
    (d) => d.origin
  );
  result.sort((a, b) => a[1] < b[1]);
  return result;
};

const initChart = async () => {
  let data = await getProcessedData();
  data = calculateTotalNumberOfFansByCountry(data);

  drawCountryBarChart(data.slice(0, 29));
};

initChart();
