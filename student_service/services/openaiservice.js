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
  Courses: "Courses",
  StudentCourses: "StudentCourses",
};
const { GPT_OPTIONS } = require("../constants");

async function getKnowledgeAreas(studentPrompt, chatHistory) {
  try {
    const kas = fs.readFileSync(knowledgeAreasFile, "utf8");

    const prompt = `
    You are an intelligent assistant designed to help students retrieve information about their university and grades. 
    Your task is to analyze a student's input prompt and determine which knowledge areas (database tables) are relevant to answering it.
    You will be provided with a list of example prompts and their corresponding knowledge areas from a CSV file. 
    Based on this, match the student's input prompt to as many relevant knowledge areas as possible, even if it partially relates to multiple areas. 
    Return a comma seperated list of matched knowledge areas, make sure the entries of the list are typed exactly how they're found in the CSV without spaces.
    When the question contains a grade make sure to include the 'Courses' knowledge area in your response list.
    
    Student Prompt: ${studentPrompt} 
    Chat History: ${chatHistory}
    Knolwdge Areas CSV:
    \`\`\` csv
    ${kas}
    \`\`\`
    `;

    const response = await openai.chat.completions.create({
      model: GPT_OPTIONS.model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: GPT_OPTIONS.max_tokens,
    });

    return {
      response: response.choices[0].message.content.split(","),
      tokens_spent: response.usage.total_tokens,
    };
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw new Error("Failed to generate feedback.");
  }
}

async function respondToPrompt(studentPrompt, context) {
  try {
    const prompt = `
        Assistant, you're helping students with their studies. 
        You'll get a question and the context. 
        Your job is to answer using only that context but not to let the student know that you have received any context.

        Instructions:
        0. IMPORTANT: Never indicate about how you retrieved the answer or mention JSON and Context.
        1. Understand the question clearly.
        2. Parse the JSON context to extract relevant information.
        3. If needed, process or filter data step by step.
        4. Formulate an accurate, helpful response based on the context.
        5. Ensure your response is kind and covers all parts of the question.
        6. Don't disclose sensitive information from the context.
        7. Base your answer only on the provided context; no external knowledge or assumptions.
        8. If the context lacks sufficient information, indicate that.
        9. For complex questions, explain your reasoning.
        10. Use appropriate formatting for clarity.
        11. Be respectful in your language.
        12. When a course Id is mentioned, provide the course name.

        Question: '\\${studentPrompt}'\ 
        Context:
        \`\`\`json
        ${JSON.stringify(context)}
        \`\`\`
        
        Again do not mention anything about context and provided information, give a straightforward kind answer!
        `;

    const response = await openai.chat.completions.create({
      model: GPT_OPTIONS.model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: GPT_OPTIONS.max_tokens,
    });

    return {
      response: response.choices[0].message.content,
      tokens_spent: response.usage.total_tokens,
    };
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw new Error("Failed to generate feedback.");
  }
}

module.exports = { respondToPrompt, getKnowledgeAreas, knowledgeAreas };
