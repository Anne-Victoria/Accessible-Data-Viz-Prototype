/* global d3  */
console.log(d3);

const fetchData = async () => {
  const result = await d3.csv('data/metal_bands_2017.csv', (row, index) => ({
    rank: index + 1,
    name: row.band_name,
    fans: +row.fans,
    formed: +row.formed,
    origin: row.origin,
  }));
  // let bandsByCounty = d3.group(result, (d) => d.origin);

  console.log(result);
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
    } else {
      return d;
    }
  });
  return result;
};

const drawScatterplot = (data) => {
  const marginWidth = 50;
  const width = 800 - 2 * marginWidth;
  const height = 500 - 2 * marginWidth;

  const maxFans = d3.max(data, (d) => d.fans);
  const yearExtent = d3.extent(data, (d) => d.formed);

  const svg = d3
    .select('#bands-scatterplot')
    .append('svg')
    .attr('width', width + 2 * marginWidth)
    .attr('height', height + 2 * marginWidth)
    .append('g')
    .attr('transform', `translate(${marginWidth}, ${marginWidth})`);

  const scaleX = d3.scaleLinear().domain(yearExtent).range([0, width]);

  svg
    .append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(scaleX));

  const scaleY = d3.scaleLinear().domain([0, maxFans]).range([height, 0]);

  svg.append('g').call(d3.axisLeft(scaleY));

  const tooltip = d3
    .select('#bands-scatterplot')
    .append('div')
    .attr('class', 'tooltip');

  const mouseover = (event, d) => {
    tooltip.style('display', 'block');
  };

  const mousemove = (event, d) => {
    tooltip
      .text(d.name)
      .style('left', `${event.x + 5}px`)
      .style('top', `${event.y}px`);
  };

  const mouseleave = (event, d) => {
    tooltip.transition().duration(200).style('display', 'none');
  };

  svg
    .append('g')
    .selectAll('dot')
    .data(data)
    .join('circle')
    .attr('cx', (d) => scaleX(d.formed))
    .attr('cy', (d) => scaleY(d.fans))
    .attr('r', 3)
    .style('fill', 'salmon')
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseleave', mouseleave);
};

const init = async () => {
  const data = await fetchData();

  const multiCountryBands = data.filter((d) => d.origin.includes(','));
  console.table(multiCountryBands);
  drawScatterplot(data);
};

init();
