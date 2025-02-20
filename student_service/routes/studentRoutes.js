const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { addRecord, getRecord } = require("../services/dynamoDBService");

const router = express.Router();
const TABLE_NAME = "Students"; // Change this to your actual table name

module.exports = router;

router.post("/upsert", async (req, res) => {
  try {
    const { id, email } = req.body;

    if (!id || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const student = {
      studentId: id, // Primary Key
      email,
      timestamp: new Date().toISOString(),
    };

    const result = await addRecord(TABLE_NAME, student);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to add student record" });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;

    const result = await getRecord(TABLE_NAME, id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get student record" });
  }
});
