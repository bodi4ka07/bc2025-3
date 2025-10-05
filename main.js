const { program } = require('commander');
const fs = require('fs');

// 1. Параметри командного рядка
program
  .requiredOption('-i, --input <file>', 'Input JSON file')
  .option('-o, --output <file>', 'Output file')
  .option('-d, --display', 'Display result on console')
  .option('--date', 'Display date before airtime and distance')
  .option('-a, --airtime <minutes>', 'Filter flights with AIR_TIME greater than this value');

program.parse(process.argv);
const options = program.opts();

// 2. Перевірка обов'язкового параметру
if (!options.input) {
  console.error("Please, specify input file");
  process.exit(1);
}

if (!fs.existsSync(options.input)) {
  console.error("Cannot find input file");
  process.exit(1);
}

// 3. Читання файлу построково (NDJSON / JSON Lines)
let dataLines;
try {
  dataLines = fs.readFileSync(options.input, 'utf-8')
    .split('\n')                       // розбиваємо на рядки
    .filter(line => line.trim() !== '') // прибираємо пусті рядки
    .map(line => JSON.parse(line));     // парсимо кожен рядок окремо
} catch (err) {
  console.error("Error reading JSON file:", err.message);
  process.exit(1);
}

// 4. Фільтрація за airtime (якщо задано)
let results = dataLines;
if (options.airtime) {
  const minAirtime = parseInt(options.airtime);
  results = results.filter(flight => flight.AIR_TIME > minAirtime);
}

// 5. Форматування виводу
const outputLines = results.map(flight => {
  const datePart = options.date ? `${flight.FL_DATE} ` : '';
  return `${datePart}${flight.AIR_TIME} ${flight.DISTANCE}`;
});
const outputText = outputLines.join('\n');

// 6. Вивід у консоль і/або запис у файл
if (options.display) {
  console.log(outputText);
}

if (options.output) {
  try {
    fs.writeFileSync(options.output, outputText, 'utf-8');
  } catch (err) {
    console.error("Error writing to output file:", err.message);
    process.exit(1);
  }
}
