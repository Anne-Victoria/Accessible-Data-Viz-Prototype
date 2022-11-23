import * as d3 from 'd3';
import sonifyData from '../common/sonifyData';
import accessData from '../common/accessData';
import { AgeDatapoint } from '../common/commonTypes';
import setUpZooming from '../common/zoom';
import setupChart from './chart';
import { setupTooltips } from './tooltips';

/**
 * Creates a bar chart for the given population data
 *
 * @param data - the data with population size per age group
 */
const drawPopulationByAgeChart = (data: AgeDatapoint[]): void => {
  const margins = {
    top: 100,
    right: 50,
    bottom: 100,
    left: 100,
  };

  const totalWidth = 800;
  const totalHeight = 550;
  const widthWithoutMargins = totalWidth - margins.left - margins.right;
  const heightWithoutMargins = totalHeight - margins.top - margins.bottom;

  const xDomain = data.map((d) => d.age_group);

  const xScale = d3
    .scaleBand()
    .domain(xDomain)
    .range([0, widthWithoutMargins])
    .padding(0.2);

  const largestValueInData = d3.max(data, (d) => d.population_size) ?? 0;

  const yScale = d3
    .scaleLinear()
    .domain([0, largestValueInData * 1.1])
    .range([heightWithoutMargins, 0]);

  const { svg, bars, rectangles } = setupChart(
    data,
    xScale,
    yScale,
    totalWidth,
    totalHeight,
    widthWithoutMargins,
    heightWithoutMargins,
    margins
  );

  setupTooltips(
    data,
    svg,
    rectangles,
    bars,
    xScale,
    yScale,
    heightWithoutMargins
  );
};

/**
 * Creates an array of AgeDatapoint objects from the data read by d3
 *
 * @param row - A data entry read from the CSV by d3
 * @returns The created AgeDatapoint
 */
const rowProcessor = (row: any): AgeDatapoint => ({
  id: row.id ?? '',
  age_group: row.age_group ?? '',
  population_size: row.population_size ? +row.population_size : -1,
});

/**
 * Sets up the d3 visualization and the sonification
 */
const main = async (): Promise<void> => {
  const data = (await accessData(
    'populationByAgeData',
    '/population_by_age.csv',
    rowProcessor
  )) as AgeDatapoint[];

  drawPopulationByAgeChart(data);
  const dataForSonification = data.map((entry) => entry.population_size);

  const smallestValue = Math.min(...dataForSonification);
  const largestValue = Math.max(...dataForSonification);

  const toneScale = d3
    .scaleLinear()
    .domain([smallestValue, largestValue])
    .range([200, 1000]);

  const handlePlayPauseButtonClicked = sonifyData(
    dataForSonification,
    null,
    'play-pause-population-sonification',
    toneScale
  );
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
