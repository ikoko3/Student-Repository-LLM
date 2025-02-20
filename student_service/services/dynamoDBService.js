require("dotenv").config();
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

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
 * Adds a record  to the DynamoDB table
 * @param {string} tableName - The table name
 * @param {Object} recrod - Student data (id, ...)
 */
async function addRecord(tableName, record) {
  try {
    const command = new PutCommand({
      TableName: tableName,
      Item: record,
    });

    await dynamo.send(command);
    console.log("Student record added:", record);
    return { success: true, message: "Record added successfully", record };
  } catch (error) {
    console.error("DynamoDB Error:", error);
    return { success: false, message: "Failed to add record" };
  }
}

/**
 * Get a record from the DynamoDB table
 * @param {string} tableName - The table name
 * @param {string} id - record id
 */
async function getRecord(tableName, id) {
  try {
    const command = new GetCommand({
      TableName: tableName,
      Key: {
        studentId: id,
      },
    });

    const record = await dynamo.send(command);
    return { success: true, record };
  } catch (error) {
    console.error("DynamoDB Error:", error);
    return { success: false, message: "Failed to add record" };
  }
}

/**
 * Get a record from the DynamoDB table
 * @param {string} tableName - The table name
 * @param {string} id - record id
 */
async function getRecordsByQuery(params) {
  try {
    const command = new QueryCommand(params);

    const records = await dynamo.send(command);
    return { success: true, records };
  } catch (error) {
    console.error("DynamoDB Error:", error);
    return { success: false, message: "Failed to get records" };
  }
}

module.exports = { addRecord, getRecord, getRecordsByQuery };
