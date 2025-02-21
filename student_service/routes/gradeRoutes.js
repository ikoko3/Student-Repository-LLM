const express = require("express");
const { v4: uuidv4 } = require("uuid");

const {
  addRecord,
  getRecord,
  getRecordsByQuery,
} = require("../services/dynamoDBService");

const router = express.Router();
const TABLE_NAME = "StudentGrades"; // Change this to your actual table name

module.exports = router;

router.post("/upsert", async (req, res) => {
  try {
    const { studentId, courseName, gradeDescription, courseGrade } = req.body;

    const grade = {
      studentId,
      gradeId: uuidv4(), //auto generate
      courseName,
      courseGrade,
      timestamp: new Date().toISOString(),
    };

    const result = await addRecord(TABLE_NAME, grade);
    res.json(result.record);
  } catch (error) {
    res.status(500).json({ error: "Failed to add student grades" });
  }
});

router.get("/student/:studentId", async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const params = {
      TableName: TABLE_NAME,
      KeyConditionExpression: "studentId = :studentId",
      ExpressionAttributeValues: {
        ":studentId": studentId,
      },
    };

    const result = await getRecordsByQuery(params);
    res.json(result.records);
  } catch (error) {
    res.status(500).json({ error: "Failed to get student record" });
  }
});
