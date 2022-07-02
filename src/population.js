/* global d3 */
import sonifyData from './sonifyData.mjs';

const numberFormatter = Intl.NumberFormat('en-US');

const drawPopulationByAgeChart = (data) => {
  const margin = {
    top: 100,
    right: 50,
    bottom: 100,
    left: 100,
  };

  const totalWidth = 800;
  const totalHeight = 550;
  const width = totalWidth - margin.left - margin.right;
  const height = totalHeight - margin.top - margin.bottom;

  const xDomain = data.map((d) => d.age_group);

  const xScale = d3.scaleBand().domain(xDomain).range([0, width]).padding(0.2);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.population_size)])
    .range([height, 0]);

  // Render chart base
  const svg = d3
    .select('#population-chart')
    .append('svg')
    .attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // Render x axis
  svg
    .append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(
      d3.axisBottom(xScale).tickValues(
        xScale.domain().filter((d, i) => {
          return i % 5 == 0;
        })
      )
    )
    .selectAll('text')
    .attr('transform', 'translate(-10,0) rotate(-45)')
    .style('text-anchor', 'end');

  // Render x axis label
  svg
    .append('text')
    .attr('text-anchor', 'end')
    .attr('x', width)
    .attr('y', height + margin.bottom - 10)
    .text('Age');

  // Render y axis
  svg
    .append('g')
    .call(d3.axisLeft(yScale))
    .call((g) =>
      g
        .selectAll('.tick line')
        .clone()
        .attr('x2', width)
        .attr('stroke-opacity', 0.1)
    );

  //   Render y axis label
  svg
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('x', 0)
    .attr('y', -20)
    .text('Population at this age');

  // Render bars
  const bars = svg.selectAll('mybar').data(data);

  const rectangles = bars
    .join('rect')
    .attr('x', (d) => xScale(d.age_group))
    .attr('y', (d) => yScale(d.population_size))
    .attr('width', xScale.bandwidth())
    .attr('height', (d) => height - yScale(d.population_size))
    .attr('fill', '#004747')
    .attr('tabindex', '0')
    /* Each bar has an aria-label for screen readers */
    .attr('aria-labelledby', (d) => `tooltip-${d.id}`);

  rectangles.on('mouseover', (event, d) => {
    const tooltip = d3.select(`#tooltip-${d.id}`);
    tooltip.attr('display', 'block');
  });

  rectangles.on('focusin', (event, d) => {
    const tooltip = d3.select(`#tooltip-${d.id}`);
    tooltip.attr('display', 'block');
  });

  rectangles.on('mouseleave', (event, d) => {
    const tooltip = d3.select(`#tooltip-${d.id}`);
    tooltip.attr('display', 'none');
  });

  rectangles.on('focusout', (event, d) => {
    const tooltip = d3.select(`#tooltip-${d.id}`);
    tooltip.attr('display', 'none');
  });

  const tooltips = bars
    .join('g')
    .attr('id', (d) => `tooltip-${d.id}`)
    .attr('display', 'none');

  const tooltipDimensions = {
    width: 100,
    height: 60,
  };

  const halfBarWidth = xScale.bandwidth() / 2;

  // tooltip background
  tooltips
    .append('rect')
    .attr('text-anchor', 'middle')
    .attr(
      'x',
      (d) => xScale(d.age_group) + halfBarWidth - tooltipDimensions.width / 2
    )
    .attr(
      'y',
      (d) => yScale(d.population_size) - (tooltipDimensions.height + 15)
    )
    .attr('width', tooltipDimensions.width)
    .attr('height', tooltipDimensions.height)
    .attr('fill', '#ffffff');

  // Top border of tooltip
  tooltips
    .append('line')
    .attr(
      'x1',
      (d) => xScale(d.age_group) + halfBarWidth - tooltipDimensions.width / 2
    )
    .attr(
      'y1',
      (d) => yScale(d.population_size) - (tooltipDimensions.height + 15)
    )
    .attr(
      'x2',
      (d) => xScale(d.age_group) + halfBarWidth + tooltipDimensions.width / 2
    )
    .attr(
      'y2',
      (d) => yScale(d.population_size) - (tooltipDimensions.height + 15)
    )
    .attr('stroke-width', '2')
    .attr('stroke', '#000000');

  // Right border of tooltip
  tooltips
    .append('line')
    .attr(
      'x1',
      (d) => xScale(d.age_group) + halfBarWidth + tooltipDimensions.width / 2
    )
    .attr(
      'y1',
      (d) => yScale(d.population_size) - (tooltipDimensions.height + 15)
    )
    .attr(
      'x2',
      (d) => xScale(d.age_group) + halfBarWidth + tooltipDimensions.width / 2
    )
    .attr('y2', (d) => yScale(d.population_size) - 15)
    .attr('stroke-width', '2')
    .attr('stroke', '#000000');

  // Bottom border of tooltip
  tooltips
    .append('line')
    .attr(
      'x1',
      (d) => xScale(d.age_group) + halfBarWidth - tooltipDimensions.width / 2
    )
    .attr('y1', (d) => yScale(d.population_size) - 15)
    .attr(
      'x2',
      (d) => xScale(d.age_group) + halfBarWidth + tooltipDimensions.width / 2
    )
    .attr('y2', (d) => yScale(d.population_size) - 15)
    .attr('stroke-width', '2')
    .attr('stroke', '#000000');

  // Left border of tooltip
  tooltips
    .append('line')
    .attr(
      'x1',
      (d) => xScale(d.age_group) + halfBarWidth - tooltipDimensions.width / 2
    )
    .attr(
      'y1',
      (d) => yScale(d.population_size) - (tooltipDimensions.height + 15)
    )
    .attr(
      'x2',
      (d) => xScale(d.age_group) + halfBarWidth - tooltipDimensions.width / 2
    )
    .attr('y2', (d) => yScale(d.population_size) - 15)
    .attr('stroke-width', '2')
    .attr('stroke', '#000000');

  // Connection between bar and tooltip
  tooltips
    .append('line')
    .attr('x1', (d) => xScale(d.age_group) + halfBarWidth)
    .attr('y1', (d) => yScale(d.population_size) - 15)
    .attr('x2', (d) => xScale(d.age_group) + halfBarWidth)
    .attr('y2', (d) => yScale(d.population_size))
    .attr('stroke-width', '1')
    .attr('stroke', '#000000');

  // Tooltip text: age group
  tooltips
    .append('text')
    .attr('fill', '#000000')
    .attr('text-anchor', 'middle')
    .text((d) => d.age_group)
    .attr('x', (d) => xScale(d.age_group))
    .attr('y', (d) => yScale(d.population_size) - 50);

  // Tooltip text: population size
  tooltips
    .append('text')
    .attr('fill', '#000000')
    .attr('text-anchor', 'middle')
    .text((d) => numberFormatter.format(d.population_size))
    .attr('x', (d) => xScale(d.age_group))
    .attr('y', (d) => yScale(d.population_size) - 30);
};

const drawTable = (data) => {
  const svg = d3.select('#population-table');
  const rows = svg.selectAll('row').data(data).join('tr');
  rows.append('td').text((d) => d.age_group);
  rows.append('td').text((d) => numberFormatter.format(d.population_size));
};

const fetchData = async () => {
  const data = await d3.csv('../data/population_by_age.csv', (row) => ({
    id: row.id,
    age_group: row.age_group,
    population_size: +row.population_size,
  }));
  return data;
};

const main = async () => {
  const data = await fetchData();
  drawPopulationByAgeChart(data);
  drawTable(data);
  const dataForSonification = data.map((entry) => entry.population_size);

  const playSonification = sonifyData(dataForSonification);
  const playButton = document.getElementById('play-population-sonification');
  playButton.addEventListener('click', playSonification);
};

main();
