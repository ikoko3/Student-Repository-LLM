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
      var studentCourseEntry = generateRandomStudentCourseEntry(userId);
      await addRecord(TABLES.STUDENT_COURSES, studentCourseEntry);

      // Generate grades based on course status
      let studentGrades = generateStudentGrades(userId, studentCourseEntry.courseId, studentCourseEntry.status);
      for (let gradeEntry of studentGrades) {
        await addRecord(TABLES.GRADES, gradeEntry);
      }
    }

    res.status(200).json({ success: "User initialized successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add student record" });
  }
}

function generateRandomStudentCourseEntry(userId) {
  const courseIds = ["C001", "C002", "C003", "C004", "C005",
                     "C006", "C007", "C008", "C009", "C010",
                     "C011", "C012", "C013", "C014", "C015", 
                     "C016", "C017", "C018", "C019", "C020"];

  const statuses = ["ongoing", "passed", "failed"];

  return {
    studentId: userId,
    courseId: courseIds[Math.floor(Math.random() * courseIds.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
  };
}

function generateStudentGrades(studentId, courseId, status) {
  const gradeDescriptions = {
    failed: ["midterm", "final", "assignment", "quiz"],
    passed: ["midterm", "final", "assignment", "quiz"],
    ongoing: ["assignment", "quiz"],
  };

  return gradeDescriptions[status].map((description) => ({
    studentId,
    courseId,
    gradeId: "G-" + generateRandomHex(4),
    gradeDescription: description,
    courseGrade: generateGrade(status),
    timestamp: new Date().toISOString(),
  }));
}

function generateGrade(status) {
  if (status === "failed") return Math.floor(Math.random() * 6);
  if (status === "passed") return Math.floor(Math.random() * 5) + 6;
  return Math.floor(Math.random() * (11));; // Ongoing
}

function generateRandomHex(length) {
  let hex = "";
  const characters = "0123456789ABCDEF";
  for (let i = 0; i < length; i++) {
    hex += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return hex;
}
