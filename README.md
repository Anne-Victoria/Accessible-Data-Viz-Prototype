# Accessible data visualization prototype

## Setup

### Installing dependencies

Run `npm install` in this directory.

### Getting the datasets

#### Population by age data

Download the dataset from [Statistisches Bundesamt](https://service.destatis.de/bevoelkerungspyramide/index.html#!y=2018) by clicking on 'Download open data' and place the csv file in `raw_data`.

#### Birth and death rate data

The data on [births](https://www-genesis.destatis.de/genesis//online?operation=table&code=12612-0001) and [deaths](https://www-genesis.destatis.de/genesis//online?operation=table&code=12613-0002) are also taken from Statistisches Bundesamt.

### VS Code extensions

Make sure to have the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extensions installed and working in VS Code.

### Starting the dev server

To start the local development server run `npm start`.

## Build

To build the project, run `npm run build`. The result will be in the `dist` directory.

## Dataset attribution

All datasets are licensed under the [Data licence Germany - attribution - Version 2.0](https://www.govdata.de/dl-de/by-2-0). Download the data and place the csv file in `raw_data`.

### Population by age group dataset

The data was taken from [Statistisches Bundesamt](https://service.destatis.de/bevoelkerungspyramide/index.html#!y=2018)
and is licensed under the [Data licence Germany - attribution - Version 2.0](https://www.govdata.de/dl-de/by-2-0). The data has been modified in the following way: it was aggregated
into groups spanning five years of age, and it was visualized.

### Births and deaths by year dataset

The data was taken from the [births](https://www-genesis.destatis.de/genesis//online?operation=table&code=12612-0001)
and [deaths](https://www-genesis.destatis.de/genesis//online?operation=table&code=12613-0002)
datasets of [Statistisches Bundesamt (Destatis)](https://www.destatis.de/) and is licensed under the [Data licence Germany - attribution - Version 2.0](https://www.govdata.de/dl-de/by-2-0).

### Change of country name in frontend

For the purpose of the usability study it has been obscured, that the data is from Germany. This is why in the frontend the data is presented as data from the fictional country "Loremland".
