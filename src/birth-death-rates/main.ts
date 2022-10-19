import * as d3 from 'd3';
import sonifyData from '../common/sonifyData';
import accessData from '../common/accessData';
import { BirthsDeathsDatapoint } from '../common/commonTypes';

const numberFormatter = Intl.NumberFormat('en-US');

/**
 * Creates a bar chart for the given population data
 * @param data - the data with population size per age group
 */
const drawPopulationByYearChart = (data: BirthsDeathsDatapoint[]) => {
  const margin = {
    top: 100,
    right: 50,
    bottom: 100,
    left: 100,
  };

  const totalWidth = 800;
  const totalHeight = 550;
  const width = totalWidth - margin.left - margin.right;
  const height = totalHeight - margin.top - margin.bottom;

  const xDomain = data.map((d) => d.year);

  const xScale = d3.scaleBand().domain(xDomain).range([0, width]).padding(0.2);

  const largestValueInBirths = d3.max(data, (d) => d.births) ?? 0;
  const largestValueInDeaths = d3.max(data, (d) => d.deaths) ?? 0;

  const largestValueAcrossData = Math.max(
    largestValueInBirths,
    largestValueInDeaths
  );

  const yScale = d3
    .scaleLinear()
    .domain([0, largestValueAcrossData])
    .range([height, 0]);

  // Render chart base
  const svg = d3
    .select('#population-chart')
    .append('svg')
    .attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // Render x axis
  svg
    .append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(
      d3.axisBottom(xScale).tickValues(
        xScale.domain().filter((_: any, i) => {
          return i % 5 === 0;
        })
      )
    )
    .selectAll('text')
    .attr('transform', 'translate(-10,0) rotate(-45)')
    .style('text-anchor', 'end');

  // Render x axis label
  svg
    .append('text')
    .attr('text-anchor', 'end')
    .attr('x', width)
    .attr('y', height + margin.bottom - 10)
    .text('Age');

  // Render y axis
  svg
    .append('g')
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
    .attr('text-anchor', 'middle')
    .attr('x', 0)
    .attr('y', -20)
    .text('Population at this age');

  // Render data points
  const line = svg.selectAll('mybar').data(data);

  // Note: something seems to be wrong with the type definitions of d3.line,
  // therefore we need to broaden the type to "Function"
  const d3Line = d3.line as Function;

  // line connecting birth rate dots
  svg
    .append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', 1.5)
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

  // birth rate circles
  const linePoints = line
    .join('circle')
    .attr('cx', (d) => `${xScale(d.year)}`)
    .attr('cy', (d) => yScale(d.births))
    .attr('r', '2')
    .attr('fill', 'black')
    .attr('tabindex', '0')
    /* Each bar has an aria-label for screen readers */
    .attr('aria-labelledby', (d) => `tooltip-${d.id}`);

  // death rate line
  svg
    .append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'red')
    .attr('stroke-width', '1.5')
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

  // death rate circles
  line
    .join('circle')
    .attr('cx', (d) => `${xScale(d.year)}`)
    .attr('cy', (d) => yScale(d.deaths))
    .attr('r', '2')
    .attr('fill', 'red')
    .attr('tabindex', '0')
    /* Each bar has an aria-label for screen readers */
    .attr('aria-labelledby', (d) => `tooltip-${d.id}`);

  // vertical line from bottom to point
  line
    .join('line')
    .attr('x1', (d) => xScale(d.year) ?? 0)
    .attr('y1', totalHeight - margin.bottom - margin.top)
    .attr('x2', (d) => xScale(d.year) ?? 0)
    .attr('y2', (d) => yScale(Math.max(d.births, d.deaths)))
    .attr('stroke-width', '1')
    .attr('stroke', '#000000')
    .attr('id', (d) => `line-${d.id}`);

  linePoints.on('mouseover', (_, d) => {
    const tooltip = d3.select(`#tooltip-${d.id}`);
    tooltip.attr('display', 'block');
  });

  linePoints.on('focusin', (_, d) => {
    const tooltip = d3.select(`#tooltip-${d.id}`);
    tooltip.attr('display', 'block');
  });

  linePoints.on('mouseleave', (_, d) => {
    const tooltip = d3.select(`#tooltip-${d.id}`);
    tooltip.attr('display', 'none');
  });

  linePoints.on('focusout', (_, d) => {
    const tooltip = d3.select(`#tooltip-${d.id}`);
    tooltip.attr('display', 'none');
  });

  const tooltips = line
    .join('g')
    .attr('id', (d) => `tooltip-${d.id}`)
    .attr('display', 'none');

  const tooltipDimensions = {
    width: 100,
    height: 60,
  };

  const halfBarWidth = xScale.bandwidth() / 2;

  // tooltip background
  tooltips
    .append('rect')
    .attr('text-anchor', 'middle')
    .attr(
      'x',
      (d) => (xScale(d.year) ?? 0) + halfBarWidth - tooltipDimensions.width / 2
    )
    .attr('y', (d) => yScale(d.births) - (tooltipDimensions.height + 15))
    .attr('width', tooltipDimensions.width)
    .attr('height', tooltipDimensions.height)
    .attr('fill', '#ffffff');

  // Top border of tooltip
  tooltips
    .append('line')
    .attr(
      'x1',
      (d) => (xScale(d.year) ?? 0) + halfBarWidth - tooltipDimensions.width / 2
    )
    .attr('y1', (d) => yScale(d.births) - (tooltipDimensions.height + 15))
    .attr(
      'x2',
      (d) => (xScale(d.year) ?? 0) + halfBarWidth + tooltipDimensions.width / 2
    )
    .attr('y2', (d) => yScale(d.births) - (tooltipDimensions.height + 15))
    .attr('stroke-width', '2')
    .attr('stroke', '#000000');

  // Right border of tooltip
  tooltips
    .append('line')
    .attr(
      'x1',
      (d) => (xScale(d.year) ?? 0) + halfBarWidth + tooltipDimensions.width / 2
    )
    .attr('y1', (d) => yScale(d.births) - (tooltipDimensions.height + 15))
    .attr(
      'x2',
      (d) => (xScale(d.year) ?? 0) + halfBarWidth + tooltipDimensions.width / 2
    )
    .attr('y2', (d) => yScale(d.births) - 15)
    .attr('stroke-width', '2')
    .attr('stroke', '#000000');

  // Bottom border of tooltip
  tooltips
    .append('line')
    .attr(
      'x1',
      (d) => (xScale(d.year) ?? 0) + halfBarWidth - tooltipDimensions.width / 2
    )
    .attr('y1', (d) => yScale(d.births) - 15)
    .attr(
      'x2',
      (d) => (xScale(d.year) ?? 0) + halfBarWidth + tooltipDimensions.width / 2
    )
    .attr('y2', (d) => yScale(d.births) - 15)
    .attr('stroke-width', '2')
    .attr('stroke', '#000000');

  // Left border of tooltip
  tooltips
    .append('line')
    .attr(
      'x1',
      (d) => (xScale(d.year) ?? 0) + halfBarWidth - tooltipDimensions.width / 2
    )
    .attr('y1', (d) => yScale(d.births) - (tooltipDimensions.height + 15))
    .attr(
      'x2',
      (d) => (xScale(d.year) ?? 0) + halfBarWidth - tooltipDimensions.width / 2
    )
    .attr('y2', (d) => yScale(d.births) - 15)
    .attr('stroke-width', '2')
    .attr('stroke', '#000000');

  // Connection between bar and tooltip
  tooltips
    .append('line')
    .attr('x1', (d) => (xScale(d.year) ?? 0) + halfBarWidth)
    .attr('y1', (d) => yScale(d.births) - 15)
    .attr('x2', (d) => (xScale(d.year) ?? 0) + halfBarWidth)
    .attr('y2', (d) => yScale(d.births))
    .attr('stroke-width', '1')
    .attr('stroke', '#000000');

  // Tooltip text: age group
  tooltips
    .append('text')
    .attr('fill', '#000000')
    .attr('text-anchor', 'middle')
    .text((d) => d.year)
    .attr('x', (d) => xScale(d.year) ?? 0)
    .attr('y', (d) => yScale(d.births) - 50);

  // Tooltip text: population size
  tooltips
    .append('text')
    .attr('fill', '#000000')
    .attr('text-anchor', 'middle')
    .text((d) => numberFormatter.format(d.births))
    .attr('x', (d) => xScale(d.year) ?? 0)
    .attr('y', (d) => yScale(d.births) - 30);
};

const rowProcessor = (row: any): BirthsDeathsDatapoint => ({
  id: row.id ?? '',
  year: row.year ?? '',
  births: row.births ? +row.births : -1,
  deaths: row.deaths ? +row.deaths : -1,
});

/**
 * Sets up the d3 visualization and the sonification
 */
const main = async () => {
  const data = (await accessData(
    'birthsDeathsData',
    '/birth_death_rate.csv',
    rowProcessor
  )) as BirthsDeathsDatapoint[];

  drawPopulationByYearChart(data);
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
