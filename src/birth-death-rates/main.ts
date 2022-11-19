import * as d3 from 'd3';
import sonifyData from '../common/sonifyData';
import accessData from '../common/accessData';
import setUpZooming from '../common/zoom';
import setupChart from './chart';
import { setupTooltips } from './tooltips';
import { BirthsDeathsDatapoint } from '../common/commonTypes';

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
  const widthWithoutMargins = totalWidth - margin.left - margin.right;
  const heightWithoutMargins = totalHeight - margin.top - margin.bottom;

  const xDomain = [data[0].year, data[data.length - 1].year];

  const xScale = d3
    .scaleLinear()
    .domain(xDomain)
    .range([0, widthWithoutMargins]);

  const largestValueInBirths = d3.max(data, (d) => d.births) ?? 0;
  const largestValueInDeaths = d3.max(data, (d) => d.deaths) ?? 0;

  const largestValueAcrossData = Math.max(
    largestValueInBirths,
    largestValueInDeaths
  );

  const yScale = d3
    .scaleLinear()
    // Allow for a bit of white space above the largest value
    .domain([0, largestValueAcrossData * 1.1])
    .range([heightWithoutMargins, 0]);

  // Render chart base
  const svg = d3
    .select(`#${vizElement}`)
    .append('svg')
    .attr('id', 'vizRoot')
    .attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  setupChart(
    data,
    svg,
    xScale,
    yScale,
    heightWithoutMargins,
    widthWithoutMargins,
    margin.bottom
  );
  setupTooltips(data, svg, xScale, yScale, heightWithoutMargins);
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

  setUpZooming();
};

main();

export default rowProcessor;
