import * as d3 from 'd3';
import sonifyData from '../common/sonifyData';
import accessData from '../common/accessData';
import { AgeDatapoint } from '../common/commonTypes';
import setUpZooming from '../common/zoom';

const numberFormatter = Intl.NumberFormat('en-US');

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

/**
 * Creates a bar chart for the given population data
 * @param data - the data with population size per age group
 */
const drawPopulationByAgeChart = (data: AgeDatapoint[]) => {
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

  const tooltipDimensions = {
    width: 200,
    height: 60,
  };

  const xDomain = data.map((d) => d.age_group);

  const xScale = d3.scaleBand().domain(xDomain).range([0, width]).padding(0.2);

  const largestValueInData = d3.max(data, (d) => d.population_size) ?? 0;

  const yScale = d3
    .scaleLinear()
    .domain([0, largestValueInData * 1.1])
    .range([height, 0]);

  // Render chart base
  const svg = d3
    .select('#population-chart')
    .append('svg')
    .attr('id', 'vizRoot')
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
    .call(d3.axisBottom(xScale))
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
    .attr('text-anchor', 'middle')
    .attr('x', 0)
    .attr('y', -20)
    .text('Population at this age');

  // Render bars
  const bars = svg.selectAll('mybar').data(data);

  const rectangles = bars
    .join('rect')
    .attr('x', (d) => `${xScale(d.age_group)}`)
    .attr('y', (d) => yScale(d.population_size))
    .attr('width', xScale.bandwidth())
    .attr('height', (d) => height - yScale(d.population_size))
    .attr('fill', '#004747')
    .attr('tabindex', '0')
    /* Each bar has an aria-label for screen readers */
    .attr('aria-labelledby', (d) => `tooltip-${d.id}`);

  rectangles.on('mouseover', (_, d) => {
    showTooltip(d.id, data);
  });

  rectangles.on('focusin', (_, d) => {
    showTooltip(d.id, data);
  });

  rectangles.on('mouseleave', (_, d) => {
    const tooltip = d3.select(`#tooltip-${d.id}`);
    tooltip.attr('display', 'none');
  });

  rectangles.on('focusout', (_, d) => {
    const tooltip = d3.select(`#tooltip-${d.id}`);
    tooltip.attr('display', 'none');
  });

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
      (d) => yScale(d.population_size) - (tooltipDimensions.height + 15)
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
      (d) => 2 + yScale(d.population_size) - (tooltipDimensions.height + 15)
    )
    .attr('width', tooltipDimensions.width - 4)
    .attr('height', tooltipDimensions.height - 4)
    .attr('fill', '#ffffff');

  // Connection between bar and tooltip
  tooltips
    .append('line')
    .attr('x1', (d) => (xScale(d.age_group) ?? 0) + halfBarWidth)
    .attr('y1', (d) => yScale(d.population_size) - 15)
    .attr('x2', (d) => (xScale(d.age_group) ?? 0) + halfBarWidth)
    .attr('y2', (d) => yScale(d.population_size))
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
    .attr('y', (d) => yScale(d.population_size) - 50);

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
    .attr('y', (d) => yScale(d.population_size) - 30);
};

const rowProcessor = (row: any): AgeDatapoint => ({
  id: row.id ?? '',
  age_group: row.age_group ?? '',
  population_size: row.population_size ? +row.population_size : -1,
});

/**
 * Sets up the d3 visualization and the sonification
 */
const main = async () => {
  const data = (await accessData(
    'populationByAgeData',
    '/population_by_age.csv',
    rowProcessor
  )) as AgeDatapoint[];

  drawPopulationByAgeChart(data);
  const dataForSonification = data.map((entry) => entry.population_size);

  const handlePlayPauseButtonClicked = sonifyData(dataForSonification);
  const playPauseButton = document.getElementById(
    'play-pause-population-sonification'
  );
  if (playPauseButton) {
    playPauseButton.addEventListener('click', handlePlayPauseButtonClicked);
  }
  setUpZooming();
};

main();

export default rowProcessor;
