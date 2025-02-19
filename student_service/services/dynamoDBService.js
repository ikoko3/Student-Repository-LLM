require("dotenv").config();
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

// Initialize DynamoDB Client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const dynamo = DynamoDBDocumentClient.from(client);

/**
 * Adds a student record to the DynamoDB table
 * @param {string} tableName - The table name
 * @param {Object} student - Student data (id, name, subject, score)
 */
async function addStudentRecord(tableName, student) {
  try {
    const command = new PutCommand({
      TableName: tableName,
      Item: student,
    });

    await dynamo.send(command);
    console.log("Student record added:", student);
    return { success: true, message: "Record added successfully", student };
  } catch (error) {
    console.error("DynamoDB Error:", error);
    return { success: false, message: "Failed to add record" };
  }
}

module.exports = { addStudentRecord };
