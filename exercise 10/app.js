const http = require("http");
const fs = require("fs");
const { parseLogs } = require("./logParser");

// Throttling parameters
const rateLimit = 2; // Maximum requests per second
const maxTokens = rateLimit; // Maximum tokens in the bucket
let tokens = maxTokens; // Current number of tokens in the bucket
const tokenRefillRate = 1; // Rate at which tokens are added back per second
let lastTokenRefillTimestamp = Date.now(); // Timestamp of last token refill
const requestQueue = [];
let isProcessing = false;

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/logparser") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        // Parse the received data as JSON
        const requestData = JSON.parse(body);

        // Throttle the request
        throttledRequest(req, res, requestData);
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

function throttledRequest(req, res, requestData) {
  requestQueue.push({ req, res, requestData });

  // If not already processing, start processing the queue
  if (!isProcessing) {
    processQueue();
  }
}

function processQueue() {
  if (requestQueue.length === 0 || isProcessing) {
    return;
  }

  isProcessing = true;
  const request = requestQueue.shift();

  try {
    // Check if enough tokens are available
    if (tokens >= 1) {
      tokens -= 1; // Consume a token
      // Call the parseLogs function with the parsed JSON data
      parseLogs(request.requestData)
        .then((logs) => {
          request.res.writeHead(200, { "Content-Type": "application/json" });
          request.res.end(JSON.stringify(logs));
        })
        .catch((error) => {
          console.error("Error parsing logs:", error.message);
          request.res.writeHead(500, { "Content-Type": "application/json" });
          request.res.end(JSON.stringify({ error: "Internal Server Error" }));
        })
        .finally(() => {
          isProcessing = false;
          processQueue();
        });
    } else {
      // Not enough tokens, continue processing the queue
      isProcessing = false;
      processQueue();
    }
  } catch (error) {
    console.error("Error processing request:", error.message);
    request.res.writeHead(500, { "Content-Type": "application/json" });
    request.res.end(JSON.stringify({ error: "Internal Server Error" }));
    isProcessing = false;
    processQueue();
  }
}

// Function to refill tokens
function refillTokens() {
  const now = Date.now();
  const timePassed = now - lastTokenRefillTimestamp;
  const tokensToAdd = (timePassed / 1000) * tokenRefillRate; // Tokens added = (time passed in seconds) * refill rate

  tokens = Math.min(tokens + tokensToAdd, maxTokens); // Ensure tokens do not exceed maxTokens
  lastTokenRefillTimestamp = now;
  setTimeout(refillTokens, 1000); // Refill tokens every second
}

// Start token refill process
refillTokens();

server.listen(5000, "localhost", () => {
  console.log("Server running at http://localhost:5000");
});
