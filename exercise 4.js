// EX 4:
// Time: not sure, 20 minutes? I tried the regex one and it's been taking a while
// NO REGEX:
const log = `
2020-01-02 01:02:03.100+05:00 DEBUG This is a dummy DEBUG message
2020-01-02 01:02:03.200+05:00 INFO This is a random INFO message
2020-01-02 01:02:03.300+05:00 ERROR This is an test ERROR message
2020-01-02 01:02:03.400+05:00 INFO This is another random INFO message
2020-01-02 01:02:03.500+05:00 ERROR This is a different test ERROR message
2020-01-02 01:02:03.600+05:00 DEBUG This is a dummy test DEBUG message
`;

const logsArray = log.split("\n").filter(Boolean); // Split log by newlines and filter out empty lines

const logs = logsArray
  .map((logEntry) => {
    const parts = logEntry.trim().split(" ");
    if (parts.length < 6) return null; // Check if the log entry has all required parts

    const dateTime = parts[0].split(" ");
    const date = dateTime[0];
    const time = dateTime[1];
    const timezone = parts[1];
    const logLevel = parts[2];
    const message = parts.slice(3).join(" ");

    return {
      date,
      time,
      timezone,
      logLevel,
      message,
    };
  })
  .filter(Boolean); // Filter out any null entries

// Print the formatted logs
for (const entry of logs) {
  console.log(JSON.stringify(entry, null, 2));
}
