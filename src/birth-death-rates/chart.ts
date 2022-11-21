import * as d3 from 'd3';
import { BirthsDeathsDatapoint } from '../common/commonTypes';

const setupChart = (
  data: BirthsDeathsDatapoint[],
  svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
  xScale: d3.AxisScale<number>,
  yScale: d3.AxisScale<number>,
  heightWithoutMargins: number,
  widthWithoutMargins: number,
  bottomMargin: number
) => {
  const lastDatapoint: BirthsDeathsDatapoint = data[data.length - 1];
  const lastDatapointCoordinates = {
    x: xScale(lastDatapoint.year),
    yDeaths: yScale(lastDatapoint.deaths),
    yBirths: yScale(lastDatapoint.births),
  };

  // White chart background
  svg
    .append('rect')
    .attr('x', '0 ')
    .attr('y', '0')
    .attr('width', widthWithoutMargins)
    .attr('height', heightWithoutMargins)
    .attr('fill', '#ffffff');

  // Render x axis
  svg
    .append('g')
    .attr('aria-hidden', 'true')
    .attr('transform', `translate(0, ${heightWithoutMargins})`)
    .call(d3.axisBottom(xScale).tickFormat((tick) => `${tick}`))
    .selectAll('text')
    .attr('transform', 'translate(-10,0) rotate(-45)')
    .style('text-anchor', 'end');

  // Render x axis label
  svg
    .append('text')
    .attr('text-anchor', 'end')
    .attr('x', widthWithoutMargins)
    .attr('y', heightWithoutMargins + bottomMargin - 10)
    .attr('class', 'axis-label')
    .text('Year');

  // Render y axis
  svg
    .append('g')
    .attr('aria-hidden', 'true')
    .call(d3.axisLeft(yScale))
    .call((g) =>
      g
        .selectAll('.tick line')
        .clone()
        .attr('x2', widthWithoutMargins)
        .attr('stroke-opacity', 0.1)
    );

  // Render y axis label
  svg
    .append('text')
    .attr('text-anchor', 'left')
    .attr('x', '-80')
    .attr('y', '-20')
    .attr('class', 'axis-label')
    .text('Number of births and deaths');

  // Render data points

  // Note: something seems to be wrong with the type definitions of d3.line,
  // therefore we need to broaden the type to "Function"
  const d3Line = d3.line as Function;

  // birth rate line
  svg
    .append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'darkblue')
    .attr('stroke-width', 5)
    .attr(
      'd',
      d3Line()
        .x((d: BirthsDeathsDatapoint) => {
          return xScale(d.year);
        })
        .y((d: BirthsDeathsDatapoint) => {
          return yScale(d.births);
        })
    );

  // birth rate line label
  if (lastDatapointCoordinates.x && lastDatapointCoordinates.yBirths) {
    svg
      .append('text')
      .attr('fill', '#000000')
      .attr('text-anchor', 'left')
      .text('Births')
      .attr('aria-hidden', 'true')
      .attr('x', lastDatapointCoordinates.x + 10)
      .attr('y', lastDatapointCoordinates.yBirths);
  }

  // death rate line
  svg
    .append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'red')
    .attr('stroke-width', '5')
    .attr(
      'd',
      d3Line()
        .x((d: BirthsDeathsDatapoint) => {
          return xScale(d.year);
        })
        .y((d: BirthsDeathsDatapoint) => {
          return yScale(d.deaths);
        })
    );

  // death rate line label
  if (lastDatapointCoordinates.x && lastDatapointCoordinates.yDeaths) {
    svg
      .append('text')
      .attr('fill', '#000000')
      .attr('text-anchor', 'left')
      .text('Deaths')
      .attr('aria-hidden', 'true')
      .attr('x', lastDatapointCoordinates.x + 10)
      .attr('y', lastDatapointCoordinates.yDeaths);
  }
};

export default setupChart;