// config/constants.js

const TABLES = {
  STUDENTS: "Students",
  GRADES: "StudentGrades",
  STUDENT_COURSES: "StudentCourses",
  DAILYTOKENQUOTAS: "DailyTokenQuotas",
  STUDENTTOKENS: "StudentTokens",
  STUDENTCOURSES: "StudentCourses",
  COURSES: "Courses",
};

const DYNAMO_DB_INDEXES = {
  STUDENT_DATE_INDEX: "Date-index",
};

const GPT_OPTIONS = {
  //gpt-4o
  //gpt-4-turbo
  //Cheapest: gpt-3.5-turbo
  model: "gpt-4o",
  max_tokens: 400,
};

module.exports = {
  TABLES,
  DYNAMO_DB_INDEXES,
  GPT_OPTIONS,
};
