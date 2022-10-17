const fs = require('fs');

const csvInput = './raw_data/12411-0001.csv';
const csvOutput = 'public/population_by_year.csv';
const outputStream = fs.createWriteStream(csvOutput);

// split file into lines
const lines = fs
  .readFileSync(csvInput)
  .toString()
  .replace(/\r\n/g, '\n')
  .split('\n');

console.log(`Processing ${csvInput}`);

// Lines 1 to 6 are not data
// Data starts in line 7
// Data ends in line 78

outputStream.write('id,year,population_size\n');

let skippedLines = '';

let id = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('31.12.')) {
    const lineContent = lines[i].split(';');
    outputStream.write(`${id},${lineContent[0]},${lineContent[1]}\n`);
    id += 1;
  } else {
    skippedLines = `${skippedLines}>> ${lines[i]}\n`;
  }
}
console.log(
  `\nSkipped the following lines that didn't contain data:\n${skippedLines}\n`
);

outputStream.on('finish', () => {
  console.log(`Finished writing to file ${csvOutput}.`);
});

outputStream.on('error', (err) => {
  console.error(`Error writing to file ${csvOutput}: ${err}`);
});

outputStream.end();
