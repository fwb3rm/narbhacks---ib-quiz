export interface Lesson {
  id: string;
  title: string;
  subcategory: string;
  summary: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: number; // in minutes
  keyConcepts: Array<{
    title: string;
    explanation: string;
    example: string;
  }>;
  commonMistakes: string[];
  practiceQuestions: Array<{
    question: string;
    options: string[];
    answer: string;
    explanation: string;
  }>;
  createdAt: string;
  personalizedInsights?: string[];
  wrongAnswerAnalysis?: string[];
}

export interface LessonRecommendation {
  subcategory: string;
  currentAccuracy: number;
  recommendedDifficulty: "beginner" | "intermediate" | "advanced";
  priority: "high" | "medium" | "low";
  reason: string;
  performanceInsights?: any;
}

const STORAGE_KEY = "investiq_lessons";

export class LessonService {
  static async generateLesson(
    subcategory: string,
    difficulty: "beginner" | "intermediate" | "advanced"
  ): Promise<Lesson> {
    const prompt = LessonService.buildPersonalizedLessonPrompt(subcategory, difficulty);

    try {
      const response = await fetch("http://localhost:3003/generate-lesson", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subcategory,
          difficulty,
          prompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const lessonData = await response.json();

      const lesson: Lesson = {
        id: Date.now().toString(),
        title: lessonData.title,
        subcategory,
        summary: lessonData.summary,
        difficulty,
        estimatedTime: lessonData.estimatedTime || 20,
        keyConcepts: lessonData.keyConcepts || [],
        commonMistakes: lessonData.commonMistakes || [],
        practiceQuestions: lessonData.practiceQuestions || [],
        createdAt: new Date().toISOString(),
        personalizedInsights: lessonData.personalizedInsights || [],
        wrongAnswerAnalysis: lessonData.wrongAnswerAnalysis || [],
      };

      LessonService.saveLesson(lesson);
      return lesson;
    } catch (error) {
      console.error("Error generating lesson:", error);
      throw error;
    }
  }

  static buildPersonalizedLessonPrompt(
    subcategory: string,
    difficulty: "beginner" | "intermediate" | "advanced"
  ): string {
    // Get user's performance data for this subcategory
    const { ProgressService } = require("./progress");
    const performanceInsights = ProgressService.getPerformanceInsights(subcategory);
    const wrongAnswers = ProgressService.getWrongAnswersBySubcategory(subcategory);
    const patterns = ProgressService.analyzeWrongAnswerPatterns(subcategory);

    // Build personalized context
    let personalizedContext = "";
    let wrongAnswerContext = "";

    if (performanceInsights.totalQuestions > 0) {
      personalizedContext = `
PERSONALIZED CONTEXT FOR THIS STUDENT:
- Current accuracy: ${performanceInsights.currentAccuracy}%
- Total questions attempted: ${performanceInsights.totalQuestions}
- Wrong answers: ${performanceInsights.patterns.totalWrongAnswers}
- Average time on wrong answers: ${performanceInsights.patterns.averageTimeOnWrongAnswers} seconds
- Improvement trend: ${performanceInsights.patterns.improvementTrend}
- Most frequent wrong answer: "${performanceInsights.patterns.mostFrequentWrongAnswer}"
- Conceptual gaps: ${performanceInsights.conceptualGaps.join(', ')}
- Recommended focus areas: ${performanceInsights.recommendedFocus.join(', ')}

SPECIFIC WRONG ANSWERS TO ADDRESS:
`;

      // Include specific wrong answers (limit to 5 most recent)
      const recentWrongAnswers = wrongAnswers
        .sort((a: any, b: any) => new Date(b.dateAnswered).getTime() - new Date(a.dateAnswered).getTime())
        .slice(0, 5);

      recentWrongAnswers.forEach((wrong: any, index: number) => {
        wrongAnswerContext += `
${index + 1}. Question: "${wrong.questionText.substring(0, 100)}..."
   Student answered: "${wrong.userAnswer}"
   Correct answer: "${wrong.correctAnswer}"
   Time taken: ${wrong.timeTaken} seconds
`;
      });

      if (patterns.commonMistakes.length > 0) {
        wrongAnswerContext += `
COMMON MISTAKE PATTERNS:
${patterns.commonMistakes.map((mistake: string, index: number) => `${index + 1}. ${mistake}`).join('\n')}
`;
      }
    }

    return `Create a comprehensive investment banking lesson on "${subcategory}" at ${difficulty} level.

${personalizedContext}
${wrongAnswerContext}

REQUIREMENTS:
- Make it practical and interview-focused
- Include real-world examples and calculations
- Provide step-by-step explanations
- Include practice questions with detailed explanations
- Focus on common interview questions and concepts
- Address the specific wrong answers and patterns shown above
- Provide targeted explanations for the student's common mistakes

FORMAT:
{
  "title": "Clear, engaging title",
  "summary": "Detailed lesson summary addressing the student's specific needs",
  "keyConcepts": [
    {
      "title": "Key concept title",
      "explanation": "Detailed explanation",
      "example": "Real-world example"
    }
  ],
  "commonMistakes": [
    "Common mistake 1 (address student's specific patterns)",
    "Common mistake 2",
    "Common mistake 3"
  ],
  "practiceQuestions": [
    {
      "question": "Practice question text",
      "options": ["A", "B", "C", "D"],
      "answer": "Correct answer",
      "explanation": "Detailed explanation of why this is correct"
    }
  ],
  "estimatedTime": 20,
  "personalizedInsights": [
    "Insight 1 based on student's performance",
    "Insight 2 based on student's patterns"
  ],
  "wrongAnswerAnalysis": [
    "Analysis of specific wrong answer 1",
    "Analysis of specific wrong answer 2"
  ]
}

Focus on making this lesson specifically address the student's weaknesses and common mistakes. If they have no history with this topic, provide a comprehensive foundational lesson.`;
  }

  static getLessonRecommendations(subcategoryPerformance: {
    [key: string]: { correct: number; total: number; accuracy: number };
  }): LessonRecommendation[] {
    const { ProgressService } = require("./progress");
    const recommendations: LessonRecommendation[] = [];

    Object.entries(subcategoryPerformance).forEach(([subcategory, stats]) => {
      let difficulty: "beginner" | "intermediate" | "advanced" = "intermediate";
      let priority: "high" | "medium" | "low" = "medium";
      let reason = "";

      // Get detailed performance insights
      const performanceInsights = ProgressService.getPerformanceInsights(subcategory);

      if (stats.accuracy < 50) {
        difficulty = "beginner";
        priority = "high";
        reason = "Low accuracy - needs review";
      } else if (stats.accuracy < 70) {
        difficulty = "intermediate";
        priority = "high";
        reason = "Below target - needs practice";
      } else if (stats.accuracy < 85) {
        difficulty = "intermediate";
        priority = "medium";
        reason = "Good - needs refinement";
      } else {
        difficulty = "advanced";
        priority = "low";
        reason = "Strong - ready for advanced";
      }

      // Keep it simple - just use the base reason without confusing focus areas
      // The lesson topic itself is already specific enough

      recommendations.push({
        subcategory,
        currentAccuracy: stats.accuracy,
        recommendedDifficulty: difficulty,
        priority,
        reason,
        performanceInsights,
      });
    });

    // Sort by priority (high first) then by accuracy (low first for high priority)
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      if (a.priority === "high") {
        return a.currentAccuracy - b.currentAccuracy;
      }
      return b.currentAccuracy - a.currentAccuracy;
    });
  }

  static saveLesson(lesson: Lesson): void {
    const lessons = LessonService.getAllLessons();
    lessons.push(lesson);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
  }

  static getAllLessons(): Lesson[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];

      const lessons = JSON.parse(stored);

      // Migrate all lessons to new structure
      const migratedLessons = lessons.map((lesson: any) =>
        LessonService.migrateLessonStructure(lesson)
      );

      // Update storage with migrated lessons
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedLessons));

      return migratedLessons;
    } catch (error) {
      console.error("Error loading lessons:", error);
      return [];
    }
  }

  static getLessonsBySubcategory(subcategory: string): Lesson[] {
    return LessonService.getAllLessons().filter(
      (lesson) => lesson.subcategory === subcategory
    );
  }

  static getLessonById(id: string): Lesson | null {
    const lesson = LessonService.getAllLessons().find(
      (lesson) => lesson.id === id
    );
    if (!lesson) return null;

    // Migrate old lesson structure to new structure
    return LessonService.migrateLessonStructure(lesson);
  }

  private static migrateLessonStructure(lesson: any): Lesson {
    // If lesson already has new structure, return as is
    if (lesson.keyConcepts && lesson.summary) {
      return lesson as Lesson;
    }

    // Migrate from old structure to new structure
    const migratedLesson: Lesson = {
      id: lesson.id,
      title: lesson.title,
      subcategory: lesson.subcategory,
      summary:
        lesson.content || `Comprehensive lesson on ${lesson.subcategory}`,
      difficulty: lesson.difficulty,
      estimatedTime: lesson.estimatedTime || 20,
      keyConcepts: lesson.keyPoints
        ? lesson.keyPoints.map((point: string) => ({
            title: point.split(":")[0] || point,
            explanation: point,
            example: `Example related to ${point}`,
          }))
        : [],
      commonMistakes: [
        "Not understanding the practical implications",
        "Focusing too much on theory without real-world application",
        "Missing key calculation steps",
      ],
      practiceQuestions: lesson.practiceQuestions || [],
      createdAt: lesson.createdAt,
      personalizedInsights: lesson.personalizedInsights || [],
      wrongAnswerAnalysis: lesson.wrongAnswerAnalysis || [],
    };

    // Update the lesson in storage with new structure
    const allLessons = LessonService.getAllLessons();
    const lessonIndex = allLessons.findIndex((l) => l.id === lesson.id);
    if (lessonIndex !== -1) {
      allLessons[lessonIndex] = migratedLesson;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allLessons));
    }

    return migratedLesson;
  }

  static clearAllLessons(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  // New method to generate targeted practice questions based on wrong answers
  static async generateTargetedPractice(subcategory: string): Promise<{
    questions: Array<{
      question: string;
      options: string[];
      answer: string;
      explanation: string;
    }>;
    focusAreas: string[];
  }> {
    const { ProgressService } = require("./progress");
    const performanceInsights = ProgressService.getPerformanceInsights(subcategory);
    const wrongAnswers = ProgressService.getWrongAnswersBySubcategory(subcategory);

    // Build prompt for targeted practice
    const prompt = `Generate 5 targeted practice questions for "${subcategory}" based on these wrong answers:

${wrongAnswers.slice(0, 3).map((wrong: any, index: number) => `
${index + 1}. Student answered: "${wrong.userAnswer}" (Correct: "${wrong.correctAnswer}")
   Question: "${wrong.questionText.substring(0, 100)}..."
`).join('\n')}

Common mistakes: ${performanceInsights.patterns.commonMistakes.join(', ')}

Generate questions that specifically address these weaknesses and common mistakes.`;

    try {
      const response = await fetch("http://localhost:3003/generate-targeted-practice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subcategory,
          prompt,
          wrongAnswers: wrongAnswers.slice(0, 5),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error generating targeted practice:", error);
      // Return fallback questions
      return {
        questions: [
          {
            question: `What is the primary purpose of ${subcategory} in investment banking?`,
            options: [
              "To increase company debt levels",
              "To improve financial analysis and decision-making",
              "To reduce company valuation",
              "To complicate deal structures unnecessarily",
            ],
            answer: "To improve financial analysis and decision-making",
            explanation: `${subcategory} helps investment bankers better understand and analyze companies.`,
          },
        ],
        focusAreas: ["Fundamental concepts", "Practical applications"],
      };
    }
  }
}
