const fs = require('fs');

const csvInputBirths = './raw_data/12612-0001.csv';
const csvInputDeaths = './raw_data/12613-0002.csv';
const csvOutput = 'public/birth_death_rate.csv';
const outputStream = fs.createWriteStream(csvOutput);

// split file into lines
const birthLines = fs
  .readFileSync(csvInputBirths)
  .toString()
  .replace(/\r\n/g, '\n')
  .split('\n');

const deathLines = fs
  .readFileSync(csvInputDeaths)
  .toString()
  .replace(/\r\n/g, '\n')
  .split('\n');

console.log(`Processing ${csvInputBirths} and ${csvInputDeaths}`);

outputStream.write('id,year,births,deaths\n');

const firstDataLineInBirths = birthLines.findIndex((line) =>
  line.startsWith('1950')
);
const lastDataLineInBirths = birthLines.findIndex((line) =>
  line.startsWith('2021')
);

const firstDataLineInDeaths = deathLines.findIndex((line) =>
  line.startsWith('1950')
);
const lastDataLineInDeaths = deathLines.findIndex((line) =>
  line.startsWith('2021')
);

const numberOfDataLinesInBirths =
  1 + lastDataLineInBirths - firstDataLineInBirths;

const numberOfDataLinesInDeaths =
  1 + lastDataLineInDeaths - firstDataLineInDeaths;

if (numberOfDataLinesInBirths !== numberOfDataLinesInDeaths) {
  console.error(
    `Error: Number of data entries in birth and death rate datasets do not match.
    Entries in birth dataset: ${numberOfDataLinesInBirths}
    Entries in death dataset: ${numberOfDataLinesInDeaths}`
  );
  return;
}

let id = 0;
for (let i = 0; i < numberOfDataLinesInBirths; i++) {
  const birthEntry = birthLines[firstDataLineInBirths + i].split(';');
  const deathEntry = deathLines[firstDataLineInDeaths + i].split(';');
  if (birthEntry[0] !== deathEntry[0]) {
    console.error(`Year of entry does not match for the following lines:
    Birth data entry ${birthEntry}
    Death data entry ${deathEntry}`);
    return;
  }
  outputStream.write(
    `${id},${birthEntry[0]},${birthEntry[3]},${deathEntry[3]}\n`
  );
  id += 1;
}

outputStream.on('finish', () => {
  console.log(`Finished writing to file ${csvOutput}.`);
});

outputStream.on('error', (err) => {
  console.error(`Error writing to file ${csvOutput}: ${err}`);
});

outputStream.end();
