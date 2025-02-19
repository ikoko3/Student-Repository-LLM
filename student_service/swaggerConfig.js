const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Swagger configuration options
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Student Grades API",
      version: "1.0.0",
      description:
        "API documentation for managing student grades using AWS OpenAI & DynamoDB",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local Development Server",
      },
    ],
  },
  apis: ["./routes/*.js"], // Points to your route files
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;
