import * as d3 from 'd3';
import { AgeDatapoint } from '../common/commonTypes';

let timeOfLastForceHide = Date.now();

const numberFormatter = Intl.NumberFormat('en-US');

/**
 * Calculates the positions and dimensions needed for rendering the tooltip for every data point
 *
 * @param data - the entire data set
 * @param xScale - the d3 scale for determining positions on the x axis
 * @param yScale - the d3 scale for determining positions on the y axis
 * @param heightWithoutMargins - the height of the chart excl. margins
 * @param tooltipDimensions - the dimenstions of the box with the tooltip text
 * @param tooltipDimensions.width - the width of the tooltip box
 * @param tooltipDimensions.height - the height of the tooltip box
 * @returns - an array with the positions and dimensions of the tooltip for every data point
 */
const getTooltipParameters = (
  data: AgeDatapoint[],
  xScale: d3.ScaleBand<string>,
  yScale: d3.AxisScale<number>,
  heightWithoutMargins: number,
  tooltipDimensions: { width: number; height: number }
): Array<{
  outerBox: {
    startX: number;
    startY: number;
    width: number;
    height: number;
  };
  innerBox: {
    startX: number;
    startY: number;
    width: number;
    height: number;
  };
  showTooltipTriggerArea: {
    startX: number;
    startY: number;
    width: number;
    height: number;
  };
  hideToolTipTriggerArea: {
    points: string[];
  };
}> => {
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

/**
 * Show the tooltip for the given datapoint
 *
 * @param id - the datapoint's id
 * @param data - the entire data set
 */
const showTooltip = (id: string, data: AgeDatapoint[]): void => {
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

/**
 * Hides the tooltip for the given data point
 *
 * @param id - the id of the data point
 */
const hideTooltip = (id: string): void => {
  const tooltip = d3.select(`#tooltip-${id}`);
  const mouseLeave = d3.select(`#mouseLeaveArea-${id}`);
  tooltip.style('display', 'none');
  mouseLeave.style('display', 'none');
};

/**
 * Hide any tooltips that might currently be open,
 * even when the user currently has their cursor on a data point
 *
 * @param data - the entire data set
 */
const forceHideTooltips = (data: AgeDatapoint[]): void => {
  timeOfLastForceHide = Date.now();
  data.forEach((datapoint) => {
    const tooltip = d3.select(`#tooltip-${datapoint.id}`);
    const mouseLeaveArea = d3.select(`#mouseLeaveArea-${datapoint.id}`);
    tooltip.style('display', 'none');
    mouseLeaveArea.style('display', 'none');
  });
};

/**
 * Renders the tooltips (invisible at first) and sets up event listeners
 * for displaying and hiding them.
 *
 * @param data - the entire data set
 * @param svg - the chart element selected by d3
 * @param rectangles - the <rect> elements of the bars selected by d3
 * @param bars - the bars selected by d3
 * @param xScale - the d3 scale for determining positions on the x axis
 * @param yScale - the d3 scale for determining positions on the y axis
 * @param heightWithoutMargins - the height of the chart excl. margins
 */
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
): void => {
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
