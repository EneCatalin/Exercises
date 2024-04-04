const http = require("http");
const { parse } = require("./logparser");

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/logparser") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const requestData = JSON.parse(body);

        const logs = parseLogs(requestData);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(logs));
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON format" }));
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found" }));
  }
});

function parseLogs(requestData) {
  const { f, l, s } = requestData;

  const logs = f.map((filename) => ({
    filename,
    levels: l,
    searchString: s,
    parsedLogs: parse(filename, l, [s]),
  }));

  return logs;
}

server.listen(5000, "localhost", () => {
  console.log("Server running at http://localhost:5000");
});
