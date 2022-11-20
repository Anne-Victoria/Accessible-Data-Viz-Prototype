import * as d3 from 'd3';
import { AgeDatapoint } from '../common/commonTypes';

const numberFormatter = Intl.NumberFormat('en-US');

const getTooltipParameters = () => {
  //
};

const showTooltip = (id: string, data: AgeDatapoint[]) => {
  data.forEach((datapoint) => {
    const tooltip = d3.select(`#tooltip-${datapoint.id}`);
    if (datapoint.id === id) {
      tooltip.attr('display', 'block');
    } else {
      tooltip.attr('display', 'none');
    }
  });
};

const hideTooltip = (id: string) => {
  const tooltip = d3.select(`#tooltip-${id}`);
  tooltip.attr('display', 'none');
};

const setupTooltips = (
  data: AgeDatapoint[],
  rectangles: d3.Selection<
    d3.BaseType | SVGRectElement,
    AgeDatapoint,
    SVGGElement,
    unknown
  >,
  bars: d3.Selection<d3.BaseType, AgeDatapoint, SVGGElement, unknown>,
  xScale: d3.ScaleBand<string>,
  yScale: d3.AxisScale<number>
) => {
  const tooltipDimensions = {
    width: 200,
    height: 60,
  };

  const tooltips = bars
    .join('g')
    .attr('id', (d) => `tooltip-${d.id}`)
    .attr('display', 'none');

  const halfBarWidth = xScale.bandwidth() / 2;

  // tooltip border
  tooltips
    .append('rect')
    .attr('text-anchor', 'middle')
    .attr(
      'x',
      (d) =>
        (xScale(d.age_group) ?? 0) + halfBarWidth - tooltipDimensions.width / 2
    )
    .attr(
      'y',
      (d) => (yScale(d.population_size) ?? 0) - (tooltipDimensions.height + 15)
    )
    .attr('width', tooltipDimensions.width)
    .attr('height', tooltipDimensions.height)
    .attr('fill', '#000000');

  // tooltip background
  tooltips
    .append('rect')
    .attr('text-anchor', 'middle')
    .attr(
      'x',
      (d) =>
        2 +
        (xScale(d.age_group) ?? 0) +
        halfBarWidth -
        tooltipDimensions.width / 2
    )
    .attr(
      'y',
      (d) =>
        2 + (yScale(d.population_size) ?? 0) - (tooltipDimensions.height + 15)
    )
    .attr('width', tooltipDimensions.width - 4)
    .attr('height', tooltipDimensions.height - 4)
    .attr('fill', '#ffffff');

  // Connection between bar and tooltip
  tooltips
    .append('line')
    .attr('x1', (d) => (xScale(d.age_group) ?? 0) + halfBarWidth)
    .attr('y1', (d) => (yScale(d.population_size) ?? 0) - 15)
    .attr('x2', (d) => (xScale(d.age_group) ?? 0) + halfBarWidth)
    .attr('y2', (d) => yScale(d.population_size) ?? 0)
    .attr('stroke-width', '1')
    .attr('stroke', '#000000');

  // Tooltip text: age group
  tooltips
    .append('text')
    .attr('fill', '#000000')
    .attr('text-anchor', 'left')
    .text((d) => `Age: ${d.age_group}`)
    .attr(
      'x',
      (d) =>
        10 +
        (xScale(d.age_group) ?? 0) +
        halfBarWidth -
        tooltipDimensions.width / 2
    )
    .attr('y', (d) => (yScale(d.population_size) ?? 0) - 50);

  // Tooltip text: population size
  tooltips
    .append('text')
    .attr('fill', '#000000')
    .attr('text-anchor', 'left')
    .text((d) => `Population: ${numberFormatter.format(d.population_size)}`)
    .attr(
      'x',
      (d) =>
        10 +
        (xScale(d.age_group) ?? 0) +
        halfBarWidth -
        tooltipDimensions.width / 2
    )
    .attr('y', (d) => (yScale(d.population_size) ?? 0) - 30);

  rectangles.on('mouseover', (_, d) => {
    showTooltip(d.id, data);
  });

  rectangles.on('focusin', (_, d) => {
    showTooltip(d.id, data);
  });

  rectangles.on('mouseleave', (_, d) => {
    hideTooltip(d.id);
  });

  rectangles.on('focusout', (_, d) => {
    hideTooltip(d.id);
  });
};

export { getTooltipParameters, setupTooltips };
