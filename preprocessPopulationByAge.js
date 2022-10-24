const fs = require('fs');

const csvInput = './raw_data/14_bevoelkerungsvorausberechnung_daten.csv';
const csvOutput = 'public/population_by_age.csv';
const outputStream = fs.createWriteStream(csvOutput);
// Define how many size of the bins to group the ages into
const agesPerGroup = 5;

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

// this line contains the data for women in all age groups in 2018
const female2018 = lines.find((line) => line.startsWith('0;2018;w'));
const female2018Array = female2018.split(';');

// this line contains the data for men in all age groups in 2018
const male2018 = lines.find((line) => line.startsWith('0;2018;m'));
const male2018Array = male2018.split(';');

outputStream.write('id,age_group,population_size\n');

// the data by age groups start at index 4 in the line
for (let i = 4; i < female2018Array.length; i += agesPerGroup) {
  let populationWithinGroup = 0;
  let isGroupIncomplete = false;
  for (let j = 0; j < agesPerGroup; j += 1) {
    if (female2018Array[i + j] && male2018Array[i + j]) {
      populationWithinGroup =
        populationWithinGroup +
        parseInt(female2018Array[i + j]) +
        parseInt(male2018Array[i + j]);
    } else {
      console.error('Error: Incomplete age group.');
      populationWithinGroup = 0;
      isGroupIncomplete = true;
    }
  }
  const startingAgeOfGroup = splitHeader[i].split(' ')[1];
  const endingAgeOfGroup = splitHeader[i + agesPerGroup - 1]
    ? splitHeader[i + agesPerGroup - 1].split(' ')[1]
    : 'incomplete';
  const actualPopulationSum = populationWithinGroup * 1000;
  const groupLabel = `${startingAgeOfGroup}–${endingAgeOfGroup}`;

  outputStream.write(`${i - 4},${groupLabel},${actualPopulationSum}\n`);
}

outputStream.on('finish', () => {
  console.log(`Finished writing to file ${csvOutput}.`);
});

outputStream.on('error', (err) => {
  console.error(`Error writing to file ${csvOutput}: ${err}`);
});

outputStream.end();
