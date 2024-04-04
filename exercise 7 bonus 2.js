const fs = require("fs");
const readline = require("readline");

async function* iteratorParse(logFile, levelsToInclude, regexesToInclude) {
  // Create a readable stream from the log file
  const fileStream = fs.createReadStream(logFile);

  // Create a readline interface
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  // For each line in the file, process it
  for await (const line of rl) {
    // Split the line by spaces
    const parts = line.trim().split(" ");

    // If the line does not have enough parts, skip it
    if (parts.length < 6) continue;

    // Extract date, time, timezone, logLevel, and message
    const dateTime = parts[0].split(" ");
    const date = dateTime[0];
    const time = dateTime[1];
    const timezone = parts[1];
    const logLevel = parts[2];
    const message = parts.slice(3).join(" ");

    // Check if the log level is in the provided levelsToInclude array
    if (!levelsToInclude.includes(logLevel.toLowerCase())) continue;

    // Check if the message matches any of the provided regexes
    const matchesRegex = regexesToInclude.some((regex) =>
      new RegExp(regex, "i").test(message)
    );
    if (!matchesRegex) continue;

    // Create a log object
    const logEntry = {
      date,
      time,
      timezone,
      logLevel,
      message,
    };

    // Yield the log entry
    yield JSON.stringify(logEntry, null, 2);
  }

  // Close the readline interface
  rl.close();
}

(async () => {
  for await (const s of iteratorParse("testLogs.log", ["error", "info"], [
    "test",
    "dummy",
    "random",
  ])) {
    console.log(s);
  }
})();
