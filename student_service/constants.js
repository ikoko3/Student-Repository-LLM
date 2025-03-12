// config/constants.js

const TABLES = {
  STUDENTS: "Students",
  GRADES: "StudentGrades",
  DAILYTOKENQUOTAS: "DailyTokenQuotas",
  STUDENTTOKENS: "StudentTokens",
};

const DYNAMO_DB_INDEXES = {
  STUDENT_DATE_INDEX: "Date-index",
};

const GPT_OPTIONS = {
  model: "gpt-3.5-turbo",
  max_tokens: 400,
};

module.exports = {
  TABLES,
  DYNAMO_DB_INDEXES,
  GPT_OPTIONS
};