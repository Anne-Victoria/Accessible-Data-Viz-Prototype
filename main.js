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
  const margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 100,
  };

  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const maxFans = d3.max(data, (d) => d.fans);
  const yearExtent = d3.extent(data, (d) => d.formed);

  const svg = d3
    .select('#bands-scatterplot')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const scaleX = d3.scaleLinear().domain(yearExtent).range([0, width]);

  svg
    .append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(scaleX));

  svg
    .append('text')
    .attr('text-anchor', 'end')
    .attr('x', width)
    .attr('y', height + margin.top * 0.8)
    .text('Founding year');

  const scaleY = d3.scaleLinear().domain([0, maxFans]).range([height, 0]);

  svg.append('g').call(d3.axisLeft(scaleY));

  svg
    .append('text')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-90)')
    .attr('x', 0)
    .attr('y', -0.5 * margin.left)
    .text('Number of fans');

  const tooltip = d3
    .select('#bands-scatterplot')
    .append('div')
    .attr('class', 'tooltip');

  const mouseover = () => {
    tooltip.style('display', 'block');
  };

  const mousemove = (event, d) => {
    tooltip
      .text(d.name)
      .style('left', `${event.x + 5}px`)
      .style('top', `${event.y}px`);
  };

  const mouseleave = () => {
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
