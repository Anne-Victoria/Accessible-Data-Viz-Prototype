import Highcharts from 'highcharts';
import Exporting from 'highcharts/modules/exporting';
import ExportData from 'highcharts/modules/export-data';
import Accessibility from 'highcharts/modules/accessibility';
import { renderCode } from './renderCode.mjs';

Exporting(Highcharts);
ExportData(Highcharts);
Accessibility(Highcharts);

const chart = Highcharts.chart('chart', {
  chart: {
    type: 'bar',
  },
  title: {
    text: 'Fruit Consumption',
  },
  xAxis: {
    categories: ['Apples', 'Bananas', 'Oranges'],
  },
  yAxis: {
    title: {
      text: 'Fruit eaten',
    },
  },
  series: [
    {
      name: 'Jane',
      data: [1, 0, 4],
    },
    {
      name: 'John',
      data: [5, 7, 3],
    },
  ],
});

renderCode('/src/highcharts-example.js', '#code');
