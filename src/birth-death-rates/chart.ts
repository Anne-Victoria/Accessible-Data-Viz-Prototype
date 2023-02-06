import * as d3 from 'd3';
import { BirthsDeathsDatapoint } from '../common/commonTypes';

/**
 * Renders the birth-death-rate chart
 *
 * @param data - the births-deaths data set
 * @param svg - the element that the chart will be rendered in
 * @param xScale - the d3 scale for determining positions on the x axis
 * @param yScale - the d3 scale for determining positions on the y axis
 * @param heightWithoutMargins - the height of the chart excl. margins
 * @param widthWithoutMargins - the width of the chart excl. margins
 * @param bottomMargin - the size of the chart's bottom margin
 */
const setupChart = (
  data: BirthsDeathsDatapoint[],
  svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
  xScale: d3.AxisScale<number>,
  yScale: d3.AxisScale<number>,
  heightWithoutMargins: number,
  widthWithoutMargins: number,
  bottomMargin: number
): void => {
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
    // Hide the individual tick marks from screen readers
    .attr('aria-hidden', 'true')
    .attr('transform', `translate(0, ${heightWithoutMargins})`)
    .call(d3.axisBottom(xScale).tickFormat((tick) => `${tick}`))
    .selectAll('text')
    .style('text-anchor', 'middle');

  // Render x axis label
  svg
    .append('text')
    .attr('text-anchor', 'end')
    .attr('x', widthWithoutMargins + 20)
    .attr('y', heightWithoutMargins + bottomMargin - 30)
    .attr('class', 'axis-label')
    .attr('fill', 'currentColor')
    .text('Jahr');

  // Render x axis screen reader text
  svg
    .append('text')
    .attr('fill', '#00000000')
    .attr('class', 'screen-reader-only')
    .text('X-Achse, zeigt Jahr von 1950 bis 2021.');

  // Render y axis
  svg
    .append('g')
    // Hide the individual tick marks from screen readers
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
    .attr('fill', 'currentColor')
    .text('Zahl der Geburten, Sterbefälle');

  // Render x axis screen reader text
  svg
    .append('text')
    .attr('fill', '#00000000')
    .attr('class', 'screen-reader-only')
    .text(
      'Y-Achse, zeigt die absolute Zahl der Geburten und Sterbefälle im jeweiligen Jahr auf einer Skala von 0 bis 1.400.000.'
    );

  // Render data points

  // Note: something seems to be wrong with the type definitions of d3.line,
  // therefore we need to broaden the type to "Function"
  const d3Line = d3.line as Function;

  // birth rate line
  svg
    .append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#ff0000')
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
      .text('Geburten')
      .attr('aria-hidden', 'true')
      .attr('fill', 'currentColor')
      .attr('x', lastDatapointCoordinates.x + 10)
      .attr('y', lastDatapointCoordinates.yBirths);
  }

  // death rate line
  svg
    .append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#0000aa')
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
      .text('Sterbefälle')
      .attr('aria-hidden', 'true')
      .attr('fill', 'currentColor')
      .attr('x', lastDatapointCoordinates.x + 10)
      .attr('y', lastDatapointCoordinates.yDeaths);
  }
};

export default setupChart;
