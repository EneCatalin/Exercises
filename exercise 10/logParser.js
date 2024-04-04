const fs = require("fs");
const readline = require("readline");

function parse(logFile, levelsToInclude, stringsToInclude) {
  const fileStream = fs.createReadStream(logFile);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const logs = [];

  rl.on("line", (line) => {
    const parts = line.trim().split(" ");

    if (parts.length < 6) return;

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

  return new Promise((resolve, reject) => {
    rl.on("close", () => {
      resolve(logs);
    });

    rl.on("error", (error) => {
      reject(error);
    });
  });
}

module.exports = { parse };

function parseLogs(requestData) {
  const { f, l, s } = requestData;

  const logsPromises = f.map((filename) => {
    return new Promise((resolve, reject) => {
      parse(filename, l, [s])
        .then((parsedLogs) => {
          resolve({
            filename,
            levels: l,
            searchString: s,
            parsedLogs,
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  });

  return Promise.all(logsPromises);
}

module.exports.parseLogs = parseLogs;
