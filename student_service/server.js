const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get("/", (req, res) => {
  res.send("Debugging Express with Docker in VS Code!");
});

// Sample function to test debugging
function addNumbers(a, b) {
  console.log("Function addNumbers called with:", a, b);
  debugger; // <-- Debugger will pause here in VS Code
  return a + b;
}

// Express route to test debugging
app.get("/test-debug", (req, res) => {
  console.log("Received request on /test-debug");

  const result = addNumbers(5, 10); // Function call for debugging

  res.json({ message: "Debugging!", sum: result });
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
