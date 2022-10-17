import * as d3 from 'd3';
import accessData from '../common/accessData';
import rowProcessor from './main';
import { AgeDatapoint } from '../common/commonTypes';

const numberFormatter = Intl.NumberFormat('en-US');

/**
 * Renders a table with the given population data
 * @param data - the population data
 */
const drawTable = (data: AgeDatapoint[]) => {
  const svg = d3.select('#population-table');
  const rows = svg.selectAll('row').data(data).join('tr');
  rows.append('td').text((d) => d.age_group);
  rows.append('td').text((d) => numberFormatter.format(d.population_size));
};

const main = async () => {
  const data = (await accessData(
    'populationByAgeData',
    '/population_by_age.csv',
    rowProcessor
  )) as AgeDatapoint[];
  drawTable(data);
};

main();
