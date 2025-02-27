require("dotenv").config();
const { OpenAI } = require("openai");
const fs = require("fs");
const path = require("path");

// Specify the path to your file
const knowledgeAreasFile = path.join("llm-context", "knowledgeareas.csv");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const knowledgeAreas = {
  Students: "Students",
  Grades: "Grades",
  Unknown: "Unknown",
};

async function getKnowledgeAreas(studentPrompt) {
  try {
    //return ["Grades"];
    const kas = fs.readFileSync(knowledgeAreasFile, "utf8");

    const prompt = `A student provided this prompt:--${studentPrompt}--,
    I have these knowledge areas (in csv format): ${kas}.
    Match semanticly the user prompt with the templates and respond with the most relevant tables (comma separated values) or with Unknown.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 50,
    });

    return response.choices[0].message.content.split(",");
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw new Error("Failed to generate feedback.");
  }
}

async function respondToPrompt(studentPrompt, context) {
  try {
    const prompt = `A student asked this: -- ${studentPrompt} --. I have this information: -- ${context}--. Reply with the infomration or request clarity.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 50,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw new Error("Failed to generate feedback.");
  }
}

module.exports = { respondToPrompt, getKnowledgeAreas };
