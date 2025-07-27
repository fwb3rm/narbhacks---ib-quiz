import { mutation, query, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Generate detailed performance analysis
export const generatePerformanceAnalysis = action({
  args: {
    subcategory: v.string(),
    performanceData: v.object({
      accuracy: v.number(),
      totalQuestions: v.number(),
      correctAnswers: v.number(),
    }),
    wrongAnswers: v.array(v.object({
      question: v.string(),
      userAnswer: v.string(),
      correctAnswer: v.string(),
      explanation: v.string(),
      date: v.string(),
    })),
    patterns: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const openai = new (await import("openai")).default({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const prompt = `You are an expert investment banking instructor analyzing a student's performance in "${args.subcategory}".

**Student Performance Data:**
- Accuracy: ${args.performanceData.accuracy}%
- Total Questions: ${args.performanceData.totalQuestions}
- Correct Answers: ${args.performanceData.correctAnswers}

**Recent Wrong Answers:**
${args.wrongAnswers.map((wa, i) => `${i + 1}. Question: ${wa.question}
   Your Answer: ${wa.userAnswer}
   Correct Answer: ${wa.correctAnswer}
   Explanation: ${wa.explanation}`).join('\n\n')}

**Identified Patterns:**
${args.patterns.join(', ')}

Provide a detailed analysis with actionable insights. Return as JSON:
{
  "summary": "Overall performance summary",
  "keyWeaknesses": ["Weakness 1", "Weakness 2"],
  "improvementStrategies": ["Strategy 1", "Strategy 2"],
  "practiceFocus": ["Focus area 1", "Focus area 2"],
  "recommendedTopics": ["Topic 1", "Topic 2"]
}`;

    try {
      const completion = await openai.chat.completions.create({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error("No content in response");
      }

      // Parse the JSON response
      const analysisData = JSON.parse(content);
      
      // Save the analysis to the database
      const analysisId = await ctx.runMutation(internal.performance.savePerformanceAnalysis, {
        subcategory: args.subcategory,
        performanceData: args.performanceData,
        wrongAnswers: args.wrongAnswers,
        patterns: args.patterns,
        analysis: analysisData,
        lastUpdated: Date.now(),
      });

      return analysisData;
    } catch (error) {
      console.error("Error generating analysis:", error);
      throw new Error("Failed to generate analysis");
    }
  },
});

// Save performance analysis to database
export const savePerformanceAnalysis = internalMutation({
  args: {
    subcategory: v.string(),
    performanceData: v.object({
      accuracy: v.number(),
      totalQuestions: v.number(),
      correctAnswers: v.number(),
    }),
    wrongAnswers: v.array(v.object({
      question: v.string(),
      userAnswer: v.string(),
      correctAnswer: v.string(),
      explanation: v.string(),
      date: v.string(),
    })),
    patterns: v.array(v.string()),
    analysis: v.object({
      summary: v.string(),
      keyWeaknesses: v.array(v.string()),
      improvementStrategies: v.array(v.string()),
      practiceFocus: v.array(v.string()),
      recommendedTopics: v.array(v.string()),
    }),
    lastUpdated: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if analysis already exists for this subcategory
    const existing = await ctx.db
      .query("performanceInsights")
      .withIndex("by_subcategory", (q) => q.eq("subcategory", args.subcategory))
      .first();

    if (existing) {
      // Update existing analysis
      return await ctx.db.patch(existing._id, {
        accuracy: args.performanceData.accuracy,
        totalQuestions: args.performanceData.totalQuestions,
        correctAnswers: args.performanceData.correctAnswers,
        wrongAnswers: args.wrongAnswers,
        patterns: args.patterns,
        lastUpdated: args.lastUpdated,
      });
    } else {
      // Create new analysis
      return await ctx.db.insert("performanceInsights", {
        userId: undefined, // Will be updated when we add user authentication
        subcategory: args.subcategory,
        accuracy: args.performanceData.accuracy,
        totalQuestions: args.performanceData.totalQuestions,
        correctAnswers: args.performanceData.correctAnswers,
        wrongAnswers: args.wrongAnswers,
        patterns: args.patterns,
        lastUpdated: args.lastUpdated,
      });
    }
  },
});

// Get performance insights by subcategory
export const getPerformanceInsights = query({
  args: { subcategory: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("performanceInsights")
      .withIndex("by_subcategory", (q) => q.eq("subcategory", args.subcategory))
      .first();
  },
});

// Get all performance insights
export const getAllPerformanceInsights = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("performanceInsights").collect();
  },
});

// Calculate performance statistics
export const getPerformanceStats = query({
  args: {},
  handler: async (ctx) => {
    const quizResults = await ctx.db.query("quizResults").collect();
    
    if (quizResults.length === 0) {
      return {
        totalQuizzes: 0,
        averageAccuracy: 0,
        totalQuestions: 0,
        averageTime: 0,
      };
    }

    const totalQuizzes = quizResults.length;
    const totalAccuracy = quizResults.reduce((sum, result) => sum + result.accuracy, 0);
    const averageAccuracy = totalAccuracy / totalQuizzes;
    
    const totalQuestions = quizResults.reduce((sum, result) => sum + result.totalQuestions, 0);
    const totalTime = quizResults.reduce((sum, result) => sum + result.timeTaken, 0);
    const averageTime = totalTime / totalQuizzes;

    return {
      totalQuizzes,
      averageAccuracy,
      totalQuestions,
      averageTime,
    };
  },
}); 