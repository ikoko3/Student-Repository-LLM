const express = require("express");
const {
  respondToPrompt,
  getKnowledgeAreas,
  knowledgeAreas,
} = require("../services/openaiservice");
const { getRecord, getRecordsByQuery } = require("../services/dynamoDBService");

const router = express.Router();

module.exports = router;

router.post("/prompt", async (req, res) => {
  try {
    const { prompt } = req.body;
    const studentId = "S123"; // We should be able to get this id from the jwt token

    const kas = await getKnowledgeAreas(prompt);
    if (kas.length == 1 && kas[0] == knowledgeAreas.Unknown) {
      res.json({
        response:
          "I couldn't understand what information I need to retrieve. Please redefine your question",
      });
      return res;
    }

    //This is a simplified version to build incrementally our context
    //There are several better patterns than this one, but we didn't focus on it
    let context = {};
    for (let ka in kas) {
      switch (kas[ka]) {
        case knowledgeAreas.Students:
          const student_result = await getRecord("Students", studentId);

          context.student_details = student_result.record.Item;
          break;
        case knowledgeAreas.Grades:
          const params = {
            TableName: "StudentGrades", //These constants should be moved to a centralized place
            KeyConditionExpression: "studentId = :studentId",
            ExpressionAttributeValues: {
              ":studentId": studentId,
            },
          };

          const grades_result = await getRecordsByQuery(params);
          context.grades = grades_result.records.Items;
          break;
        default:
          break;
      }
    }

    const response = await respondToPrompt(prompt, context);

    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
