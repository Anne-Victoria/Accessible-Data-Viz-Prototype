import * as d3 from 'd3';
import { AgeDatapoint } from '../common/commonTypes';

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
    .attr('x', widthWithoutMargins)
    .attr('y', heightWithoutMargins + margins.bottom - 10)
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

  return { bars, rectangles };
};

export default setupChart;
