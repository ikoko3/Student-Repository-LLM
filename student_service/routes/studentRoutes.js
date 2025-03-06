const express = require("express");
const {
  authenticateToken,
  authorizeUser,
} = require("../middleware/authMiddleware");
const { addRecord, getRecord, getTable } = require("../services/dynamoDBService");
const { TABLES } = require("../constants");

const router = express.Router();

module.exports = router;

router.post(
  "/upsert",
  authenticateToken,
  authorizeUser(["id"]),
  async (req, res) => {
    try {
      const { id, first_name, last_name, email } = req.body;

      if (!id || !email) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const student = {
        studentId: id, // Primary Key
        first_name,
        last_name,
        email,
        timestamp: new Date().toISOString(),
      };

      const result = await addRecord(TABLES.STUDENTS, student);
      res.json(result.record);
    } catch (error) {
      res.status(500).json({ error: "Failed to add student record" });
    }
  }
);

router.get(
  "/:id",
  //authenticateToken,
  //authorizeUser(["id"]),
  async (req, res) => {
    try {
      const id = req.params.id;

      const result = await getRecord(TABLES.STUDENTS, id);
      res.json(result.record.Item);
    } catch (error) {
      res.status(500).json({ error: "Failed to get student record" });
    }
  }
);
