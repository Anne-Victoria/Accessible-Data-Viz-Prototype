import * as d3 from 'd3';
import { DatapointArray, ToAgeDatapoint, ToYearDatapoint } from './commonTypes';
/**
 * Fetches the population data set and parses it into a JS array
 * @returns A promise that resolves to an array with all data points
 */
const fetchData = async (
  name: string,
  url: string,
  rowProcessor: ToAgeDatapoint | ToYearDatapoint
): Promise<DatapointArray> => {
  const response = await d3.csv(url);
  const data = response.map((row) => rowProcessor(row)) as DatapointArray;
  sessionStorage.setItem(name, JSON.stringify(data));
  return data;
};

/**
 * Get the population by age dataset from session storage
 * @returns the data in an array
 */
const readPopulationByAgeFromStorage = (name: string): DatapointArray => {
  const sessionStorageContent = sessionStorage.getItem(name);
  let data = [];
  try {
    data = JSON.parse(sessionStorageContent ?? '');
  } catch {
    // eslint-disable-next-line no-console
    console.error(
      `Failed to parse data "${name}" from local storage: ${sessionStorageContent}`
    );
  }
  return data;
};

/**
 * Reads the population by age dataset from session storage or if needed
 * fetches and parses it
 * @returns the dataset
 */
const accessData = async (
  name: string,
  url: string,
  rowProcessor: ToAgeDatapoint | ToYearDatapoint
): Promise<DatapointArray> => {
  let data: DatapointArray = readPopulationByAgeFromStorage(name);
  if (data.length > 0) {
    return data;
  }
  data = await fetchData(name, url, rowProcessor);
  if (data.length > 0) {
    return data;
  }
  return [];
};

export default accessData;
