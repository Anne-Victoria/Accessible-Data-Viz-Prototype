# Accessible data visualization prototype

## Setup

### Installing dependencies

Run `npm install` in this directory.

[d3.js](https://d3js.org/) is not included via npm and needs to be installed separately. Download version 7.4.3 from the official website and place it in `lib`.

### Getting the population by age dataset

Download the dataset from [Statistisches Bundesamt](https://service.destatis.de/bevoelkerungspyramide/index.html#!y=2018) by clicking on 'Download open data' and place the csv file in `raw_data`. Run `npm run prebuild` to preprocess the data. The output will be in `data/population_by_age.csv`.

Note: this dataset is licensed under the [Data licence Germany - attribution - Version 2.0](https://www.govdata.de/dl-de/by-2-0).

### Getting the metal bands dataset

Download the ["Metal Bands by Nation" dataset from kaggle](https://www.kaggle.com/datasets/mrpantherson/metal-by-nation) and place it in `data/`.

### VS Code extensions

Make sure to have the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extensions installed and working in VS Code.

### Starting the dev server

To start the local development server run `npm start`.

## Build

To build the project, run `npm run build`. The result will be in the `build` directory.
