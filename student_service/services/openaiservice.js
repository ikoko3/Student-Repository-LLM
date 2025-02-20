require("dotenv").config();
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates feedback for a student's grade.
 * @param {string} studentName - Name of the student.
 * @param {string} subject - Subject name.
 * @param {number} score - Student's score (out of 100).
 * @returns {Promise<string>} - AI-generated feedback.
 */
async function generateGradeFeedback(studentName, subject, score) {
  try {
    const prompt = `A student named ${studentName} scored ${score}/100 in ${subject}. Provide a short, encouraging feedback.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 20,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw new Error("Failed to generate feedback.");
  }
}

module.exports = { generateGradeFeedback };
