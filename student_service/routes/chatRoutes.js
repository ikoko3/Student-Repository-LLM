const express = require("express");
const {
  respondToPrompt,
  getKnowledgeAreas,
  knowledgeAreas,
} = require("../services/openaiservice");
const {
  getRecord,
  getRecordsByQuery,
  getSTokensRecord,
  addRecord,
} = require("../services/dynamoDBService");

const router = express.Router();

module.exports = router;
const dailyMaxTokens = 3500; // We will create the logic at a next step

router.get("/available_tokens/:id", async (req, res) => {
  try {
    const studentId = req.params.id;
    var spent_tokens = 0;

    const student_tokens = await getStudentTokens(studentId);
    if (student_tokens != undefined) spent_tokens = student_tokens.tokens_spent;

    res.json(dailyMaxTokens - spent_tokens);
  } catch (error) {
    res.status(500).json({ error: "Failed to get student record" });
  }
});

router.post("/prompt", async (req, res) => {
  try {
    const { prompt, studentId } = req.body;

    const student_tokens = await getStudentTokens(studentId);

    if (
      student_tokens != undefined &&
      student_tokens.tokens_spent >= dailyMaxTokens
    ) {
      res.json({
        response: "You have exceeded your daily quota, try again tomorrow",
      });
      return res;
    }

    const kas_response = await getKnowledgeAreas(prompt);
    var tokens_spent = kas_response.tokens_spent;

    const kas = kas_response.response;
    if (kas.length == 1 && kas[0] == knowledgeAreas.Unknown) {
      res.json({
        response:
          "I couldn't understand what information I need to retrieve. Please redefine your question",
      });

      await saveStudentTokens(studentId, student_tokens, tokens_spent);
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

    const prompt_response = await respondToPrompt(prompt, context);

    tokens_spent += prompt_response.tokens_spent;
    await saveStudentTokens(studentId, student_tokens, tokens_spent);

    res.json({ response: prompt_response.response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Should be moved to a generic library file
function getFormattedDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

async function saveStudentTokens(studentId, student_tokens, tokens_spent) {
  var st_to_update = student_tokens;
  if (student_tokens == undefined) {
    st_to_update = {
      studentId,
      tokens_spent,
      Date: getFormattedDate(),
    };
  } else {
    st_to_update.tokens_spent += tokens_spent;
  }

  const result = await addRecord("StudentTokens", st_to_update);
}

async function getStudentTokens(studentId) {
  return await getSTokensRecord(
    "StudentTokens", // Create constant
    studentId,
    getFormattedDate()
  );
}
