const fs = require("fs");
const readline = require("readline");

function parse(logFile, levelsToInclude, stringsToInclude) {
  const fileStream = fs.createReadStream(logFile);

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

    if (!levelsToInclude.includes(logLevel)) return;

    const containsStrings = stringsToInclude.some((str) =>
      message.includes(str)
    );
    if (!containsStrings) return;

    const logEntry = {
      date,
      time,
      timezone,
      logLevel,
      message,
    };
    logs.push(logEntry);
  });

  rl.on("close", () => {
    for (const entry of logs) {
      console.log(JSON.stringify(entry, null, 2));
    }
  });
}

parse("testLogs.log", ["ERROR", "INFO"], ["test"]);
