import * as d3 from 'd3';
import accessData from '../common/accessData';
import rowProcessor from './main';
import { AgeDatapoint } from '../common/commonTypes';

const numberFormatter = Intl.NumberFormat('de-DE');

/**
 * Renders a table with the given population data
 *
 * @param data - the population data
 */
const drawTable = (data: AgeDatapoint[]): void => {
  const svg = d3.select('#data-table');
  const rows = svg.selectAll('row').data(data).join('tr');
  rows.append('td').text((d) => d.age_group);
  rows.append('td').text((d) => numberFormatter.format(d.population_size));
};

/**
 * Fetches the data and renders it into the table
 */
const main = async (): Promise<void> => {
  const data = (await accessData(
    'populationByAgeData',
    '/population_by_age.csv',
    rowProcessor
  )) as AgeDatapoint[];
  drawTable(data);
};

main();
