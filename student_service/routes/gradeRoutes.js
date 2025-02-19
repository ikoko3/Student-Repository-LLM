const express = require("express");
const { generateGradeFeedback } = require("../services/openaiservice");

const router = express.Router();

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
