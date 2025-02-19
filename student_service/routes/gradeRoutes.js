const express = require("express");
const { addStudentRecord } = require("../services/dynamoDBService");
const { generateGradeFeedback } = require("../services/openaiservice");

const router = express.Router();
const TABLE_NAME = "Students"; // Change this to your actual table name

router.post("/add-student", async (req, res) => {
  try {
    const { studentId, studentName, subject, score } = req.body;

    if (!studentId || !studentName || !subject || score === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const student = {
      studentId, // Primary Key
      studentName,
      subject,
      score,
      timestamp: new Date().toISOString(),
    };

    const result = await addStudentRecord(TABLE_NAME, student);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to add student record" });
  }
});

module.exports = router;

router.post("/grade-feedback", async (req, res) => {
  try {
    const { studentName, subject, score } = req.body;
    if (!studentName || !subject || score === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const feedback = await generateGradeFeedback(studentName, subject, score);
    res.json({ feedback });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
