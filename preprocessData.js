const fs = require('fs');

const csvInput = './raw_data/14_bevoelkerungsvorausberechnung_daten.csv';
const csvOutput = 'data/population_by_age.csv';
const outputStream = fs.createWriteStream(csvOutput);

// split file into lines
const lines = fs
  .readFileSync(csvInput)
  .toString()
  .replace(/\r\n/g, '\n')
  .split('\n');

console.log(`Processing ${csvInput}`);

const splitHeader = lines[0].split(';');

const female2018 = lines.find((line) => line.startsWith('0;2018;w'));
const female2018Array = female2018.split(';');

const male2018 = lines.find((line) => line.startsWith('0;2018;m'));
const male2018Array = male2018.split(';');

outputStream.write('age_group,population_size\n');

for (let i = 4; i < female2018Array.length; i++) {
  const populationSum =
    parseInt(female2018Array[i]) + parseInt(male2018Array[i]);
  outputStream.write(`${splitHeader[i]},${populationSum}\n`);
}

outputStream.on('finish', () => {
  console.log(`Finished writing to file ${csvOutput}.`);
});

outputStream.on('error', (err) => {
  console.error(`Error writing to file ${csvOutput}: ${err}`);
});

outputStream.end();
