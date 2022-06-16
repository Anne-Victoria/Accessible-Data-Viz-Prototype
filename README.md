# Accessible data visualization prototype

## Setup

### Installing dependencies

Run `npm install` in this directory.

[d3.js](https://d3js.org/) is not included via npm and needs to be installed separately. Download version 7.4.3 from the official website and place it in `lib`.

### Getting the population by age dataset

Download the dataset from [Statista](https://de.statista.com/statistik/daten/studie/1351/umfrage/altersstruktur-der-bevoelkerung-deutschlands/), convert the file into CSV and transform it so that it matches the following structure:

```
age_group,population_size
Younger than 1 year,769380
1 year olds,783593
2 year olds,798366
...
```

Then place the resulting file in `data/`.

### Getting the metal bands dataset

Download the ["Metal Bands by Nation" dataset from kaggle](https://www.kaggle.com/datasets/mrpantherson/metal-by-nation) and place it in `data/`.

### VS Code extensions

Make sure to have the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extensions installed and working in VS Code.

### Starting the dev server

To start the local development server run `npm start`.

## Build

To build the project, run `npm run build`. The result will be in the `build` directory.
