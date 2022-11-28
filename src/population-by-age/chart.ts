import * as d3 from 'd3';
import { AgeDatapoint } from '../common/commonTypes';

/**
 * Renders the population-by-age chart
 *
 * @param data - the births-deaths data set
 * @param xScale - the d3 scale for determining positions on the x axis
 * @param yScale - the d3 scale for determining positions on the y axis
 * @param totalWidth - the width of the chart incl. margins
 * @param totalHeight - the height of the chart incl. margins
 * @param widthWithoutMargins - the width of the chart excl. margins
 * @param heightWithoutMargins - the height of the chart incl. margins
 * @param margins - the margins of the chart
 * @param margins.top - the top margin of the chart
 * @param margins.right - the right margin of the chart
 * @param margins.left - the left margin of the chart
 * @param margins.bottom - the bottom margin of the chart
 * @returns - the svg, rectangles and bars elements after setting the chart up
 */
const setupChart = (
  data: AgeDatapoint[],
  xScale: d3.ScaleBand<string>,
  yScale: d3.AxisScale<number>,
  totalWidth: number,
  totalHeight: number,
  widthWithoutMargins: number,
  heightWithoutMargins: number,
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }
): {
  svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  rectangles: d3.Selection<
    d3.BaseType | SVGRectElement,
    AgeDatapoint,
    SVGGElement,
    unknown
  >;
  bars: d3.Selection<d3.BaseType, AgeDatapoint, SVGGElement, unknown>;
} => {
  // Render chart base
  const svg = d3
    .select('#population-chart')
    .append('svg')
    .attr('id', 'vizRoot')
    .attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .append('g')
    .attr('transform', `translate(${margins.left}, ${margins.top})`);

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
    .call(d3.axisBottom(xScale))
    .selectAll('text')
    .attr('transform', 'translate(-10,0) rotate(-45)')
    .style('text-anchor', 'end');

  // Render x axis label
  svg
    .append('text')
    .attr('text-anchor', 'end')
    .attr('x', widthWithoutMargins + 20)
    .attr('y', heightWithoutMargins + margins.bottom - 30)
    .attr('class', 'axis-label')
    .text('Age');

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

  //   Render y axis label
  svg
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('x', 0)
    .attr('y', -20)
    .attr('class', 'axis-label')
    .text('Population at this age');

  // Render bars
  const bars = svg.selectAll('mybar').data(data);

  const rectangles = bars
    .join('rect')
    .attr('x', (d) => `${xScale(d.age_group)}`)
    .attr('y', (d) => yScale(d.population_size) ?? 0)
    .attr('width', xScale.bandwidth())
    .attr(
      'height',
      (d) => heightWithoutMargins - (yScale(d.population_size) ?? 0)
    )
    .attr('fill', '#004747')
    .attr('tabindex', '0')
    /* Each bar has an aria-label for screen readers */
    .attr('aria-labelledby', (d) => `tooltip-${d.id}`);

  return { svg, bars, rectangles };
};

export default setupChart;
