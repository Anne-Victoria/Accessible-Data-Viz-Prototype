import * as d3 from 'd3';
import accessData from '../common/accessData';
import rowProcessor from './main';
import { BirthsDeathsDatapoint } from '../common/commonTypes';

const numberFormatter = Intl.NumberFormat('en-US');

/**
 * Renders a table with the given population data
 * @param data - the population data
 */
const drawTable = (data: BirthsDeathsDatapoint[]) => {
  const svg = d3.select('#data-table');
  const rows = svg.selectAll('row').data(data).join('tr');
  rows.append('td').text((d) => d.year);
  rows.append('td').text((d) => numberFormatter.format(d.births));
  rows.append('td').text((d) => numberFormatter.format(d.deaths));
};

const main = async () => {
  const data = (await accessData(
    'birthsDeathsData',
    '/birth_death_rate.csv',
    rowProcessor
  )) as BirthsDeathsDatapoint[];
  drawTable(data);
};

main();
