import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

// Get comprehensive performance analytics
export const getPerformanceAnalytics = query({
  args: { userId: v.optional(v.id("users")) },
  returns: v.object({
    overallStats: v.object({
      totalQuizzes: v.number(),
      averageScore: v.number(),
      averageAccuracy: v.number(),
      totalQuestions: v.number(),
      totalCorrect: v.number(),
      bestScore: v.number(),
      worstScore: v.number(),
      averageTimePerQuestion: v.number(),
      totalStudyTime: v.number(),
    }),
    categoryPerformance: v.array(
      v.object({
        category: v.string(),
        totalQuestions: v.number(),
        correctAnswers: v.number(),
        accuracy: v.number(),
        averageTime: v.number(),
        strength: v.union(
          v.literal("strong"),
          v.literal("needs_work"),
          v.literal("weak")
        ),
      })
    ),
    subcategoryPerformance: v.array(
      v.object({
        subcategory: v.string(),
        category: v.string(),
        totalQuestions: v.number(),
        correctAnswers: v.number(),
        accuracy: v.number(),
        averageTime: v.number(),
        strength: v.union(
          v.literal("strong"),
          v.literal("needs_work"),
          v.literal("weak")
        ),
        recentTrend: v.union(
          v.literal("improving"),
          v.literal("declining"),
          v.literal("stable")
        ),
      })
    ),
    difficultyPerformance: v.object({
      easy: v.object({
        total: v.number(),
        correct: v.number(),
        accuracy: v.number(),
      }),
      medium: v.object({
        total: v.number(),
        correct: v.number(),
        accuracy: v.number(),
      }),
      hard: v.object({
        total: v.number(),
        correct: v.number(),
        accuracy: v.number(),
      }),
    }),
    timeAnalysis: v.object({
      averageTimePerQuestion: v.number(),
      fastestCategory: v.string(),
      slowestCategory: v.string(),
      timeTrend: v.union(
        v.literal("improving"),
        v.literal("declining"),
        v.literal("stable")
      ),
    }),
    improvementAreas: v.array(
      v.object({
        subcategory: v.string(),
        category: v.string(),
        currentAccuracy: v.number(),
        questionsNeeded: v.number(),
        priority: v.union(
          v.literal("high"),
          v.literal("medium"),
          v.literal("low")
        ),
      })
    ),
    strengthAreas: v.array(
      v.object({
        subcategory: v.string(),
        category: v.string(),
        accuracy: v.number(),
        totalQuestions: v.number(),
      })
    ),
    recentProgress: v.array(
      v.object({
        date: v.string(),
        accuracy: v.number(),
        score: v.number(),
        questionsAnswered: v.number(),
      })
    ),
  }),
  handler: async (ctx, _args) => {
    const results = await ctx.db.query("quizResults").order("desc").collect();

    if (results.length === 0) {
      return {
        overallStats: {
          totalQuizzes: 0,
          averageScore: 0,
          averageAccuracy: 0,
          totalQuestions: 0,
          totalCorrect: 0,
          bestScore: 0,
          worstScore: 0,
          averageTimePerQuestion: 0,
          totalStudyTime: 0,
        },
        categoryPerformance: [],
        subcategoryPerformance: [],
        difficultyPerformance: {
          easy: { total: 0, correct: 0, accuracy: 0 },
          medium: { total: 0, correct: 0, accuracy: 0 },
          hard: { total: 0, correct: 0, accuracy: 0 },
        },
        timeAnalysis: {
          averageTimePerQuestion: 0,
          fastestCategory: "",
          slowestCategory: "",
          timeTrend: "stable" as const,
        },
        improvementAreas: [],
        strengthAreas: [],
        recentProgress: [],
      };
    }

    // Calculate overall stats
    const totalQuizzes = results.length;
    const totalQuestions = results.reduce(
      (sum, r) => sum + r.totalQuestions,
      0
    );
    const totalCorrect = results.reduce((sum, r) => sum + r.correctAnswers, 0);
    const totalStudyTime = results.reduce((sum, r) => sum + r.timeTaken, 0);
    const averageScore = Math.round(
      results.reduce((sum, r) => sum + r.score, 0) / totalQuizzes
    );
    const averageAccuracy = Math.round(
      results.reduce((sum, r) => sum + r.accuracy, 0) / totalQuizzes
    );
    const bestScore = Math.max(...results.map((r) => r.score));
    const worstScore = Math.min(...results.map((r) => r.score));
    const averageTimePerQuestion = Math.round(totalStudyTime / totalQuestions);

    // Analyze category performance
    const categoryStats: {
      [key: string]: { total: number; correct: number; time: number };
    } = {};
    const subcategoryStats: {
      [key: string]: {
        total: number;
        correct: number;
        time: number;
        category: string;
      };
    } = {};
    const difficultyStats = {
      easy: { total: 0, correct: 0 },
      medium: { total: 0, correct: 0 },
      hard: { total: 0, correct: 0 },
    };

    results.forEach((result) => {
      result.questions.forEach((q) => {
        // Skip investment banking category (fallback category)
        if (q.category === "Investment Banking") {
          return;
        }

        // Category stats
        if (!categoryStats[q.category]) {
          categoryStats[q.category] = { total: 0, correct: 0, time: 0 };
        }
        categoryStats[q.category].total++;
        categoryStats[q.category].time += q.timeTaken;
        if (q.isCorrect) categoryStats[q.category].correct++;

        // Subcategory stats
        if (q.subcategory) {
          const key = `${q.category}:${q.subcategory}`;
          if (!subcategoryStats[key]) {
            subcategoryStats[key] = {
              total: 0,
              correct: 0,
              time: 0,
              category: q.category,
            };
          }
          subcategoryStats[key].total++;
          subcategoryStats[key].time += q.timeTaken;
          if (q.isCorrect) subcategoryStats[key].correct++;
        }

        // Difficulty stats
        difficultyStats[q.difficulty as keyof typeof difficultyStats].total++;
        if (q.isCorrect)
          difficultyStats[q.difficulty as keyof typeof difficultyStats]
            .correct++;
      });
    });

    // Convert to arrays and calculate strengths
    const categoryPerformance = Object.entries(categoryStats).map(
      ([category, stats]) => {
        const accuracy = Math.round((stats.correct / stats.total) * 100);
        const averageTime = Math.round(stats.time / stats.total);
        let strength: "strong" | "needs_work" | "weak";
        if (accuracy >= 80) strength = "strong";
        else if (accuracy >= 60) strength = "needs_work";
        else strength = "weak";

        return {
          category,
          totalQuestions: stats.total,
          correctAnswers: stats.correct,
          accuracy,
          averageTime,
          strength,
        };
      }
    );

    const subcategoryPerformance = Object.entries(subcategoryStats).map(
      ([key, stats]) => {
        const [category, subcategory] = key.split(":");
        const accuracy = Math.round((stats.correct / stats.total) * 100);
        const averageTime = Math.round(stats.time / stats.total);
        let strength: "strong" | "needs_work" | "weak";
        if (accuracy >= 80) strength = "strong";
        else if (accuracy >= 60) strength = "needs_work";
        else strength = "weak";

        // Simple trend calculation (could be enhanced)
        const recentTrend: "improving" | "declining" | "stable" = "stable";

        return {
          subcategory,
          category,
          totalQuestions: stats.total,
          correctAnswers: stats.correct,
          accuracy,
          averageTime,
          strength,
          recentTrend,
        };
      }
    );

    // Calculate difficulty performance
    const difficultyPerformance = {
      easy: {
        total: difficultyStats.easy.total,
        correct: difficultyStats.easy.correct,
        accuracy:
          difficultyStats.easy.total > 0
            ? Math.round(
                (difficultyStats.easy.correct / difficultyStats.easy.total) *
                  100
              )
            : 0,
      },
      medium: {
        total: difficultyStats.medium.total,
        correct: difficultyStats.medium.correct,
        accuracy:
          difficultyStats.medium.total > 0
            ? Math.round(
                (difficultyStats.medium.correct /
                  difficultyStats.medium.total) *
                  100
              )
            : 0,
      },
      hard: {
        total: difficultyStats.hard.total,
        correct: difficultyStats.hard.correct,
        accuracy:
          difficultyStats.hard.total > 0
            ? Math.round(
                (difficultyStats.hard.correct / difficultyStats.hard.total) *
                  100
              )
            : 0,
      },
    };

    // Find improvement areas (weakest subcategories)
    const improvementAreas = subcategoryPerformance
      .filter((s) => s.strength === "weak")
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 10)
      .map((sub, index) => ({
        subcategory: sub.subcategory,
        category: sub.category,
        currentAccuracy: sub.accuracy,
        questionsNeeded: Math.max(5, 20 - sub.totalQuestions), // Need more questions for better analysis
        priority:
          index < 3
            ? ("high" as const)
            : index < 7
              ? ("medium" as const)
              : ("low" as const),
      }));

    // Find strength areas
    const strengthAreas = subcategoryPerformance
      .filter((s) => s.strength === "strong" && s.totalQuestions >= 3)
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 10);

    // Recent progress (last 10 quizzes)
    const recentProgress = results.slice(0, 10).map((r) => ({
      date: r.date,
      accuracy: r.accuracy,
      score: r.score,
      questionsAnswered: r.totalQuestions,
    }));

    // Time analysis - filter out Investment Banking
    const filteredCategoryPerformance = categoryPerformance.filter(cat => cat.category !== "Investment Banking");
    const fastestCategory = filteredCategoryPerformance.length > 0 
      ? filteredCategoryPerformance.reduce((fastest, current) =>
          current.averageTime < fastest.averageTime ? current : fastest
        ).category
      : "";
    const slowestCategory = filteredCategoryPerformance.length > 0
      ? filteredCategoryPerformance.reduce((slowest, current) =>
          current.averageTime > slowest.averageTime ? current : slowest
        ).category
      : "";

    return {
      overallStats: {
        totalQuizzes,
        averageScore,
        averageAccuracy,
        totalQuestions,
        totalCorrect,
        bestScore,
        worstScore,
        averageTimePerQuestion,
        totalStudyTime,
      },
      categoryPerformance,
      subcategoryPerformance,
      difficultyPerformance,
      timeAnalysis: {
        averageTimePerQuestion,
        fastestCategory,
        slowestCategory,
        timeTrend: "stable" as const,
      },
      improvementAreas,
      strengthAreas,
      recentProgress,
    };
  },
});

// Get detailed subcategory analysis
export const getSubcategoryAnalysis = query({
  args: {
    subcategory: v.string(),
    userId: v.optional(v.id("users")),
  },
  returns: v.object({
    subcategory: v.string(),
    category: v.string(),
    totalQuestions: v.number(),
    correctAnswers: v.number(),
    accuracy: v.number(),
    averageTime: v.number(),
    strength: v.union(
      v.literal("strong"),
      v.literal("needs_work"),
      v.literal("weak")
    ),
    commonMistakes: v.array(
      v.object({
        question: v.string(),
        userAnswer: v.string(),
        correctAnswer: v.string(),
        explanation: v.string(),
        date: v.string(),
      })
    ),
    difficultyBreakdown: v.object({
      easy: v.object({
        total: v.number(),
        correct: v.number(),
        accuracy: v.number(),
      }),
      medium: v.object({
        total: v.number(),
        correct: v.number(),
        accuracy: v.number(),
      }),
      hard: v.object({
        total: v.number(),
        correct: v.number(),
        accuracy: v.number(),
      }),
    }),
    recentPerformance: v.array(
      v.object({
        date: v.string(),
        accuracy: v.number(),
        questionsAnswered: v.number(),
      })
    ),
    recommendations: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const results = await ctx.db.query("quizResults").order("desc").collect();

    const subcategoryQuestions = results.flatMap((r) =>
      r.questions.filter(
        (q) =>
          q.subcategory === args.subcategory &&
          q.category !== "Investment Banking"
      )
    );

    if (subcategoryQuestions.length === 0) {
      return {
        subcategory: args.subcategory,
        category: "",
        totalQuestions: 0,
        correctAnswers: 0,
        accuracy: 0,
        averageTime: 0,
        strength: "weak" as const,
        commonMistakes: [],
        difficultyBreakdown: {
          easy: { total: 0, correct: 0, accuracy: 0 },
          medium: { total: 0, correct: 0, accuracy: 0 },
          hard: { total: 0, correct: 0, accuracy: 0 },
        },
        recentPerformance: [],
        recommendations: [
          "Start practicing this subcategory to build foundational knowledge",
        ],
      };
    }

    const totalQuestions = subcategoryQuestions.length;
    const correctAnswers = subcategoryQuestions.filter(
      (q) => q.isCorrect
    ).length;
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
    const averageTime = Math.round(
      subcategoryQuestions.reduce((sum, q) => sum + q.timeTaken, 0) /
        totalQuestions
    );
    const category = subcategoryQuestions[0].category;

    let strength: "strong" | "needs_work" | "weak";
    if (accuracy >= 80) strength = "strong";
    else if (accuracy >= 60) strength = "needs_work";
    else strength = "weak";

    // Common mistakes (incorrect answers)
    const commonMistakes = subcategoryQuestions
      .filter((q) => !q.isCorrect)
      .slice(0, 5)
      .map((q) => ({
        question: q.question,
        userAnswer: q.userAnswer,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        date: results.find((r) => r.questions.includes(q))?.date || "",
      }));

    // Difficulty breakdown
    const difficultyStats = {
      easy: { total: 0, correct: 0 },
      medium: { total: 0, correct: 0 },
      hard: { total: 0, correct: 0 },
    };
    subcategoryQuestions.forEach((q) => {
      difficultyStats[q.difficulty as keyof typeof difficultyStats].total++;
      if (q.isCorrect)
        difficultyStats[q.difficulty as keyof typeof difficultyStats].correct++;
    });

    const difficultyBreakdown = {
      easy: {
        total: difficultyStats.easy.total,
        correct: difficultyStats.easy.correct,
        accuracy:
          difficultyStats.easy.total > 0
            ? Math.round(
                (difficultyStats.easy.correct / difficultyStats.easy.total) *
                  100
              )
            : 0,
      },
      medium: {
        total: difficultyStats.medium.total,
        correct: difficultyStats.medium.correct,
        accuracy:
          difficultyStats.medium.total > 0
            ? Math.round(
                (difficultyStats.medium.correct /
                  difficultyStats.medium.total) *
                  100
              )
            : 0,
      },
      hard: {
        total: difficultyStats.hard.total,
        correct: difficultyStats.hard.correct,
        accuracy:
          difficultyStats.hard.total > 0
            ? Math.round(
                (difficultyStats.hard.correct / difficultyStats.hard.total) *
                  100
              )
            : 0,
      },
    };

    // Recent performance
    const recentPerformance = results
      .slice(0, 10)
      .map((r) => {
        const questions = r.questions.filter(
          (q) => q.subcategory === args.subcategory
        );
        const correct = questions.filter((q) => q.isCorrect).length;
        return {
          date: r.date,
          accuracy:
            questions.length > 0
              ? Math.round((correct / questions.length) * 100)
              : 0,
          questionsAnswered: questions.length,
        };
      })
      .filter((p) => p.questionsAnswered > 0);

    // Generate recommendations
    const recommendations = [];
    if (strength === "weak") {
      recommendations.push("Focus on foundational concepts in this area");
      recommendations.push("Practice with easier questions first");
      recommendations.push("Review the explanations for incorrect answers");
    } else if (strength === "needs_work") {
      recommendations.push("Continue practicing to improve consistency");
      recommendations.push("Focus on medium-difficulty questions");
      recommendations.push("Review common mistakes to avoid repetition");
    } else {
      recommendations.push("Great job! Try more challenging questions");
      recommendations.push("Help others by explaining concepts");
      recommendations.push("Maintain this level of performance");
    }

    return {
      subcategory: args.subcategory,
      category,
      totalQuestions,
      correctAnswers,
      accuracy,
      averageTime,
      strength,
      commonMistakes,
      difficultyBreakdown,
      recentPerformance,
      recommendations,
    };
  },
});

// Clean up existing quiz results with Investment Banking category
export const cleanupInvestmentBankingResults = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx, _args) => {
    const results = await ctx.db.query("quizResults").collect();
    
    for (const result of results) {
      let hasInvestmentBanking = false;
      const updatedQuestions = result.questions.map(q => {
        if (q.category === "Investment Banking") {
          hasInvestmentBanking = true;
          // Map Investment Banking questions to appropriate categories based on subcategory
          let newCategory = "Accounting"; // default fallback
          if (q.subcategory === "Valuation") newCategory = "Valuation";
          else if (q.subcategory === "LBO") newCategory = "LBO";
          else if (q.subcategory === "M&A") newCategory = "M&A";
          else if (q.subcategory === "Accounting") newCategory = "Accounting";
          
          return {
            ...q,
            category: newCategory
          };
        }
        return q;
      });
      
      if (hasInvestmentBanking) {
        await ctx.db.patch(result._id, {
          questions: updatedQuestions
        });
      }
    }
    
    return null;
  },
});

// Update performance insights
export const updatePerformanceInsights = internalMutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    // Check if insight already exists
    const existing = await ctx.db
      .query("performanceInsights")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("subcategory"), args.subcategory))
      .first();

    if (existing) {
      // Update existing insight
      await ctx.db.patch(existing._id, {
        accuracy: args.accuracy,
        totalQuestions: args.totalQuestions,
        correctAnswers: args.correctAnswers,
        wrongAnswers: args.wrongAnswers,
        patterns: args.patterns,
        lastUpdated: Date.now(),
      });
    } else {
      // Create new insight
      await ctx.db.insert("performanceInsights", {
        userId: args.userId,
        subcategory: args.subcategory,
        accuracy: args.accuracy,
        totalQuestions: args.totalQuestions,
        correctAnswers: args.correctAnswers,
        wrongAnswers: args.wrongAnswers,
        patterns: args.patterns,
        lastUpdated: Date.now(),
      });
    }
  },
});
