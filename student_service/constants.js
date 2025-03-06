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

module.exports = {
  TABLES,
  DYNAMO_DB_INDEXES,
};
