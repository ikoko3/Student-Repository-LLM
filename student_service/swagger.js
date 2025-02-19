const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Student Grades API",
    description: "API documentation for managing student grades",
    version: "1.0.0",
  },
  host: "localhost:3000", // Change this when deploying
  schemes: ["http"],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const outputFile = "./swagger-output.json"; // Where the generated file will be saved
const endpointsFiles = ["./server.js", "./routes/*.js"]; // Scans all route files

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log("✅ Swagger JSON generated!");
});
