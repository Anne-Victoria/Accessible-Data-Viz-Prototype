/* global d3 */

import { renderCode } from './renderCode.mjs';
import sonifyData from './sonifyData.mjs';

const drawPopulationByAgeChart = (data) => {
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

  const xDomain = data.map((d) => d.age_group);

  const xScale = d3.scaleBand().domain(xDomain).range([0, width]).padding(0.2);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.population_size)])
    .range([height, 0]);

  // Render chart base
  const svg = d3
    .select('#population-chart')
    .append('svg')
    .attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // Render x axis
  svg
    .append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(
      d3.axisBottom(xScale).tickValues(
        xScale.domain().filter((d, i) => {
          return i % 5 == 0 || d.includes('85');
        })
      )
    )
    .selectAll('text')
    .attr('transform', 'translate(-10,0) rotate(-45)')
    .style('text-anchor', 'end');

  // Render x axis label
  svg
    .append('text')
    .attr('text-anchor', 'end')
    .attr('x', width)
    .attr('y', height + margin.bottom - 10)
    .text('Age');

  // Render y axis
  svg.append('g').call(d3.axisLeft(yScale));

  //   Render y axis label
  svg
    .append('text')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-90)')
    .attr('x', 0)
    .attr('y', -0.75 * margin.left)
    .text('Population at this age');

  // Render bars
  svg
    .selectAll('mybar')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', (d) => xScale(d.age_group))
    .attr('y', (d) => yScale(d.population_size))
    .attr('width', xScale.bandwidth())
    .attr('height', (d) => height - yScale(d.population_size))
    .attr('fill', 'salmon')
    /* Each bar has an aria-label for screen readers */
    .attr('aria-label', (d) => `${d.age_group} ${d.population_size}`);
};

const drawTable = (data) => {
  const svg = d3.select('#population-table');

  const rows = svg.selectAll('row').data(data).enter().append('tr');

  rows.append('td').text((d) => d.age_group);
  rows.append('td').text((d) => d.population_size);
};

const fetchData = async () => {
  const data = await d3.csv('../data/population_by_age.csv', (row) => ({
    age_group: row.age_group,
    population_size: +row.population_size,
  }));
  return data;
};

const main = async () => {
  const data = await fetchData();
  drawPopulationByAgeChart(data);
  drawTable(data);
  renderCode('/src/population.js', '#code');
  const dataForSonification = data.map((entry) => entry.population_size);

  const playSonification = sonifyData(dataForSonification);
  const playButton = document.getElementById('play-population-sonification');
  playButton.addEventListener('click', playSonification);
};

main();
