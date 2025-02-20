const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
const studentRoutes = require("./routes/studentRoutes");
const gradeRoutes = require("./routes/gradeRoutes");
const chatRoutes = require("./routes/chatRoutes");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");
const dotenv = require("dotenv");
const setupSwagger = require("./swaggerConfig");

dotenv.config();
setupSwagger(app);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve Swagger Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/chat", chatRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
