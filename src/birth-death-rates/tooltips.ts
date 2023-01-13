import * as d3 from 'd3';
import { BirthsDeathsDatapoint } from '../common/commonTypes';

let timeOfLastForceHide = Date.now();

/**
 * Calculates the positions and dimensions needed for rendering the tooltip for every data point
 *
 * @param data - the entire data set
 * @param xScale - the d3 scale for determining positions on the x axis
 * @param yScale - the d3 scale for determining positions on the y axis
 * @param getHighestNumber - a function for getting the highest data value for a given point
 * @param distanceBetweenPoints - the distance between rendered data points in pixels
 * @param heightWithoutMargins - the height of the chart excl. margins
 * @returns - an array with the positions and dimensions of the tooltip for every data point
 */
function getTooltipParameters(
  data: BirthsDeathsDatapoint[],
  xScale: d3.AxisScale<number>,
  yScale: d3.AxisScale<number>,
  getHighestNumber: (datapoint: BirthsDeathsDatapoint) => number,
  distanceBetweenPoints: number,
  heightWithoutMargins: number
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
}> {
  const tooltipDimensions = {
    width: 150,
    height: 80,
  };

  return data.map((d) => {
    const params = {
      outerBox: {
        startX: (xScale(d.year) ?? 0) - tooltipDimensions.width / 2,
        startY:
          (yScale(getHighestNumber(d)) ?? 0) - (tooltipDimensions.height + 15),
        width: tooltipDimensions.width,
        height: tooltipDimensions.height,
      },
      innerBox: {
        startX: 2 + (xScale(d.year) ?? 0) - tooltipDimensions.width / 2,
        startY:
          2 +
          (yScale(getHighestNumber(d)) ?? 0) -
          (tooltipDimensions.height + 15),
        width: tooltipDimensions.width - 4,
        height: tooltipDimensions.height - 4,
      },
      showTooltipTriggerArea: {
        startX: (xScale(d.year) ?? 0) - distanceBetweenPoints / 2,
        startY: 0,
        width: distanceBetweenPoints,
        height: heightWithoutMargins,
      },
      hideToolTipTriggerArea: {
        points: [] as string[],
      },
    };

    params.hideToolTipTriggerArea = {
      points: [
        `${params.showTooltipTriggerArea.startX},${Math.min(
          params.showTooltipTriggerArea.startY,
          params.outerBox.startY
        )}`,
        `${params.showTooltipTriggerArea.startX},${params.outerBox.startY}`,
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

        `${
          params.showTooltipTriggerArea.startX +
          params.showTooltipTriggerArea.width
        },${params.outerBox.startY}`,

        `${
          params.showTooltipTriggerArea.startX +
          params.showTooltipTriggerArea.width
        },${Math.min(
          params.showTooltipTriggerArea.startY,
          params.outerBox.startY
        )}`,
      ],
    };
    return params;
  });
}

/**
 * Shows the tooltip for one datapoint and hides any previously displayed tooltips
 *
 * @param id - the id of the active datapoint
 * @param data - the entire dataset
 */
const showTooltip = (id: string, data: BirthsDeathsDatapoint[]): void => {
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
const forceHideTooltips = (data: BirthsDeathsDatapoint[]): void => {
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
 * @param xScale - the d3 scale for determining positions on the x axis
 * @param yScale - the d3 scale for determining positions on the y axis
 * @param heightWithoutMargins - the height of the chart excl. margins
 */
const setupTooltips = (
  data: BirthsDeathsDatapoint[],
  svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
  xScale: d3.AxisScale<number>,
  yScale: d3.AxisScale<number>,
  heightWithoutMargins: number
): void => {
  /**
   * Returns whichever number of births, deaths is higher that year
   *
   * @param datapoint - the datapoint
   * @returns the larger value
   */
  const getHighestNumber = (datapoint: BirthsDeathsDatapoint): number => {
    return Math.max(datapoint.births, datapoint.deaths);
  };

  const numberFormatter = Intl.NumberFormat('en-US');

  // Note: We assume that the time between the data points is the same everywhere (1 year)
  const distanceBetweenPoints =
    (xScale(data[1].year) ?? 0) - (xScale(data[0].year) ?? 0);

  const tooltipParameters = getTooltipParameters(
    data,
    xScale,
    yScale,
    getHighestNumber,
    distanceBetweenPoints,
    heightWithoutMargins
  );

  const svgWithData = svg.selectAll('mybar').data(data);

  const tooltips = svgWithData
    .join('g')
    .attr('id', (d) => `tooltip-${d.id}`)
    .attr('display', 'none');

  // grey background of the selected year slice
  tooltips
    .append('rect')
    .attr('x', (_, i) => tooltipParameters[i].showTooltipTriggerArea.startX)
    .attr('y', (_, i) => tooltipParameters[i].showTooltipTriggerArea.startY)
    .attr('width', (_, i) => tooltipParameters[i].showTooltipTriggerArea.width)
    .attr(
      'height',
      (_, i) => tooltipParameters[i].showTooltipTriggerArea.height
    )
    .style('fill', 'rgba(0,0,0,0.1)');

  // tooltip border
  tooltips
    .append('rect')
    .attr('x', (_, i) => tooltipParameters[i].outerBox.startX)
    .attr('y', (_, i) => tooltipParameters[i].outerBox.startY)
    .attr('width', (_, i) => tooltipParameters[i].outerBox.width)
    .attr('height', (_, i) => tooltipParameters[i].outerBox.height)
    .attr('fill', '#000000');

  // tooltip inner area
  tooltips
    .append('rect')
    .attr('text-anchor', 'middle')
    .attr('x', (_, i) => tooltipParameters[i].innerBox.startX)
    .attr('y', (_, i) => tooltipParameters[i].innerBox.startY)
    .attr('width', (_, i) => tooltipParameters[i].innerBox.width)
    .attr('height', (_, i) => tooltipParameters[i].innerBox.height)
    .attr('fill', '#ffffff');

  // Hidden toooltip text: Datapoint
  tooltips
    .append('text')
    .attr('fill', '#00000000')
    .attr('class', 'screen-reader-only')
    .text('Datapoint.');

  // Tooltip text: age group
  tooltips
    .append('text')
    .attr('fill', '#000000')
    .attr('text-anchor', 'left')
    .text((d) => `Year: ${d.year}`)
    .attr('x', (d) => (xScale(d.year) ?? 0) - 60)
    .attr('y', (d) => (yScale(getHighestNumber(d)) ?? 0) - 70);

  // Tooltip text: births size
  tooltips
    .append('text')
    .attr('fill', '#000000')
    .attr('text-anchor', 'left')
    .text((d) => `Births: ${numberFormatter.format(d.births)}`)
    .attr('x', (d) => (xScale(d.year) ?? 0) - 60)
    .attr('y', (d) => (yScale(getHighestNumber(d)) ?? 0) - 50);

  // Tooltip text: deaths size
  tooltips
    .append('text')
    .attr('fill', '#000000')
    .attr('text-anchor', 'left')
    .text((d) => `Deaths: ${numberFormatter.format(d.deaths)}`)
    .attr('x', (d) => (xScale(d.year) ?? 0) - 60)
    .attr('y', (d) => (yScale(getHighestNumber(d)) ?? 0) - 30);

  // Deaths data circle
  tooltips
    .append('circle')
    .attr('cx', (d) => xScale(d.year) ?? 0)
    .attr('cy', (d) => yScale(d.deaths) ?? 0)
    .attr('r', '3')
    .attr('stroke', 'black')
    .attr('stroke-width', 3)
    .attr('fill', '#fff');

  // Births data circle
  tooltips
    .append('circle')
    .attr('cx', (d) => xScale(d.year) ?? 0)
    .attr('cy', (d) => yScale(d.births) ?? 0)
    .attr('r', '3')
    .attr('stroke', 'black')
    .attr('stroke-width', 3)
    .attr('fill', '#fff');

  // Invisible rectangles: when focused or hovered, tooltip becomes visible
  const focusAreas = svg
    .selectAll('focusArea')
    .data(data)
    .join('rect')
    .attr('x', (_, i) => tooltipParameters[i].showTooltipTriggerArea.startX)
    .attr('y', (_, i) => tooltipParameters[i].showTooltipTriggerArea.startY)
    .attr('width', (_, i) => tooltipParameters[i].showTooltipTriggerArea.width)
    .attr(
      'height',
      (_, i) => tooltipParameters[i].showTooltipTriggerArea.height
    )
    .attr('tabindex', '0')
    .attr('aria-labelledby', (d) => `tooltip-${d.id}`)
    .style('outline', 'none')
    .style('fill', 'rgba(0,0,0,0)');

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

  focusAreas.on('mouseover', (_, d) => {
    showTooltip(d.id, data);
  });

  focusAreas.on('focusin', (_, d) => {
    showTooltip(d.id, data);
  });

  keepShowingTooltipAreas.on('mouseleave', (_, d) => {
    hideTooltip(d.id);
  });

  focusAreas.on('focusout', (_, d) => {
    hideTooltip(d.id);
  });

  document.addEventListener('keyup', (event) => {
    if (event.key === 'Escape') {
      forceHideTooltips(data);
    }
  });
};

export { getTooltipParameters, setupTooltips };
