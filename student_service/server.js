const express = require('express')
const cors = require("cors")

const app = express()
const port = 3000

// Allow all origins (not recommended for production)
app.use(cors());

// // OR allow specific origins (safer)
// app.use(
//   cors({
//     origin: "http://localhost:5173", // Replace with the frontend URL
//     methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
//     allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
//   })
// );


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

// Express route to test debugging
app.get("/test-value", (req, res) => {

  var x = 5;

  res.json({ message: "This is a message from the other docker!", x });
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
