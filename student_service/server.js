const express = require("express");
const cors = require("cors");

//Environment Setup
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

//Express Server
const app = express();
const bodyParser = require("body-parser");

//Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");
const setupSwagger = require("./swaggerConfig");
setupSwagger(app);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
const studentRoutes = require("./routes/studentRoutes");
const gradeRoutes = require("./routes/gradeRoutes");
const chatRoutes = require("./routes/chatRoutes");

app.use("/api/students", studentRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/chat", chatRoutes);

//Server startup
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
