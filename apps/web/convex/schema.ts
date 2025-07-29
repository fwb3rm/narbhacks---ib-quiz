import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table to store user information
  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    createdAt: v.number(),
  }),

  // Quiz results table to store quiz performance
  quizResults: defineTable({
    userId: v.optional(v.id("users")),
    date: v.string(),
    score: v.number(),
    totalQuestions: v.number(),
    correctAnswers: v.number(),
    accuracy: v.number(),
    timeTaken: v.number(),
    questions: v.array(
      v.object({
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
      })
    ),
  })
    .index("by_user", ["userId"])
    .index("by_date", ["date"]),

  // Lessons table to store generated lessons
  lessons: defineTable({
    userId: v.optional(v.id("users")),
    title: v.string(),
    subcategory: v.string(),
    difficulty: v.string(),
    content: v.object({
      summary: v.string(),
      keyConcepts: v.array(
        v.object({
          title: v.string(),
          explanation: v.string(),
          example: v.string(),
        })
      ),
      commonMistakes: v.array(v.string()),
      practiceQuestions: v.array(
        v.object({
          question: v.string(),
          options: v.array(v.string()),
          answer: v.string(),
          explanation: v.string(),
        })
      ),
    }),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_subcategory", ["subcategory"]),

  // Questions table to store AI-generated questions
  questions: defineTable({
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
  })
    .index("by_difficulty", ["difficulty"])
    .index("by_category", ["category"]),

  // Performance insights table for detailed analysis
  performanceInsights: defineTable({
    userId: v.optional(v.id("users")),
    subcategory: v.string(),
    accuracy: v.number(),
    totalQuestions: v.number(),
    correctAnswers: v.number(),
    wrongAnswers: v.array(
      v.object({
        question: v.string(),
        userAnswer: v.string(),
        correctAnswer: v.string(),
        explanation: v.string(),
        date: v.string(),
      })
    ),
    patterns: v.array(v.string()),
    lastUpdated: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_subcategory", ["subcategory"]),
});
