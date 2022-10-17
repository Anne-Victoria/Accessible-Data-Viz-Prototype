import { YearDatapoint } from '../common/commonTypes';

const rowProcessor = (row: any): YearDatapoint => ({
  id: row.id ?? '',
  year: row.year ?? '',
  population_size: row.population_size ? +row.population_size : -1,
});

export default rowProcessor;
