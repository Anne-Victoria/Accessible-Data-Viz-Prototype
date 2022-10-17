# Accessible data visualization prototype

## Setup

### Installing dependencies

Run `npm install` in this directory.

### Getting the datasets

#### Population by age data

Download the dataset from [Statistisches Bundesamt](https://service.destatis.de/bevoelkerungspyramide/index.html#!y=2018) by clicking on 'Download open data' and place the csv file in `raw_data`.

#### Population by year data

The second dataset is also taken from [Statistisches Bundesamt](https://www-genesis.destatis.de/genesis//online?operation=table&code=12411-0001&bypass=true&levelindex=0&levelid=1665860931032). Download the data and place the csv file in `raw_data`.

Note: both datasets are licensed under the [Data licence Germany - attribution - Version 2.0](https://www.govdata.de/dl-de/by-2-0).

### VS Code extensions

Make sure to have the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extensions installed and working in VS Code.

### Starting the dev server

To start the local development server run `npm start`.

## Build

To build the project, run `npm run build`. The result will be in the `dist` directory.
