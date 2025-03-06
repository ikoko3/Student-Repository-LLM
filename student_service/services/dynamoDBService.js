require("dotenv").config();
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
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
 * @param {string} idAttribute - the name of the key attribute (e.g., "studentId")
 */
async function getRecord(tableName, id, idAttribute = "studentId") {
  try {
    const command = new GetCommand({
      TableName: tableName,
      Key: {
        [idAttribute]: id, // Dynamically use the idAttribute
      },
    });

    const record = await dynamo.send(command);
    return { success: true, record };
  } catch (error) {
    console.error("DynamoDB Error:", error);
    return { success: false, message: "Failed to get record" };
  }
}

/**
 * Get all items from a DynamoDB table
 * @param {string} tableName - The table name
 */
async function getTable(tableName) {
  try {
    const command = new ScanCommand({
      TableName: tableName,
    });

    const records = await dynamo.send(command);
    return { success: true, records };
  } catch (error) {
    console.error("DynamoDB Error:", error);
    return { success: false, message: "Failed to get table" };
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

//This could be abstracted and then be moved to a different service
async function getSTokensRecord(tableName, partitionKey, sortKey) {
  const params = {
    TableName: tableName,
    Key: {
      studentId: partitionKey,
      Date: sortKey,
    },
  };

  try {
    const command = new GetCommand(params);
    const response = await dynamo.send(command);
    return response.Item;
  } catch (error) {
    console.error("Error fetching item:", error);
  }
}

/**
 * Get the count of items in a DynamoDB table
 * @param {string} tableName - The table name
 * @returns {number} - The count of items in the table
 */
async function getTableItemCount(tableName) {
  try {
    const command = new ScanCommand({
      TableName: tableName,
      Select: "COUNT", // This only returns the count of items, not the actual data
    });

    const result = await dynamo.send(command);
    return result.Count; // `Count` will contain the number of items
  } catch (error) {
    console.error("Error getting item count:", error);
    return 0; // Return 0 in case of error
  }
}

/**
 * Get the sum of 'amount' for a specific sort key (e.g., 'date')
 * @param {string} tableName - The table name
 * @param {string} sortKeyValue - The sort key value (e.g., date)
 */
async function getAmountSumBySortKey(tableName, indexName, date) {
  try {
    const command = new QueryCommand({
      TableName: tableName,
      IndexName: indexName, // GSI name (index on `date`)
      KeyConditionExpression: "#Date = :Date", // Query by `date`
      ExpressionAttributeNames: {
        "#Date": "Date", // The GSI partition key (date)
      },
      ExpressionAttributeValues: {
        ":Date": date, // The date value to query
      },
    });

    const data = await dynamo.send(command);

    // Calculate the sum of the 'amount' column
    const sum = data.Items.reduce((acc, item) => {
      const value = parseFloat(item.tokens_spent || 0); // Convert string to number
      return acc + value;
    }, 0);

    return sum;
  } catch (error) {
    console.error("Error getting amount sum:", error);
    return 0;
  }
}

module.exports = {
  addRecord,
  getRecord,
  getTable,
  getRecordsByQuery,
  getSTokensRecord,
  getTableItemCount,
  getAmountSumBySortKey,
};
