const fs = require("fs");
const readline = require("readline");

function parse(logFile, levelsToInclude, stringsToInclude) {
  // Create a readable stream from the log file
  const fileStream = fs.createReadStream(logFile);

  // Create a readline interface
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  // Initialize an array to store parsed log entries
  const logs = [];

  // For each line in the file, process it
  rl.on("line", (line) => {
    // Split the line by spaces
    const parts = line.trim().split(" ");

    // If the line does not have enough parts, skip it
    if (parts.length < 6) return;

    // Extract date, time, timezone, logLevel, and message
    const dateTime = parts[0].split(" ");
    const date = dateTime[0];
    const time = dateTime[1];
    const timezone = parts[1];
    const logLevel = parts[2];
    const message = parts.slice(3).join(" ");

    // Check if the log level is in the provided levelsToInclude array
    if (!levelsToInclude.includes(logLevel)) return;

    // Check if the message contains any of the provided stringsToInclude
    const containsStrings = stringsToInclude.some((str) =>
      message.includes(str)
    );
    if (!containsStrings) return;

    // Create a log object and push it to the logs array
    const logEntry = {
      date,
      time,
      timezone,
      logLevel,
      message,
    };
    logs.push(logEntry);
  });

  // When all lines are read, log the parsed entries
  rl.on("close", () => {
    for (const entry of logs) {
      console.log(JSON.stringify(entry, null, 2));
    }
  });
}

// Export the parse function for module usage
module.exports = { parse };
