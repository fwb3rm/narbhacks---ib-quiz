import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Store trained AI knowledge
export const storeTrainingData = mutation({
  args: {
    category: v.string(),
    subcategory: v.optional(v.string()),
    content: v.string(),
    keyConcepts: v.array(v.string()),
    formulas: v.array(v.string()),
    interviewQuestions: v.array(v.string()),
    bestPractices: v.array(v.string()),
    pitfalls: v.array(v.string()),
    sourceFile: v.string(),
  },
  returns: v.id("trainingData"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("trainingData", {
      category: args.category,
      subcategory: args.subcategory || "",
      content: args.content,
      keyConcepts: args.keyConcepts,
      formulas: args.formulas,
      interviewQuestions: args.interviewQuestions,
      bestPractices: args.bestPractices,
      pitfalls: args.pitfalls,
      sourceFile: args.sourceFile,
      createdAt: Date.now(),
    });
  },
});

// Get training data for a specific category
export const getTrainingData = query({
  args: {
    category: v.string(),
    subcategory: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("trainingData"),
      _creationTime: v.number(),
      category: v.string(),
      subcategory: v.string(),
      content: v.string(),
      keyConcepts: v.array(v.string()),
      formulas: v.array(v.string()),
      interviewQuestions: v.array(v.string()),
      bestPractices: v.array(v.string()),
      pitfalls: v.array(v.string()),
      sourceFile: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    let query = ctx.db.query("trainingData");
    
    if (args.subcategory) {
      query = query.filter((q) => 
        q.and(
          q.eq(q.field("category"), args.category),
          q.eq(q.field("subcategory"), args.subcategory)
        )
      );
    } else {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }
    
    return await query.order("desc").collect();
  },
});

// Get all training data
export const getAllTrainingData = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("trainingData"),
      _creationTime: v.number(),
      category: v.string(),
      subcategory: v.string(),
      content: v.string(),
      keyConcepts: v.array(v.string()),
      formulas: v.array(v.string()),
      interviewQuestions: v.array(v.string()),
      bestPractices: v.array(v.string()),
      pitfalls: v.array(v.string()),
      sourceFile: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db.query("trainingData").order("desc").collect();
  },
}); 