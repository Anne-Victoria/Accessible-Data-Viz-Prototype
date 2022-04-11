/* global d3  */
console.log(d3);

const fetchData = async () => {
  const result = await d3.csv('data/metal_bands_2017.csv', (row, index) => ({
    rank: index + 1,
    name: row.band_name,
    fans: row.fans,
    formed: row.formed,
    origin: row.origin,
  }));
  let bandsByCounty = d3.group(result, (d) => d.origin);

  console.log(bandsByCounty);
  return bandsByCounty;
};

fetchData();
