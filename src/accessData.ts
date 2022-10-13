import * as d3 from 'd3';
import { Datapoint } from './commonTypes';

/**
 * Fetches the population data set and parses it into a JS array
 * @returns A promise that resolves to an array with all data points
 */
const fetchPopulationByAgeData = async (): Promise<Datapoint[]> => {
  const data = await d3.csv('/population_by_age.csv', (row) => ({
    id: row.id ?? '',
    age_group: row.age_group ?? '',
    population_size: row.population_size ? +row.population_size : -1,
  }));
  sessionStorage.setItem('populationByAge', JSON.stringify(data));
  return data;
};

/**
 * Get the population by age dataset from session storage
 * @returns the data in an array
 */
const readPopulationByAgeFromStorage = (): Datapoint[] => {
  const sessionStorageContent = sessionStorage.getItem('populationByAge');
  let data = [];
  try {
    data = JSON.parse(sessionStorageContent ?? '');
  } catch {
    // eslint-disable-next-line no-console
    console.error(
      `Failed to parse data from local storage: ${sessionStorageContent}`
    );
  }
  return data;
};

/**
 * Reads the population by age dataset from session storage or if needed
 * fetches and parses it
 * @returns the dataset
 */
export default async (): Promise<Datapoint[]> => {
  let data = readPopulationByAgeFromStorage();
  if (data.length > 0) {
    return data;
  }
  data = await fetchPopulationByAgeData();
  if (data.length > 0) {
    return data;
  }
  return [];
};
