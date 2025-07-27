export interface QuizResult {
  id: string;
  date: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  timeTaken: number;
  questions: Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
    isCorrect: boolean;
    category: string;
    subcategory?: string;
    difficulty: string;
    points: number;
    timeTaken: number;
  }>;
  subcategories?: {
    [key: string]: {
      correct: number;
      total: number;
      accuracy: number;
    };
  };
}

export interface QuestionHistory {
  id: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  subcategory: string;
  category: string;
  difficulty: string;
  dateAnswered: string;
  timeTaken: number;
  explanation: string;
  quizSessionId: string;
  points: number;
}

export interface WrongAnswerPattern {
  subcategory: string;
  commonMistakes: string[];
  totalWrongAnswers: number;
  averageTimeOnWrongAnswers: number;
  mostFrequentWrongAnswer: string;
  improvementTrend: 'improving' | 'declining' | 'stable';
}

export interface PerformanceInsight {
  subcategory: string;
  currentAccuracy: number;
  totalQuestions: number;
  wrongAnswers: QuestionHistory[];
  patterns: WrongAnswerPattern;
  conceptualGaps: string[];
  recommendedFocus: string[];
  timeSpent: number;
  lastAttempted: string;
}

const STORAGE_KEY = "investiq_quiz_results";
const QUESTION_HISTORY_KEY = "investiq_question_history";

export class ProgressService {
  static saveQuizResult(result: Omit<QuizResult, "id">): QuizResult {
    const results = ProgressService.getAllResults();
    const newResult: QuizResult = {
      ...result,
      id: Date.now().toString(),
      accuracy: Math.round(
        (result.correctAnswers / result.totalQuestions) * 100
      ),
    };

    results.push(newResult);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));

    // Save individual question history
    ProgressService.saveQuestionHistory(newResult);

    return newResult;
  }

  static saveQuestionHistory(quizResult: QuizResult): void {
    const questionHistory = ProgressService.getAllQuestionHistory();
    
    quizResult.questions.forEach((question) => {
      const historyItem: QuestionHistory = {
        id: `${quizResult.id}_${Date.now()}_${Math.random()}`,
        questionText: question.question,
        userAnswer: question.userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: question.isCorrect,
        subcategory: question.subcategory || 'Unknown',
        category: question.category,
        difficulty: question.difficulty,
        dateAnswered: quizResult.date,
        timeTaken: question.timeTaken,
        explanation: question.explanation,
        quizSessionId: quizResult.id,
        points: question.points,
      };
      
      questionHistory.push(historyItem);
    });

    localStorage.setItem(QUESTION_HISTORY_KEY, JSON.stringify(questionHistory));
  }

  static getAllQuestionHistory(): QuestionHistory[] {
    try {
      const stored = localStorage.getItem(QUESTION_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading question history:", error);
      return [];
    }
  }

  static getQuestionHistoryBySubcategory(subcategory: string): QuestionHistory[] {
    const allHistory = ProgressService.getAllQuestionHistory();
    return allHistory.filter(q => q.subcategory === subcategory);
  }

  static getWrongAnswersBySubcategory(subcategory: string): QuestionHistory[] {
    const subcategoryHistory = ProgressService.getQuestionHistoryBySubcategory(subcategory);
    return subcategoryHistory.filter(q => !q.isCorrect);
  }

  static analyzeWrongAnswerPatterns(subcategory: string): WrongAnswerPattern {
    const wrongAnswers = ProgressService.getWrongAnswersBySubcategory(subcategory);
    
    if (wrongAnswers.length === 0) {
      return {
        subcategory,
        commonMistakes: [],
        totalWrongAnswers: 0,
        averageTimeOnWrongAnswers: 0,
        mostFrequentWrongAnswer: '',
        improvementTrend: 'stable'
      };
    }

    // Analyze common mistakes based on content, not just answer choices
    const mistakeCounts: { [key: string]: number } = {};
    wrongAnswers.forEach(q => {
      // Create a more meaningful mistake pattern based on content
      const mistake = `"${q.userAnswer}" instead of "${q.correctAnswer}"`;
      mistakeCounts[mistake] = (mistakeCounts[mistake] || 0) + 1;
    });

    const commonMistakes = Object.entries(mistakeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([mistake]) => mistake);

    // Calculate average time on wrong answers
    const totalTime = wrongAnswers.reduce((sum, q) => sum + q.timeTaken, 0);
    const averageTime = totalTime / wrongAnswers.length;

    // Find most frequent wrong answer content
    const wrongAnswerContentCounts: { [key: string]: number } = {};
    wrongAnswers.forEach(q => {
      wrongAnswerContentCounts[q.userAnswer] = (wrongAnswerContentCounts[q.userAnswer] || 0) + 1;
    });

    const mostFrequentWrongAnswer = Object.entries(wrongAnswerContentCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    // Analyze improvement trend (simplified - could be enhanced)
    const recentWrongAnswers = wrongAnswers
      .filter(q => new Date(q.dateAnswered) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const olderWrongAnswers = wrongAnswers
      .filter(q => new Date(q.dateAnswered) <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

    let improvementTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentWrongAnswers.length > 0 && olderWrongAnswers.length > 0) {
      const recentRate = recentWrongAnswers.length / 7; // per day
      const olderRate = olderWrongAnswers.length / 7;
      if (recentRate < olderRate * 0.8) improvementTrend = 'improving';
      else if (recentRate > olderRate * 1.2) improvementTrend = 'declining';
    }

    return {
      subcategory,
      commonMistakes,
      totalWrongAnswers: wrongAnswers.length,
      averageTimeOnWrongAnswers: Math.round(averageTime),
      mostFrequentWrongAnswer,
      improvementTrend
    };
  }

  // New method to analyze conceptual misunderstandings
  static analyzeConceptualGaps(subcategory: string): string[] {
    const wrongAnswers = ProgressService.getWrongAnswersBySubcategory(subcategory);
    const gaps: string[] = [];

    if (wrongAnswers.length === 0) return gaps;

    // Analyze patterns in wrong answers to identify conceptual gaps
    const answerPatterns: { [key: string]: number } = {};
    
    wrongAnswers.forEach(q => {
      // Look for patterns in the wrong answers that suggest conceptual misunderstandings
      const wrongAnswer = q.userAnswer.toLowerCase();
      const correctAnswer = q.correctAnswer.toLowerCase();
      
      // Common conceptual confusions with very concise descriptions
      if (wrongAnswer.includes('comparable') && correctAnswer.includes('dcf')) {
        answerPatterns['DCF vs Comparables'] = (answerPatterns['DCF vs Comparables'] || 0) + 1;
      }
      if (wrongAnswer.includes('equity') && correctAnswer.includes('enterprise')) {
        answerPatterns['Equity vs Enterprise Value'] = (answerPatterns['Equity vs Enterprise Value'] || 0) + 1;
      }
      if (wrongAnswer.includes('debt') && correctAnswer.includes('equity')) {
        answerPatterns['Debt vs Equity'] = (answerPatterns['Debt vs Equity'] || 0) + 1;
      }
      if (wrongAnswer.includes('revenue') && correctAnswer.includes('ebitda')) {
        answerPatterns['Revenue vs EBITDA'] = (answerPatterns['Revenue vs EBITDA'] || 0) + 1;
      }
      if (wrongAnswer.includes('cash') && correctAnswer.includes('accrual')) {
        answerPatterns['Cash vs Accrual'] = (answerPatterns['Cash vs Accrual'] || 0) + 1;
      }
      if (wrongAnswer.includes('operating') && correctAnswer.includes('capital')) {
        answerPatterns['Operating vs Capital'] = (answerPatterns['Operating vs Capital'] || 0) + 1;
      }
      if (wrongAnswer.includes('fifo') && correctAnswer.includes('lifo')) {
        answerPatterns['FIFO vs LIFO'] = (answerPatterns['FIFO vs LIFO'] || 0) + 1;
      }
      if (wrongAnswer.includes('wacc') && correctAnswer.includes('cost of equity')) {
        answerPatterns['WACC vs Cost of Equity'] = (answerPatterns['WACC vs Cost of Equity'] || 0) + 1;
      }
      if (wrongAnswer.includes('terminal') && correctAnswer.includes('explicit')) {
        answerPatterns['Terminal vs Explicit'] = (answerPatterns['Terminal vs Explicit'] || 0) + 1;
      }
      if (wrongAnswer.includes('synergy') && correctAnswer.includes('goodwill')) {
        answerPatterns['Synergies vs Goodwill'] = (answerPatterns['Synergies vs Goodwill'] || 0) + 1;
      }
    });

    // Return the most common conceptual gaps
    return Object.entries(answerPatterns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([gap]) => gap);
  }

  static getPerformanceInsights(subcategory: string): PerformanceInsight {
    const allHistory = ProgressService.getQuestionHistoryBySubcategory(subcategory);
    const wrongAnswers = ProgressService.getWrongAnswersBySubcategory(subcategory);
    const patterns = ProgressService.analyzeWrongAnswerPatterns(subcategory);
    
    const currentAccuracy = allHistory.length > 0 
      ? Math.round(((allHistory.length - wrongAnswers.length) / allHistory.length) * 100)
      : 0;

    const timeSpent = allHistory.reduce((sum, q) => sum + q.timeTaken, 0);
    const lastAttempted = allHistory.length > 0 
      ? allHistory[allHistory.length - 1].dateAnswered 
      : '';

    // Analyze conceptual gaps
    const conceptualGaps = ProgressService.analyzeConceptualGaps(subcategory);

    // Generate recommended focus areas based on patterns
    const recommendedFocus: string[] = [];
    if (patterns.commonMistakes.length > 0) {
      recommendedFocus.push(`Focus on: ${patterns.commonMistakes[0]}`);
    }
    if (conceptualGaps.length > 0) {
      recommendedFocus.push(`Address: ${conceptualGaps[0]}`);
    }
    if (patterns.averageTimeOnWrongAnswers > 120) {
      recommendedFocus.push('Practice time management');
    }
    if (patterns.improvementTrend === 'declining') {
      recommendedFocus.push('Review fundamental concepts');
    }

    return {
      subcategory,
      currentAccuracy,
      totalQuestions: allHistory.length,
      wrongAnswers,
      patterns,
      conceptualGaps,
      recommendedFocus,
      timeSpent,
      lastAttempted
    };
  }

  static getAllResults(): QuizResult[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading quiz results:", error);
      return [];
    }
  }

  static getResultsByPeriod(period: "week" | "month" | "all"): QuizResult[] {
    const allResults = ProgressService.getAllResults();
    const now = new Date();

    switch (period) {
      case "week": {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return allResults.filter((result) => new Date(result.date) >= weekAgo);
      }
      case "month": {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return allResults.filter((result) => new Date(result.date) >= monthAgo);
      }
      default:
        return allResults;
    }
  }

  static getBestScore(): number {
    const results = ProgressService.getAllResults();
    return results.length > 0 ? Math.max(...results.map((r) => r.score)) : 0;
  }

  static getAverageScore(): number {
    const results = ProgressService.getAllResults();
    if (results.length === 0) return 0;
    const total = results.reduce((sum, r) => sum + r.score, 0);
    return Math.round(total / results.length);
  }

  static getAverageAccuracy(): number {
    const results = ProgressService.getAllResults();
    if (results.length === 0) return 0;
    const total = results.reduce((sum, r) => sum + r.accuracy, 0);
    return Math.round(total / results.length);
  }

  static getSubcategoryPerformance(): {
    [key: string]: { correct: number; total: number; accuracy: number };
  } {
    const results = ProgressService.getAllResults();
    const subcategories: {
      [key: string]: { correct: number; total: number; accuracy: number };
    } = {};

    results.forEach((result) => {
      result.questions.forEach((q) => {
        if (q.subcategory) {
          const sub = q.subcategory;
          if (!subcategories[sub]) {
            subcategories[sub] = { correct: 0, total: 0, accuracy: 0 };
          }
          subcategories[sub].total++;
          if (q.isCorrect) {
            subcategories[sub].correct++;
          }
        }
      });
    });

    // Calculate accuracy for each subcategory
    Object.keys(subcategories).forEach((sub) => {
      const data = subcategories[sub];
      data.accuracy = Math.round((data.correct / data.total) * 100);
    });

    return subcategories;
  }

  static getWeakestSubcategories(limit: number = 5): PerformanceInsight[] {
    const allHistory = ProgressService.getAllQuestionHistory();
    const subcategories = Array.from(new Set(allHistory.map(q => q.subcategory)));
    
    const insights = subcategories
      .map(sub => ProgressService.getPerformanceInsights(sub))
      .filter(insight => insight.totalQuestions > 0)
      .sort((a, b) => {
        // Prioritize subcategories with more questions and lower accuracy
        // Calculate a "weakness score" that considers both factors
        const aWeaknessScore = (100 - a.currentAccuracy) * Math.min(a.totalQuestions / 5, 1); // Normalize by 5 questions
        const bWeaknessScore = (100 - b.currentAccuracy) * Math.min(b.totalQuestions / 5, 1);
        
        // If both have similar weakness scores, prioritize the one with more questions
        if (Math.abs(aWeaknessScore - bWeaknessScore) < 10) {
          return b.totalQuestions - a.totalQuestions;
        }
        
        return bWeaknessScore - aWeaknessScore; // Higher weakness score first
      })
      .slice(0, limit);

    return insights;
  }

  static getRecentWrongAnswers(days: number = 7): QuestionHistory[] {
    const allHistory = ProgressService.getAllQuestionHistory();
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return allHistory
      .filter(q => !q.isCorrect && new Date(q.dateAnswered) >= cutoffDate)
      .sort((a, b) => new Date(b.dateAnswered).getTime() - new Date(a.dateAnswered).getTime());
  }

  static clearAllResults(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(QUESTION_HISTORY_KEY);
  }

  // Method to get performance insights with minimum question threshold
  static getWeakestSubcategoriesWithThreshold(limit: number = 5, minQuestions: number = 2): PerformanceInsight[] {
    const allHistory = ProgressService.getAllQuestionHistory();
    const subcategories = Array.from(new Set(allHistory.map(q => q.subcategory)));
    
    const insights = subcategories
      .map(sub => ProgressService.getPerformanceInsights(sub))
      .filter(insight => insight.totalQuestions >= minQuestions) // Only include subcategories with enough questions
      .sort((a, b) => {
        // Prioritize subcategories with more questions and lower accuracy
        // Calculate a "weakness score" that considers both factors
        const aWeaknessScore = (100 - a.currentAccuracy) * Math.min(a.totalQuestions / 5, 1); // Normalize by 5 questions
        const bWeaknessScore = (100 - b.currentAccuracy) * Math.min(b.totalQuestions / 5, 1);
        
        // If both have similar weakness scores, prioritize the one with more questions
        if (Math.abs(aWeaknessScore - bWeaknessScore) < 10) {
          return b.totalQuestions - a.totalQuestions;
        }
        
        return bWeaknessScore - aWeaknessScore; // Higher weakness score first
      })
      .slice(0, limit);

    return insights;
  }

  // Method to get all subcategories with performance data
  static getAllSubcategoriesWithPerformance(): PerformanceInsight[] {
    const allHistory = ProgressService.getAllQuestionHistory();
    const subcategories = Array.from(new Set(allHistory.map(q => q.subcategory)));
    
    return subcategories
      .map(sub => ProgressService.getPerformanceInsights(sub))
      .filter(insight => insight.totalQuestions > 0)
      .sort((a, b) => b.totalQuestions - a.totalQuestions); // Sort by number of questions (most attempted first)
  }
}
