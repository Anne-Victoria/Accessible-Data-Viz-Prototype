import * as d3 from 'd3';
import { AgeDatapoint } from '../common/commonTypes';

let timeOfLastForceHide = Date.now();

const numberFormatter = Intl.NumberFormat('en-US');

const getTooltipParameters = (
  data: AgeDatapoint[],
  xScale: d3.ScaleBand<string>,
  yScale: d3.AxisScale<number>,
  heightWithoutMargins: number,
  tooltipDimensions: { width: number; height: number }
) => {
  const halfBarWidth = xScale.bandwidth() / 2;

  return data.map((d) => {
    const params = {
      outerBox: {
        startX:
          (xScale(d.age_group) ?? 0) +
          halfBarWidth -
          tooltipDimensions.width / 2,
        startY:
          (yScale(d.population_size) ?? 0) - (tooltipDimensions.height + 15),
        width: tooltipDimensions.width,
        height: tooltipDimensions.height,
      },
      innerBox: {
        startX:
          2 +
          (xScale(d.age_group) ?? 0) +
          halfBarWidth -
          tooltipDimensions.width / 2,
        startY:
          2 +
          (yScale(d.population_size) ?? 0) -
          (tooltipDimensions.height + 15),
        width: tooltipDimensions.width - 4,
        height: tooltipDimensions.height - 4,
      },
      showTooltipTriggerArea: {
        startX: 0,
        startY: 0,
        width: 0,
        height: 0,
      },
      hideToolTipTriggerArea: {
        points: [] as string[],
      },
    };

    params.showTooltipTriggerArea = {
      startX: xScale(d.age_group) ?? 0,
      startY: yScale(d.population_size) ?? 0,
      width: xScale.bandwidth(),
      height: heightWithoutMargins - (yScale(d.population_size) ?? 0),
    };

    params.hideToolTipTriggerArea = {
      points: [
        `${params.outerBox.startX},${params.outerBox.startY}`,
        `${params.outerBox.startX},${
          params.outerBox.startY + params.outerBox.height
        }`,
        `${params.showTooltipTriggerArea.startX},${
          params.outerBox.startY + params.outerBox.height
        }`,
        `${params.showTooltipTriggerArea.startX},${
          params.showTooltipTriggerArea.startY +
          params.showTooltipTriggerArea.height
        }`,
        `${
          params.showTooltipTriggerArea.startX +
          params.showTooltipTriggerArea.width
        },${
          params.showTooltipTriggerArea.startY +
          params.showTooltipTriggerArea.height
        }`,
        `${
          params.showTooltipTriggerArea.startX +
          params.showTooltipTriggerArea.width
        },${params.outerBox.startY + params.outerBox.height}`,
        `${params.outerBox.startX + params.outerBox.width},${
          params.outerBox.startY + params.outerBox.height
        }`,
        `${params.outerBox.startX + params.outerBox.width},${
          params.outerBox.startY
        }`,
      ],
    };
    return params;
  });
};

const showTooltip = (id: string, data: AgeDatapoint[]) => {
  // Hack to circumvent a bug where the tooltip immediately shows up again
  if (Date.now() - timeOfLastForceHide < 500) {
    return;
  }
  data.forEach((datapoint) => {
    const tooltip = d3.select(`#tooltip-${datapoint.id}`);
    const mouseLeaveArea = d3.select(`#mouseLeaveArea-${datapoint.id}`);
    if (datapoint.id === id) {
      tooltip.style('display', 'block');
      mouseLeaveArea.style('display', 'block');
    } else {
      tooltip.style('display', 'none');
      mouseLeaveArea.style('display', 'none');
    }
  });
};

const hideTooltip = (id: string) => {
  const tooltip = d3.select(`#tooltip-${id}`);
  const mouseLeave = d3.select(`#mouseLeaveArea-${id}`);
  tooltip.style('display', 'none');
  mouseLeave.style('display', 'none');
};

const forceHideTooltips = (data: AgeDatapoint[]) => {
  timeOfLastForceHide = Date.now();
  data.forEach((datapoint) => {
    const tooltip = d3.select(`#tooltip-${datapoint.id}`);
    const mouseLeaveArea = d3.select(`#mouseLeaveArea-${datapoint.id}`);
    tooltip.style('display', 'none');
    mouseLeaveArea.style('display', 'none');
  });
};

const setupTooltips = (
  data: AgeDatapoint[],
  svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
  rectangles: d3.Selection<
    d3.BaseType | SVGRectElement,
    AgeDatapoint,
    SVGGElement,
    unknown
  >,
  bars: d3.Selection<d3.BaseType, AgeDatapoint, SVGGElement, unknown>,
  xScale: d3.ScaleBand<string>,
  yScale: d3.AxisScale<number>,
  heightWithoutMargins: number
) => {
  const tooltipDimensions = {
    width: 200,
    height: 60,
  };

  const tooltips = bars
    .join('g')
    .attr('id', (d) => `tooltip-${d.id}`)
    .style('display', 'none');

  const halfBarWidth = xScale.bandwidth() / 2;

  const tooltipParameters = getTooltipParameters(
    data,
    xScale,
    yScale,
    heightWithoutMargins,
    tooltipDimensions
  );

  // tooltip border
  tooltips
    .append('rect')
    .attr('text-anchor', 'middle')
    .attr('x', (_, i) => tooltipParameters[i].outerBox.startX)
    .attr('y', (_, i) => tooltipParameters[i].outerBox.startY)
    .attr('width', (_, i) => tooltipParameters[i].outerBox.width)
    .attr('height', (_, i) => tooltipParameters[i].outerBox.height)
    .attr('fill', '#000000');

  // tooltip background
  tooltips
    .append('rect')
    .attr('text-anchor', 'middle')
    .attr('x', (_, i) => tooltipParameters[i].innerBox.startX)
    .attr('y', (_, i) => tooltipParameters[i].innerBox.startY)
    .attr('width', (_, i) => tooltipParameters[i].innerBox.width)
    .attr('height', (_, i) => tooltipParameters[i].innerBox.height)
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

  // Tooltip will only hide, once the cursor leaves this area
  const keepShowingTooltipAreas = svg
    .selectAll('focusArea')
    .data(data)
    .join('polygon')
    .attr('points', (_, i) =>
      tooltipParameters[i].hideToolTipTriggerArea.points.join(' ')
    )
    .attr('id', (d) => `mouseLeaveArea-${d.id}`)
    .style('display', 'none')
    .style('fill', 'rgba(0,0,0,0)');

  rectangles.on('mouseover', (_, d) => {
    showTooltip(d.id, data);
  });

  rectangles.on('focusin', (_, d) => {
    showTooltip(d.id, data);
  });

  keepShowingTooltipAreas.on('mouseleave', (_, d) => {
    hideTooltip(d.id);
  });

  rectangles.on('focusout', (_, d) => {
    hideTooltip(d.id);
  });

  document.addEventListener('keyup', (event) => {
    if (event.key === 'Escape') {
      forceHideTooltips(data);
    }
  });
};

export { getTooltipParameters, setupTooltips };
