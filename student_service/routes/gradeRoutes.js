const express = require("express");
const { v4: uuidv4 } = require("uuid");

const {
  addRecord,
  getRecord,
  getTable,
  getRecordsByQuery,
} = require("../services/dynamoDBService");
const { TABLES } = require("../constants");

const router = express.Router();
module.exports = router;

router.post("/upsert", async (req, res) => {
  try {
    const { studentId, courseName, gradeDescription, courseGrade } = req.body;

    const grade = {
      studentId,
      gradeId: uuidv4(), //auto generate
      courseName,
      courseGrade,
      gradeDescription,
      timestamp: new Date().toISOString(),
    };

    const result = await addRecord(TABLES.GRADES, grade);

    res.json(result.record);
  } catch (error) {
    res.status(500).json({ error: "Failed to add student grades" });
  }
});

router.get("/student/:studentId", async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const params = {
      TableName: TABLES.GRADES,
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
