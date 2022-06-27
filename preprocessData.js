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

let splitHeader = lines[0].split(';');
splitHeader = splitHeader.map((header) => {
  const splitHeader = header.split('_');
  return `Age ${splitHeader[1]} to ${splitHeader[2]}`;
});

const female2018 = lines.find((line) => line.startsWith('0;2018;w'));
const female2018Array = female2018.split(';');

const male2018 = lines.find((line) => line.startsWith('0;2018;m'));
const male2018Array = male2018.split(';');

outputStream.write('id,age_group,population_size\n');

for (let i = 4; i < female2018Array.length; i++) {
  const populationSumInThousands =
    parseInt(female2018Array[i]) + parseInt(male2018Array[i]);
  const actualPopulationSum = populationSumInThousands * 1000;
  outputStream.write(`${i - 4},${splitHeader[i]},${actualPopulationSum}\n`);
}

outputStream.on('finish', () => {
  console.log(`Finished writing to file ${csvOutput}.`);
});

outputStream.on('error', (err) => {
  console.error(`Error writing to file ${csvOutput}: ${err}`);
});

outputStream.end();
