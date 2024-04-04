// Ex 6:

const fs = require("fs");
const readline = require("readline");

function parse(logFile) {
  const fileStream = fs.createReadStream(logFile);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const logs = [];

  // For each line in the file, process it
  rl.on("line", (line) => {
    const parts = line.trim().split(" ");

    if (parts.length < 6) return;

    const dateTime = parts[0].split(" ");
    const date = dateTime[0];
    const time = dateTime[1];
    const timezone = parts[1];
    const logLevel = parts[2];
    const message = parts.slice(3).join(" ");

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

parse("testLogs.log");
