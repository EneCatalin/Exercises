const fs = require("fs");
const readline = require("readline");

async function* parseLogFile(logFile, levelsToInclude, searchString) {
  const fileStream = fs.createReadStream(logFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const parts = line.trim().split(" ");
    if (parts.length < 6) continue;

    const dateTime = parts[0].split(" ");
    const date = dateTime[0];
    const time = dateTime[1];
    const timezone = parts[1];
    const logLevel = parts[2];
    const message = parts.slice(3).join(" ");

    if (!levelsToInclude.includes(logLevel.toLowerCase())) continue;
    if (!message.toLowerCase().includes(searchString.toLowerCase())) continue;

    const logEntry = {
      date,
      time,
      timezone,
      logLevel,
      message,
    };

    yield JSON.stringify(logEntry, null, 2);
  }

  rl.close();
}

// Command line argument parsing
const args = process.argv.slice(2);

let files = [];
let levelsToInclude = [];
let searchString = "";

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "-f" && i < args.length - 1) {
    files.push(args[i + 1]);
    i++;
  } else if (arg === "-l" && i < args.length - 1) {
    levelsToInclude.push(args[i + 1]);
    i++;
  } else if (arg === "-s" && i < args.length - 1) {
    searchString = args[i + 1];
    i++;
  }
}

if (files.length === 0 || levelsToInclude.length === 0 || !searchString) {
  console.log(
    "Usage: node logparser.js -f <logfile1> -f <logfile2> -l <level> -s <searchString>"
  );
  process.exit(1);
}

// Function to process all log files
async function processLogFiles(files, levelsToInclude, searchString) {
  for (const file of files) {
    console.log(`\nProcessing file: ${file}\n`);
    for await (const log of parseLogFile(file, levelsToInclude, searchString)) {
      console.log(log);
    }
  }
}

// Start processing log files
processLogFiles(files, levelsToInclude, searchString).catch((error) => {
  console.error("Error processing log files:", error);
});
