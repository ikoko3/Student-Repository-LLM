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
  getTableItemCount,
  getAmountSumBySortKey,
} = require("../services/dynamoDBService");
const {
  getRemainingDaysInMonth,
  isFirstDayOfMonth,
  getFormattedDate,
} = require("../dateUtils");

const router = express.Router();

module.exports = router;
const dailyMaxTokens = 3500; // We will create the logic at a next step

//We can set a cache for these value, instead of registering them simply as a variables.
let existing_user_quota = null;
let new_user_quota = null;

//This could have been a lambda function
//We can set it up independently if time allows for it
router.post("/calculate_daily_tokens", async (req, res) => {
  try {
    const date = getFormattedDate();

    const existing_result = await getRecord("DailyTokenQuotas", date, "date");

    //This will prevent the same calculation from running more than once in a day
    if (existing_result.Item != null) {
      return res.status(204);
    }

    let remaining_tokens = 0;
    if (isFirstDayOfMonth()) {
      //Set the budget. Ideally this could be dynamically set, not a constant in the code
      remaining_tokens = 5000000;
    } else {
      const yestrday = getFormattedDate(-1);
      const spent_tokens = await getAmountSumBySortKey(
        "StudentTokens",
        "Date-index",
        yestrday
      );

      const yesterdays_quotas = await getRecord(
        "DailyTokenQuotas",
        yestrday,
        "date"
      );

      const yesterday_starting_tokens =
        yesterdays_quotas.record.Item.starting_tokens;
      remaining_tokens = yesterday_starting_tokens - spent_tokens;
    }

    //Count users
    const users = await getTableItemCount("Students");
    const remaining_days_in_month = getRemainingDaysInMonth();
    const total_daily_tokens = remaining_tokens / remaining_days_in_month;

    //We reserve the 10% of the daily tokens for newly registered users
    //We consider that the maximum daily users can't be more than 10%
    const existing_users_quota = (total_daily_tokens * 0.9) / users;
    const new_users_quota = (total_daily_tokens * 0.1) / (users / 10);

    //Save record to the database
    var daily_quota = {
      date,
      existing_users_quota,
      new_users_quota,
      users_count: users,
      starting_tokens: remaining_tokens,
    };

    const result = await addRecord("DailyTokenQuotas", daily_quota);

    existing_user_quota = existing_users_quota;
    new_user_quota = new_users_quota;

    res.json();
  } catch (error) {
    res.status(500).json({ error: "Failed to set daily count" });
  }
});

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

async function getDailyMaxTokens(studentId) {
  //TODO: Write a function that detects if the user was registered today
  //Use the correct variable based on the type of the user
}

//This should be used to reset the in memory values
async function resetDailyQuotas(studentId) {
  //TODO: This function shuold read from the db the daily quotas and set the local variables
}
