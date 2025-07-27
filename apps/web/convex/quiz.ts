import { mutation, query, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Save quiz result
export const saveQuizResult = mutation({
  args: {
    date: v.string(),
    score: v.number(),
    totalQuestions: v.number(),
    correctAnswers: v.number(),
    accuracy: v.number(),
    timeTaken: v.number(),
    questions: v.array(v.object({
      question: v.string(),
      userAnswer: v.string(),
      correctAnswer: v.string(),
      explanation: v.string(),
      isCorrect: v.boolean(),
      category: v.string(),
      subcategory: v.optional(v.string()),
      difficulty: v.string(),
      points: v.number(),
      timeTaken: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("quizResults", {
      userId: undefined, // Will be updated when we add user authentication
      ...args,
    });
  },
});

// Get all quiz results
export const getAllQuizResults = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("quizResults").order("desc").collect();
  },
});

// Get quiz results by user (when we add authentication)
export const getQuizResultsByUser = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return await ctx.db.query("quizResults").order("desc").collect();
    }
    return await ctx.db
      .query("quizResults")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Generate a new question using AI
export const generateQuestion = action({
  args: { difficulty: v.string() },
  handler: async (ctx, args) => {
    const openai = new (await import("openai")).default({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const prompt = `Generate a ${args.difficulty} difficulty investment banking quiz question. The question should be about financial modeling, valuation, M&A, or related topics.

Return the response as a JSON object with this exact structure:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answer": "The correct option (exactly as written in options array)",
  "explanation": "Detailed explanation of why this is correct",
  "category": "Investment Banking",
  "subcategory": "Specific topic (e.g., DCF, Comparable Companies, etc.)",
  "difficulty": "${args.difficulty}",
  "points": 100,
  "type": "ai-generated"
}`;

    try {
      const completion = await openai.chat.completions.create({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error("No content in response");
      }

      // Parse the JSON response
      const questionData = JSON.parse(content);
      
      // Save the question to the database
      const questionId = await ctx.runMutation(internal.quiz.saveGeneratedQuestion, {
        ...questionData,
        createdAt: Date.now(),
      });

      return questionData;
    } catch (error) {
      console.error("Error generating question:", error);
      throw new Error("Failed to generate question");
    }
  },
});

// Save generated question to database
export const saveGeneratedQuestion = internalMutation({
  args: {
    question: v.string(),
    options: v.array(v.string()),
    answer: v.string(),
    explanation: v.string(),
    category: v.string(),
    subcategory: v.optional(v.string()),
    difficulty: v.string(),
    points: v.number(),
    type: v.union(v.literal("pre-generated"), v.literal("ai-generated")),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("questions", args);
  },
});

// Get a random question by difficulty
export const getRandomQuestion = query({
  args: { difficulty: v.string() },
  handler: async (ctx, args) => {
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_difficulty", (q) => q.eq("difficulty", args.difficulty))
      .collect();
    
    if (questions.length === 0) {
      return null;
    }
    
    // Return a random question
    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
  },
}); 