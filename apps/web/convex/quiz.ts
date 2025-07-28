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

// Test action to check if OpenRouter is working
export const testOpenRouter = action({
  args: {},
  handler: async (ctx, args) => {
    try {
      console.log("Testing OpenRouter API...");
      const openai = new (await import("openai")).default({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: "https://openrouter.ai/api/v1",
      });

      const completion = await openai.chat.completions.create({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: "Say hello" }],
        max_tokens: 10,
      });

      console.log("OpenRouter test successful:", completion.choices[0].message.content);
      return { success: true, message: completion.choices[0].message.content };
    } catch (error) {
      console.error("OpenRouter test failed:", error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

// Pre-generated questions as fallback
const FALLBACK_QUESTIONS = [
  {
    question: "What is the primary purpose of a P/E ratio in valuation?",
    options: [
      "To measure a company's debt levels",
      "To compare a company's stock price to its earnings",
      "To calculate a company's cash flow",
      "To determine a company's market share",
    ],
    answer: "To compare a company's stock price to its earnings",
    explanation: "The P/E ratio compares a company's stock price to its earnings per share, helping investors assess valuation.",
    category: "Investment Banking",
    subcategory: "Valuation",
    difficulty: "medium",
    points: 100,
    type: "pre-generated" as const,
  },
  {
    question: "In an LBO, what is the primary source of financing?",
    options: [
      "Equity from the acquiring company",
      "Debt financing",
      "Government grants",
      "Customer deposits",
    ],
    answer: "Debt financing",
    explanation: "LBOs are typically funded through debt, with the acquired company's cash flow used to pay it down.",
    category: "Investment Banking",
    subcategory: "LBO",
    difficulty: "medium",
    points: 100,
    type: "pre-generated" as const,
  },
  {
    question: "What is the main purpose of a fairness opinion in M&A?",
    options: [
      "To determine the final purchase price",
      "To provide an independent assessment of whether a deal is fair to shareholders",
      "To calculate the synergies",
      "To approve the transaction",
    ],
    answer: "To provide an independent assessment of whether a deal is fair to shareholders",
    explanation: "A fairness opinion ensures shareholders are getting reasonable value in a transaction.",
    category: "Investment Banking",
    subcategory: "M&A",
    difficulty: "medium",
    points: 100,
    type: "pre-generated" as const,
  },
  {
    question: "What happens to working capital if a company pays off $75 of accounts payable?",
    options: [
      "Working capital increases by $75",
      "Working capital decreases by $75",
      "Working capital remains unchanged",
      "Working capital increases by $150",
    ],
    answer: "Working capital remains unchanged",
    explanation: "Both current assets (cash) and current liabilities (accounts payable) decrease by $75, so working capital stays the same.",
    category: "Investment Banking",
    subcategory: "Accounting",
    difficulty: "medium",
    points: 100,
    type: "pre-generated" as const,
  },
  {
    question: "What is the impact of $50 depreciation expense on net income?",
    options: [
      "Net income increases by $50",
      "Net income decreases by $50",
      "Net income is unaffected",
      "Net income increases by $25",
    ],
    answer: "Net income decreases by $50",
    explanation: "Depreciation is an expense that reduces net income on the income statement.",
    category: "Investment Banking",
    subcategory: "Accounting",
    difficulty: "easy",
    points: 50,
    type: "pre-generated" as const,
  },
  {
    question: "What is the primary purpose of a DCF valuation?",
    options: [
      "To determine a company's current market value",
      "To estimate a company's intrinsic value based on future cash flows",
      "To calculate a company's book value",
      "To assess a company's historical performance",
    ],
    answer: "To estimate a company's intrinsic value based on future cash flows",
    explanation: "DCF valuation estimates a company's intrinsic value by discounting its projected future cash flows to present value.",
    category: "Investment Banking",
    subcategory: "Valuation",
    difficulty: "hard",
    points: 150,
    type: "pre-generated" as const,
  },
  {
    question: "What is the main advantage of using EV/EBITDA over P/E ratio?",
    options: [
      "It's easier to calculate",
      "It eliminates the impact of different capital structures and accounting policies",
      "It's more widely used",
      "It's more accurate for all companies",
    ],
    answer: "It eliminates the impact of different capital structures and accounting policies",
    explanation: "EV/EBITDA is capital structure neutral and less affected by accounting differences, making it better for comparing companies.",
    category: "Investment Banking",
    subcategory: "Valuation",
    difficulty: "hard",
    points: 150,
    type: "pre-generated" as const,
  },
];

// Generate a new question using AI
export const generateQuestion = action({
  args: { difficulty: v.string() },
  handler: async (ctx, args) => {
    console.log("Starting AI question generation for difficulty:", args.difficulty);
    
    try {
      // For now, just return a hardcoded question to test the flow
      // We'll add AI generation back once we confirm the basic flow works
      const hardcodedQuestion = {
        question: "What is the primary purpose of a P/E ratio in valuation?",
        options: [
          "To measure a company's debt levels",
          "To compare a company's stock price to its earnings",
          "To calculate a company's cash flow",
          "To determine a company's market share",
        ],
        answer: "To compare a company's stock price to its earnings",
        explanation: "The P/E ratio compares a company's stock price to its earnings per share, helping investors assess valuation.",
        category: "Investment Banking",
        subcategory: "Valuation",
        difficulty: args.difficulty,
        points: 100,
        type: "pre-generated" as const,
      };
      
      console.log("Returning hardcoded question for testing");
      return hardcodedQuestion;
    } catch (error) {
      console.error("Failed to generate question:", error);
      
      // Emergency fallback
      const emergencyQuestion = {
        question: "What is EBITDA?",
        options: [
          "Earnings Before Interest, Taxes, Depreciation, and Amortization",
          "Earnings Before Interest and Taxes",
          "Earnings Before Depreciation and Amortization",
          "Earnings Before Taxes",
        ],
        answer: "Earnings Before Interest, Taxes, Depreciation, and Amortization",
        explanation: "EBITDA is a measure of a company's operating performance.",
        category: "Investment Banking",
        subcategory: "Accounting",
        difficulty: args.difficulty,
        points: 100,
        type: "pre-generated" as const,
      };
      
      console.log("Using emergency fallback question");
      return emergencyQuestion;
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