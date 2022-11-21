import * as d3 from 'd3';
import { DatapointArray, ToDatapoint } from './commonTypes';
/**
 * Fetches the population data set and parses it into a JS array
 *
 * @param name - the name of the data set, used as identifier in local storage
 * @param url - the URL to fetch the data set from
 * @param rowProcessor - a function that transforms an entry into a data point object
 * @returns A promise that resolves to an array with all data points
 */
const fetchData = async (
  name: string,
  url: string,
  rowProcessor: ToDatapoint
): Promise<DatapointArray> => {
  const response = await d3.csv(url);
  const data = response.map((row) => rowProcessor(row)) as DatapointArray;
  sessionStorage.setItem(name, JSON.stringify(data));
  return data;
};

/**
 * Get the population by age dataset from session storage
 *
 * @param name - the name by which the data set is stored in local storage
 * @returns the data in an array
 */
const readPopulationByAgeFromStorage = (name: string): DatapointArray => {
  const sessionStorageContent = sessionStorage.getItem(name);
  let data = [];
  if (sessionStorageContent !== '') {
    try {
      data = JSON.parse(sessionStorageContent ?? '');
    } catch {
      // eslint-disable-next-line no-console
      console.error(
        `Failed to parse data "${name}" from local storage: ${sessionStorageContent}`
      );
    }
  }
  return data;
};

/**
 * Reads the population by age dataset from session storage or if needed
 * fetches and parses it
 *
 * @param name - the name of the data set, used for managing it in local storage
 * @param url - the URL the data set can be fetched from
 * @param rowProcessor - a function that transforms an entry into a data point object
 * @returns the dataset as array of data points
 */
const accessData = async (
  name: string,
  url: string,
  rowProcessor: ToDatapoint
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
