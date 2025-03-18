const express = require("express");
const {
  authenticateToken,
  authorizeUser,
} = require("../middleware/authMiddleware");
const {
  addRecord,
  getRecord,
  getTable,
} = require("../services/dynamoDBService");
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
  authenticateToken,
  authorizeUser(["id"]),
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

router.post("/initUser", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    initializRandomUserData(userId);

    res.status(200).json({ success: "User initialized successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add student record" });
  }
});

async function initializRandomUserData(userId) {
  try {
    for (let index = 0; index < 10; index++) {
      var studentCourseEntry;
      var studentGradeEntry;

      studentCourseEntry = generateRandomStudentCourseEntry(userId);
      const courseRes = await addRecord(
        TABLES.STUDENT_COURSES,
        studentCourseEntry
      );
      if (studentCourseEntry.status === "passed") {
        studentGradeEntry = generateStudentGradeEntryGradeEntry(
          userId,
          studentCourseEntry.courseId
        );
        const gradeRes = await addRecord(TABLES.GRADES, studentGradeEntry);
      }
    }

    res.status(200).json({ success: "User initialized successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add student record" });
  }
}

function generateRandomStudentCourseEntry(userId) {
  const courseIds = ["C001", "C002", "C003", "C004", "C005", "C006"];
  const statuses = ["ongoing", "passed", "failed"];

  const randomCourseId =
    courseIds[Math.floor(Math.random() * courseIds.length)];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

  return {
    studentId: userId,
    courseId: randomCourseId,
    status: randomStatus,
  };
}

function generateStudentGradeEntryGradeEntry(studentId, courseId) {
  const gradeId = "G-" + generateRandomHex(4);
  const gradeDescriptions = ["midterm", "final", "assignment", "quiz"];
  const courseGrade = Math.floor(Math.random() * 5) + 6;

  const randomGradeDescription =
    gradeDescriptions[Math.floor(Math.random() * gradeDescriptions.length)];
  const timestamp = new Date().toISOString(); // Generate current timestamp

  return {
    studentId: studentId,
    gradeId: gradeId,
    courseGrade: courseGrade,
    courseId: courseId,
    gradeDescription: randomGradeDescription,
    timestamp: timestamp,
  };
}

function generateRandomHex(length) {
  let hex = "";
  const characters = "0123456789ABCDEF";
  for (let i = 0; i < length; i++) {
    hex += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return hex;
}
