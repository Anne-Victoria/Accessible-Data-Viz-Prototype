/* global d3  */

/**
 * This example is a work in progress. The chart is made accessible to screen readers
 * through a textual description. The content of the SVG is hidden from screen
 * readers so that they don't read out the axes.
 *
 * TODO:
 * - Write a better image description.
 * - Make the tooltips accessible or remove them.
 */

import { getProcessedData } from './fetchData.mjs';
import { renderCode } from './renderCode.mjs';

const drawScatterplot = (data) => {
  const margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 100,
  };

  const totalWidth = 800;
  const totalHeight = 500;
  const width = totalWidth - margin.left - margin.right;
  const height = totalHeight - margin.top - margin.bottom;

  const maxFans = d3.max(data, (d) => d.fans);
  const yearExtent = d3.extent(data, (d) => d.formed);

  let svg = d3
    .select('#bands-scatterplot')
    .append('svg')
    .attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`);

  /* Textual description added according to technique 8 in
        https://www.smashingmagazine.com/2021/05/accessible-svg-patterns-comparison/ */
  svg
    .attr('role', 'img')
    .attr('aria-labelledby', 'chartTitle')
    .append('title')
    .attr('id', 'chartTitle')
    .text(
      'Top 5000 metal bands as dots marking their founding year on the horizontal x axis and their number of fans on the vertical y axis.'
    );

  svg = svg
    .append('g')
    /* Hide the rest of the SVG from the screen reader */
    .attr('aria-hidden', 'true')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const scaleX = d3.scaleLinear().domain(yearExtent).range([0, width]);

  svg
    .append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(scaleX));

  svg
    .append('text')
    .attr('text-anchor', 'end')
    .attr('x', width)
    .attr('y', height + margin.top * 0.8)
    .text('Founding year');

  const scaleY = d3.scaleLinear().domain([0, maxFans]).range([height, 0]);

  svg.append('g').call(d3.axisLeft(scaleY));

  svg
    .append('text')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-90)')
    .attr('x', 0)
    .attr('y', -0.5 * margin.left)
    .text('Number of fans');

  const tooltip = d3
    .select('#bands-scatterplot')
    .append('div')
    .attr('class', 'tooltip');

  const mouseover = () => {
    tooltip.style('display', 'block');
  };

  const mousemove = (event, d) => {
    tooltip
      .text(d.name)
      .style('left', `${event.x + 5}px`)
      .style('top', `${event.y}px`);
  };

  const mouseleave = () => {
    tooltip.transition().duration(200).style('display', 'none');
  };

  svg
    .append('g')
    .selectAll('dot')
    .data(data)
    .join('circle')
    .attr('cx', (d) => scaleX(d.formed))
    .attr('cy', (d) => scaleY(d.fans))
    .attr('r', 3)
    .style('fill', 'salmon')
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseleave', mouseleave);
};

const initChart = async () => {
  let data = await getProcessedData();
  drawScatterplot(data);
};

initChart();
renderCode('/src/scatterplot.js', '#code');
