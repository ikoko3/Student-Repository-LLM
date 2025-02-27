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
  Unknown: "Unknown",
  Students: "Students",
  Grades: "Grades",
};

async function getKnowledgeAreas(studentPrompt) {
  try {
    const kas = fs.readFileSync(knowledgeAreasFile, "utf8");

    const prompt = `
    Given the student's question '${studentPrompt}' and the CSV file with knowledge areas, match the question with the relevant knowledge areas. 
    Return ONLY the values from the knowledge area column, and for questions that match multiple knowledge areas, return all the corresponding names in a comma-separated list.
    \`\`\` csv
    ${kas}
    \`\`\`
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 250,
    });

    return response.choices[0].message.content.split(",");
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw new Error("Failed to generate feedback.");
  }
}

async function respondToPrompt(studentPrompt, context) {
  try {
    const prompt = `A student has asked:
        '\\${studentPrompt}'\ 
        Based on the following JSON with contains the student's information, return the answer to their question as if you are talking to the student without specifying the source of information.
        If the question cannot be answered using the JSON, request more clarity.
        \`\`\`json
        ${JSON.stringify(context)}
        \`\`\`}`;

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

module.exports = { respondToPrompt, getKnowledgeAreas, knowledgeAreas };
