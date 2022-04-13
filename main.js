/* global d3  */

const fetchData = async () => {
  const result = await d3.csv('data/metal_bands_2017.csv', (row, index) => ({
    rank: index + 1,
    name: row.band_name,
    fans: +row.fans,
    formed: +row.formed,
    origin: row.origin,
  }));
  // let bandsByCounty = d3.group(result, (d) => d.origin);

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

const calculateTotalNumberOfFansByCountry = (data) => {
  let result = data;
  result = d3.rollups(
    result,
    (v) => d3.sum(v, (d) => d.fans),
    (d) => d.origin
  );
  result.sort((a, b) => a[1] < b[1]);
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

const drawCountryBarChart = (data) => {
  const margin = {
    top: 50,
    right: 50,
    bottom: 100,
    left: 100,
  };

  const totalWidth = 800;
  const totalHeight = 500;
  const width = totalWidth - margin.left - margin.right;
  const height = totalHeight - margin.top - margin.bottom;

  const xDomain = data.map((d) => d[0]);

  const svg = d3
    .select('#countries-barchart')
    .append('svg')
    .attr('width', totalWidth)
    .attr('height', totalHeight)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const xScale = d3.scaleBand().domain(xDomain).range([0, width]).padding(0.2);

  svg
    .append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll('text')
    .attr('transform', 'translate(-10,0) rotate(-45)')
    .style('text-anchor', 'end');

  svg
    .append('text')
    .attr('text-anchor', 'end')
    .attr('x', width)
    .attr('y', height + margin.bottom - 10)
    .text('Country');

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d[1])])
    .range([height, 0]);

  svg.append('g').call(d3.axisLeft(yScale));

  svg
    .append('text')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-90)')
    .attr('x', 0)
    .attr('y', -0.5 * margin.left)
    .text('Total number of fans');

  svg
    .selectAll('mybar')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', (d) => xScale(d[0]))
    .attr('y', (d) => yScale(d[1]))
    .attr('width', xScale.bandwidth())
    .attr('height', (d) => height - yScale(d[1]))
    .attr('fill', 'salmon');
};

const init = async () => {
  let data = await fetchData();
  data = processData(data);
  drawScatterplot(data);
  const totalNumberOfFansByCountry = calculateTotalNumberOfFansByCountry(data);
  drawCountryBarChart(totalNumberOfFansByCountry.slice(0, 29));
};

init();
