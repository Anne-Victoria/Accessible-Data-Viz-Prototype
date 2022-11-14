import * as d3 from 'd3';
import sonifyData from '../common/sonifyData';
import accessData from '../common/accessData';
import { BirthsDeathsDatapoint } from '../common/commonTypes';

const numberFormatter = Intl.NumberFormat('en-US');

/**
 * Returns whichever number of births, deaths is higher that year
 * @param datapoint - the datapoint
 * @returns the larger value
 */
const getHighestNumber = (datapoint: BirthsDeathsDatapoint): number => {
  return Math.max(datapoint.births, datapoint.deaths);
};

const showTooltip = (id: string, data: BirthsDeathsDatapoint[]) => {
  data.forEach((datapoint) => {
    const tooltip = d3.select(`#tooltip-${datapoint.id}`);
    if (datapoint.id === id) {
      tooltip.attr('display', 'block');
    } else {
      tooltip.attr('display', 'none');
    }
  });
};

/**
 * Creates a bar chart for the given population data
 * @param data - the data with population size per age group
 * @param vizElement - the id of the DOM element to render the viz to
 */
const drawBirthDeathRateViz = (
  data: BirthsDeathsDatapoint[],
  vizElement: string
) => {
  const margin = {
    top: 100,
    right: 100,
    bottom: 100,
    left: 100,
  };

  const totalWidth = 800;
  const totalHeight = 550;
  const width = totalWidth - margin.left - margin.right;
  const height = totalHeight - margin.top - margin.bottom;

  const tooltipDimensions = {
    width: 150,
    height: 80,
  };

  const xDomain = [data[0].year, data[data.length - 1].year];

  const xScale = d3.scaleLinear().domain(xDomain).range([0, width]);

  // Note: We assume that the time between the data points is the same everywhere (1 year)
  const distanceBetweenPoints = xScale(data[1].year) - xScale(data[0].year);

  const largestValueInBirths = d3.max(data, (d) => d.births) ?? 0;
  const largestValueInDeaths = d3.max(data, (d) => d.deaths) ?? 0;

  const largestValueAcrossData = Math.max(
    largestValueInBirths,
    largestValueInDeaths
  );

  const yScale = d3
    .scaleLinear()
    .domain([0, largestValueAcrossData * 1.1])
    .range([height, 0]);

  // Render chart base
  const svg = d3
    .select(`#${vizElement}`)
    .append('svg')
    .attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // White chart background
  svg
    .append('rect')
    .attr('x', '0 ')
    .attr('y', '0')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', '#ffffff');

  // Render x axis
  svg
    .append('g')
    .attr('aria-hidden', 'true')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScale).tickFormat((tick) => `${tick}`))
    .selectAll('text')
    .attr('transform', 'translate(-10,0) rotate(-45)')
    .style('text-anchor', 'end');

  // Render x axis label
  svg
    .append('text')
    .attr('text-anchor', 'end')
    .attr('x', width)
    .attr('y', height + margin.bottom - 10)
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
        .attr('x2', width)
        .attr('stroke-opacity', 0.1)
    );

  //   Render y axis label
  svg
    .append('text')
    .attr('text-anchor', 'left')
    .attr('x', '-80')
    .attr('y', '-20')
    .attr('class', 'axis-label')
    .text('Number of births and deaths');

  // Render data points
  const svgWithData = svg.selectAll('mybar').data(data);

  // Note: something seems to be wrong with the type definitions of d3.line,
  // therefore we need to broaden the type to "Function"
  const d3Line = d3.line as Function;

  // line connecting birth rate dots
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

  // Births line label
  svg
    .append('text')
    .attr('fill', '#000000')
    .attr('text-anchor', 'left')
    .text('Births')
    .attr('aria-hidden', 'true')
    .attr('x', xScale(data[data.length - 1].year) + 10)
    .attr('y', yScale(data[data.length - 1].births));

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

  // Deaths line label
  svg
    .append('text')
    .attr('fill', '#000000')
    .attr('text-anchor', 'left')
    .text('Deaths')
    .attr('aria-hidden', 'true')
    .attr('x', xScale(data[data.length - 1].year) + 10)
    .attr('y', yScale(data[data.length - 1].deaths));

  const tooltips = svgWithData
    .join('g')
    .attr('id', (d) => `tooltip-${d.id}`)
    .attr('display', 'none');

  // grey background of the selected year slice
  tooltips
    .append('rect')
    .attr('x', (d) => xScale(d.year) - distanceBetweenPoints / 2)
    .attr('y', '0')
    .attr('width', distanceBetweenPoints)
    .attr('height', height)
    .style('fill', 'rgba(0,0,0,0.1)');

  // tooltip border
  tooltips
    .append('rect')
    .attr('x', (d) => (xScale(d.year) ?? 0) - tooltipDimensions.width / 2)
    .attr(
      'y',
      (d) => yScale(getHighestNumber(d)) - (tooltipDimensions.height + 15)
    )
    .attr('width', tooltipDimensions.width)
    .attr('height', tooltipDimensions.height)
    .attr('fill', '#000000');

  // tooltip background
  tooltips
    .append('rect')
    .attr('text-anchor', 'middle')
    .attr('x', (d) => 2 + (xScale(d.year) ?? 0) - tooltipDimensions.width / 2)
    .attr(
      'y',
      (d) => 2 + yScale(getHighestNumber(d)) - (tooltipDimensions.height + 15)
    )
    .attr('width', tooltipDimensions.width - 4)
    .attr('height', tooltipDimensions.height - 4)
    .attr('fill', '#ffffff');

  // Tooltip text: age group
  tooltips
    .append('text')
    .attr('fill', '#000000')
    .attr('text-anchor', 'left')
    .text((d) => `Year: ${d.year}`)
    .attr('x', (d) => xScale(d.year) - 60)
    .attr('y', (d) => yScale(getHighestNumber(d)) - 70);

  // Tooltip text: births size
  tooltips
    .append('text')
    .attr('fill', '#000000')
    .attr('text-anchor', 'left')
    .text((d) => `Births: ${numberFormatter.format(d.births)}`)
    .attr('x', (d) => xScale(d.year) - 60)
    .attr('y', (d) => yScale(getHighestNumber(d)) - 50);

  // Tooltip text: deaths size
  tooltips
    .append('text')
    .attr('fill', '#000000')
    .attr('text-anchor', 'left')
    .text((d) => `Deaths: ${numberFormatter.format(d.deaths)}`)
    .attr('x', (d) => xScale(d.year) - 60)
    .attr('y', (d) => yScale(getHighestNumber(d)) - 30);

  // Deaths data circle
  tooltips
    .append('circle')
    .attr('cx', (d) => xScale(d.year))
    .attr('cy', (d) => yScale(d.deaths))
    .attr('r', '3')
    .attr('stroke', 'black')
    .attr('stroke-width', 3)
    .attr('fill', '#fff');

  // Births data circle
  tooltips
    .append('circle')
    .attr('cx', (d) => xScale(d.year))
    .attr('cy', (d) => yScale(d.births))
    .attr('r', '3')
    .attr('stroke', 'black')
    .attr('stroke-width', 3)
    .attr('fill', '#fff');

  // Invisible rectangles: when focused or hovered, tooltip becomes visible
  const focusArea = svg
    .selectAll('focusArea')
    .data(data)
    .join('rect')
    .attr('x', (d) => xScale(d.year) - distanceBetweenPoints / 2)
    .attr('y', '0')
    .attr('width', distanceBetweenPoints)
    .attr('height', height)
    .attr('tabindex', '0')
    .attr('aria-labelledby', (d) => `tooltip-${d.id}`)
    .style('outline', 'none')
    .style('fill', 'rgba(0,0,0,0)');

  focusArea.on('mouseover', (_, d) => {
    showTooltip(d.id, data);
  });

  focusArea.on('focusin', (_, d) => {
    showTooltip(d.id, data);
  });

  focusArea.on('mouseleave', (_, d) => {
    const tooltip = d3.select(`#tooltip-${d.id}`);
    tooltip.attr('display', 'none');
  });

  focusArea.on('focusout', (_, d) => {
    const tooltip = d3.select(`#tooltip-${d.id}`);
    tooltip.attr('display', 'none');
  });
};

/**
 * Creates an array of BirthsDeathsDatapoint objects from the data read by d3
 * @param row - A data entry read from the CSV by d3
 * @returns The array of parsed data
 */
const rowProcessor = (row: any): BirthsDeathsDatapoint => ({
  id: row.id ?? '',
  year: row.year ? parseInt(row.year, 10) : -1,
  births: row.births ? +row.births : -1,
  deaths: row.deaths ? +row.deaths : -1,
});

/**
 * Sets up the d3 visualization and the sonification
 */
const main = async () => {
  const vizElement = 'births-deaths-viz';

  const data = (await accessData(
    'birthsDeathsData',
    '/birth_death_rate.csv',
    rowProcessor
  )) as BirthsDeathsDatapoint[];

  drawBirthDeathRateViz(data, vizElement);

  const dataForSonification = data.map((entry) => entry.births);

  const handlePlayPauseButtonClicked = sonifyData(dataForSonification);
  const playPauseButton = document.getElementById(
    'play-pause-population-sonification'
  );
  if (playPauseButton) {
    playPauseButton.addEventListener('click', handlePlayPauseButtonClicked);
  }
};

main();

export default rowProcessor;
