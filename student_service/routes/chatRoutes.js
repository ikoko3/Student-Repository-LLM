const express = require("express");
const {
  respondToPrompt,
  getKnowledgeAreas,
} = require("../services/openaiservice");

const router = express.Router();

module.exports = router;

router.post("/prompt", async (req, res) => {
  try {
    const { prompt } = req.body;

    const kas = await getKnowledgeAreas(prompt);

    // Get context based on knowledge areas

    const context = "{'Physics Grade':8}";

    const response = await respondToPrompt(prompt, context);

    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
