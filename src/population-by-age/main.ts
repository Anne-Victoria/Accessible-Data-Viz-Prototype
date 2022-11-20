import * as d3 from 'd3';
import sonifyData from '../common/sonifyData';
import accessData from '../common/accessData';
import { AgeDatapoint } from '../common/commonTypes';
import setUpZooming from '../common/zoom';
import setupChart from './chart';
import { setupTooltips } from './tooltips';

/**
 * Creates a bar chart for the given population data
 * @param data - the data with population size per age group
 */
const drawPopulationByAgeChart = (data: AgeDatapoint[]) => {
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

  const { bars, rectangles } = setupChart(
    data,
    xScale,
    yScale,
    totalWidth,
    totalHeight,
    widthWithoutMargins,
    heightWithoutMargins,
    margins
  );

  setupTooltips(data, rectangles, bars, xScale, yScale);
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
