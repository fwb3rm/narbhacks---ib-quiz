import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import JSON5 from 'json5';

console.log('DEBUG: OPENROUTER_API_KEY value:', process.env.OPENROUTER_API_KEY);

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY);

export async function generateQuestion() {
  const completion = await openrouter.chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
          `You are an expert in investment banking. Your task is to generate a multiple-choice question for an investment banking interview. The question should have 4 options, and one of them should be the correct answer. Return the question in JSON format with the following structure: { "question": "", "options": ["", "", "", ""], "answer": "", "explanation": "" }. IMPORTANT: Respond with ONLY the JSON object, no other text or markdown.`,      },
    ],
    model: 'google/gemini-2.0-flash-lite-001',
  });

  let rawContent = completion.choices[0].message.content || "";
  let questionContent = rawContent;

  // Remove markdown code block delimiters if present
  if (questionContent.startsWith('```json')) {
    questionContent = questionContent.substring('```json'.length);
    if (questionContent.endsWith('```')) {
      questionContent = questionContent.substring(0, questionContent.length - '```'.length);
    }
  }

  // Trim whitespace from the beginning and end
  questionContent = questionContent.trim();

  try {
    return JSON5.parse(questionContent);
  } catch (error) {
    console.error('Failed to parse AI response as JSON:', error);
    console.error('Raw content that failed to parse:', rawContent);
    console.error('Cleaned content that failed to parse:', questionContent);
    return null; // Return null on parsing error
  }
}

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3002'] }));

app.get('/generate-question', async (req, res) => {
  try {
    const question = await generateQuestion();
    if (!question) {
      return res.status(500).json({ error: 'No question generated or failed to parse' });
    }
    res.json(question);
  } catch (error) {
    console.error('Failed to generate question in route handler:', error);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

app.listen(port, () => {
  console.log(`Quiz API listening at http://localhost:${port}`);
});
