import { mutation, query, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Generate a lesson using AI
export const generateLesson = action({
  args: {
    subcategory: v.string(),
    difficulty: v.string(),
  },
  handler: async (ctx, args) => {
    const openai = new (await import("openai")).default({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const prompt = `You are an expert investment banking instructor creating a personalized, in-depth lesson for a student preparing for technical interviews. The topic is: "${args.subcategory}". The difficulty level is: "${args.difficulty}".

The student is an entry-level analyst candidate who struggles with this topic and wants to deeply understand the concepts, mechanics, real-world applications, and common interview questions.

**IMPORTANT: For ADVANCED/HARD difficulty levels, you MUST include:**
- Complex technical mechanics and calculations
- Sophisticated real-world scenarios with detailed numbers
- Industry-specific terminology and best practices
- Step-by-step calculations and formulas
- Complex scenarios with multiple variables
- Advanced modeling techniques and assumptions
- Common modeling errors and Excel approaches

**Content Requirements:**
- Create a comprehensive lesson with 4-6 key concepts
- Include detailed explanations with real-world examples
- Provide step-by-step calculations where applicable
- Include common mistakes and how to avoid them
- Create 3 practice questions with detailed explanations
- Use specific numbers and realistic scenarios

**Tone and Format Guidelines:**
- Avoid fluff and filler. Be direct, clear, and specific.
- Prioritize intuition + practical relevance over dense theory.
- Use whole numbers (e.g., $100 EBITDA, 5% interest rate) in examples.
- Include 4–6 key concepts that build up understanding progressively, each one can build on the last.
- Include key details that are important to know about the topic.
- Make the three practice questions representative of common interview mistakes.
- Explanations must be detailed, helpful, and refer back to key concepts.

Return the response as a JSON object with this exact structure:
{
  "title": "Lesson title",
  "summary": "Brief summary of the lesson",
  "keyConcepts": [
    {
      "title": "Concept title",
      "explanation": "Detailed explanation",
      "example": "Real-world example with numbers"
    }
  ],
  "commonMistakes": [
    "Common mistake 1",
    "Common mistake 2"
  ],
  "practiceQuestions": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "answer": "Correct answer",
      "explanation": "Detailed explanation"
    }
  ]
}`;

    try {
      const completion = await openai.chat.completions.create({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error("No content in response");
      }

      // Parse the JSON response
      const lessonData = JSON.parse(content);
      
      // Save the lesson to the database
      const lessonId = await ctx.runMutation(internal.lessons.saveGeneratedLesson, {
        title: lessonData.title,
        subcategory: args.subcategory,
        difficulty: args.difficulty,
        content: lessonData,
        createdAt: Date.now(),
      });

      return lessonData;
    } catch (error) {
      console.error("Error generating lesson:", error);
      throw new Error("Failed to generate lesson");
    }
  },
});

// Save generated lesson to database
export const saveGeneratedLesson = internalMutation({
  args: {
    title: v.string(),
    subcategory: v.string(),
    difficulty: v.string(),
    content: v.object({
      summary: v.string(),
      keyConcepts: v.array(v.object({
        title: v.string(),
        explanation: v.string(),
        example: v.string(),
      })),
      commonMistakes: v.array(v.string()),
      practiceQuestions: v.array(v.object({
        question: v.string(),
        options: v.array(v.string()),
        answer: v.string(),
        explanation: v.string(),
      })),
    }),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("lessons", {
      userId: undefined, // Will be updated when we add user authentication
      ...args,
    });
  },
});

// Get all lessons
export const getAllLessons = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("lessons").order("desc").collect();
  },
});

// Get lessons by subcategory
export const getLessonsBySubcategory = query({
  args: { subcategory: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lessons")
      .withIndex("by_subcategory", (q) => q.eq("subcategory", args.subcategory))
      .order("desc")
      .collect();
  },
});

// Get a specific lesson by ID
export const getLessonById = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.lessonId);
  },
}); 