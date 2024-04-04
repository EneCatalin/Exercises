const http = require("http");

// Define the request data
const requestData = {
  f: ["testLogs1.log", "testLogs2.log"],
  l: ["error", "info"],
  s: "testing123",
};

// Function to send the HTTP request with retries
function sendRequestWithRetry(retriesLeft) {
  const options = {
    hostname: "localhost",
    port: 5000,
    path: "/logparser",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const req = http.request(options, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      console.log("API Response:", data);
    });
  });

  req.on("error", (error) => {
    console.error("Error making request:", error.message);
    if (retriesLeft > 0) {
      console.log(`Retrying... ${retriesLeft} retries left.`);
      setTimeout(() => {
        sendRequestWithRetry(retriesLeft - 1);
      }, 1000); // Retry after 1 second
    } else {
      console.error("Max retries exceeded. Exiting.");
    }
  });

  // Send the request with the request data
  req.write(JSON.stringify(requestData));
  req.end();
}

// Function to trigger requests with throttling
function triggerRequests(numRequests) {
  let count = 0;
  const interval = setInterval(() => {
    count++;
    console.log(`Sending request ${count}/${numRequests}`);
    sendRequestWithRetry(3); // Retry up to 3 times if throttled

    if (count === numRequests) {
      clearInterval(interval);
    }
  }, 100); // Sending requests rapidly
}

// Configure number of requests
const numRequests = 65; // Number of requests to send

console.log(`Sending ${numRequests} requests.`);
triggerRequests(numRequests);
