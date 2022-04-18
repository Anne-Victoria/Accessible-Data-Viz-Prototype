/* global d3  */

const fetchData = async () => {
  const result = await d3.csv('../data/metal_bands_2017.csv', (row, index) => ({
    rank: index + 1,
    name: row.band_name,
    fans: +row.fans,
    formed: +row.formed,
    origin: row.origin,
  }));

  return result;
};

const processData = (data) => {
  let result = data;
  // Group bands with more than one country of origin
  result = result.map((d) => {
    if (d.origin.includes(',') && d.origin !== 'Korea, South') {
      return {
        ...d,
        origin: 'Multiple Countries',
      };
    } else if (d.origin === '') {
      return {
        ...d,
        origin: 'Unknown',
      };
    } else {
      return d;
    }
  });
  return result;
};

export const getProcessedData = async () => {
  let data = await fetchData();
  data = processData(data);
  return data;
};
