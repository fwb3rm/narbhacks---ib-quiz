"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  BarChart3,
  BookMarked,
  BookOpen,
  Brain,
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  Play,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import InteractiveQuestion from "@/components/InteractiveQuestion";
import { api } from "../../../convex/_generated/api";

// Comprehensive list of all available subcategories
const ALL_SUBCATEGORIES = {
  accounting: [
    "Income Statement Breakdown",
    "Balance Sheet Breakdown",
    "Cash Flow Statement Breakdown",
    "3-Statement Linkages",
    "Accrual vs Cash Accounting",
    "Depreciation & Amortization",
    "Working Capital",
    "Inventory Methods (FIFO, LIFO)",
    "Lease Accounting (Operating vs Capital)",
    "Deferred Taxes",
    "Stock-Based Compensation",
    "Asset Write-Downs & Impairments",
    "Shareholders' Equity & Retained Earnings",
    "Prepaid vs Accrued Expenses",
    "Interest Expense",
    "Accounting for Debt Issuance",
  ],
  valuation: [
    "DCF Analysis",
    "Comparable Company Analysis",
    "Precedent Transactions",
    "WACC Calculation",
    "Beta Estimation",
    "Terminal Value",
    "Multiples Analysis (EV/EBITDA, P/E, etc.)",
    "Enterprise Value vs Equity Value",
    "Dilution Impact",
    "Sensitivity Analysis",
    "Calendarization & LTM Adjustments",
    "Sum-of-the-Parts (SOTP) Valuation",
    "Adjusting Comparables",
    "Equity Value Bridges",
    "Control Premiums & Discounts",
  ],
  "M&A": [
    "Deal Structures (Cash vs Stock)",
    "Merger Model Mechanics",
    "Accretion/Dilution Analysis",
    "Purchase Price Allocation (PPA)",
    "Synergy Analysis",
    "Goodwill Creation in M&A",
    "Financing Options in M&A",
    "Due Diligence Process",
    "Regulatory Review & Antitrust",
    "Pro Forma Financial Statements",
    "Deal Protection Mechanisms",
    "Earnouts & Contingent Payments",
    "Target Valuation in M&A Context",
    "Hostile Takeovers & Defense Mechanisms",
    "Shareholder Approval & Board Dynamics",
  ],
  LBO: [
    "LBO Capital Structure",
    "Sources & Uses of Funds",
    "Types of Debt Financing",
    "Cash Flow Modeling in LBOs",
    "Working Capital in LBOs",
    "IRR Calculation & Return Drivers",
    "Debt Covenants & Restrictions",
    "Credit Metrics (Debt/EBITDA, Interest Coverage)",
    "Dividend Recapitalization",
    "Refinancing Strategies",
    "Exit Strategies (IPO, M&A, Secondary)",
    "Management Incentives",
    "Operational Improvements",
    "Roll-Forward of Debt",
  ],
  "capital markets": [
    "IPO Process Overview",
    "Bookbuilding Process",
    "Underwriting & Syndication",
    "Equity vs Debt Offerings",
    "Debt Issuance Mechanics",
    "Pricing Strategies for Offerings",
    "Roadshows & Investor Presentations",
    "Regulatory Filings (S-1, 10-K, etc.)",
    "Market Timing Considerations",
    "Convertible Securities",
    "High-Yield vs Investment-Grade Debt",
    "Private Placements",
    "PIPE Deals",
    "Secondary Offerings",
    "Credit Ratings Impact",
    "Investor Relations Strategy",
  ],
  "corporate finance": [
    "Capital Budgeting (NPV, IRR)",
    "Internal Rate of Return (IRR)",
    "Working Capital Management",
    "Dividend Policy Decisions",
    "Capital Structure Optimization",
    "Cost of Capital Estimation",
    "Financial Planning & Forecasting",
    "Treasury Operations",
    "Risk Management Strategies",
    "Scenario & Sensitivity Analysis",
    "Restructuring & Turnaround Strategy",
    "Strategic Alternatives (M&A, Dividends, Buybacks)",
    "Bankruptcy Process & Recovery",
    "Basic Financial Modeling",
    "Return on Invested Capital (ROIC)",
    "Management Reporting & KPIs",
  ],
  "technical modeling": [
    "Modeling Circular References",
    "Building a Debt Schedule",
    "Forecasting Working Capital",
    "Modeling Revolvers & Minimum Cash",
    "Tracing Model Errors",
    "Excel Modeling Best Practices",
  ],
};

interface GeneratedLesson {
  title: string;
  summary: string;
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
}

interface PerformanceInsight {
  subcategory: string;
  accuracy: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
    date: string;
  }>;
  patterns: string[];
  lastUpdated: number;
}

interface RecentQuestion {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  category: string;
  subcategory: string;
  difficulty: string;
  isCorrect: boolean;
  date: string;
}

export default function LessonsPage() {
  const generateLesson = useAction(api.lessons.generateLesson);
  const generatePersonalizedLesson = useAction(
    api.lessons.generatePersonalizedLesson
  );
  const allLessons = useQuery(api.lessons.getAllLessons);
  const allQuizResults = useQuery(api.quiz.getAllQuizResults);

  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [generatedLesson, setGeneratedLesson] =
    useState<GeneratedLesson | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedLessons, setSavedLessons] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    "recommended" | "topics" | "my-lessons"
  >("recommended");
  const [lessonDifficulty, setLessonDifficulty] = useState<
    "beginner" | "expert"
  >("beginner");
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [wasCancelled, setWasCancelled] = useState(false);

  // Load saved lessons from database instead of localStorage
  useEffect(() => {
    // The allLessons query will automatically fetch lessons from the database
    // No need to manually load from localStorage
    if (allLessons) {
      console.log("Loaded lessons from database:", allLessons.length);
    }
  }, [allLessons]);

  // Calculate performance insights
  const calculatePerformanceInsights = useCallback(() => {
    if (!allQuizResults) return [];

    const insights: PerformanceInsight[] = [];
    const subcategoryStats = new Map<
      string,
      {
        totalQuestions: number;
        correctAnswers: number;
        wrongAnswers: Array<{
          question: string;
          userAnswer: string;
          correctAnswer: string;
          explanation: string;
          date: string;
        }>;
      }
    >();

    // Aggregate data by subcategory
    allQuizResults.forEach((result) => {
      result.questions.forEach((q) => {
        const subcategory = q.subcategory || "unknown";
        const stats = subcategoryStats.get(subcategory) || {
          totalQuestions: 0,
          correctAnswers: 0,
          wrongAnswers: [],
        };

        stats.totalQuestions++;
        if (q.isCorrect) {
          stats.correctAnswers++;
        } else {
          stats.wrongAnswers.push({
            question: q.question,
            userAnswer: q.userAnswer,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            date: result.date,
          });
        }

        subcategoryStats.set(subcategory, stats);
      });
    });

    // Convert to insights
    subcategoryStats.forEach((stats, subcategory) => {
      const accuracy = (stats.correctAnswers / stats.totalQuestions) * 100;
      insights.push({
        subcategory,
        accuracy,
        totalQuestions: stats.totalQuestions,
        correctAnswers: stats.correctAnswers,
        wrongAnswers: stats.wrongAnswers,
        patterns: [], // Would need AI analysis for patterns
        lastUpdated: Date.now(),
      });
    });

    return insights.sort((a, b) => a.accuracy - b.accuracy); // Sort by worst performance first
  }, [allQuizResults]);

  // Get recommended lessons based on performance
  const getRecommendedLessons = useCallback(() => {
    const performanceInsights = calculatePerformanceInsights();

    // If we have performance data, use it to recommend topics with low accuracy
    if (performanceInsights.length > 0) {
      return performanceInsights.slice(0, 6).map((insight) => ({
        topic: capitalizeSubcategory(insight.subcategory),
        reason: `Low accuracy: ${insight.accuracy}% (${insight.correctAnswers}/${insight.totalQuestions} correct)`,
        accuracy: insight.accuracy,
      }));
    }

    // Fallback to popular topics if no performance data
    const popularTopics = [
      {
        topic: "DCF Analysis",
        reason: "Core valuation method - essential for IB interviews",
        accuracy: null,
      },
      {
        topic: "Comparable Company Analysis",
        reason: "Most common valuation approach in practice",
        accuracy: null,
      },
      {
        topic: "LBO Capital Structure",
        reason: "Critical for private equity and leveraged buyouts",
        accuracy: null,
      },
      {
        topic: "Merger Model Mechanics",
        reason: "Key for M&A analysis and deal modeling",
        accuracy: null,
      },
      {
        topic: "Working Capital",
        reason: "Fundamental concept for financial modeling",
        accuracy: null,
      },
      {
        topic: "Income Statement Breakdown",
        reason: "Essential for understanding company performance",
        accuracy: null,
      },
    ];
    return popularTopics;
  }, [calculatePerformanceInsights]);

  // Pre-validate lesson generation
  const preValidateLesson = async (topic: string) => {
    try {
      const result = await fetch("/api/validate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subcategory: topic,
          difficulty: lessonDifficulty === "beginner" ? "easy" : "hard",
        }),
      });

      if (!result.ok) {
        throw new Error("Validation failed");
      }

      const validation = await result.json();
      return validation;
    } catch (error) {
      console.error("Validation error:", error);
      // Return a fallback validation object
      return {
        isValid: true,
        issues: [],
        estimatedTokens: 0,
        estimatedCost: 0,
      };
    }
  };

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setIsGenerating(false);
      setAbortController(null);
      setWasCancelled(true);
      console.log("Lesson generation stopped by user");
    }
  };

  // Reset cancelled state when starting new generation
  const handleGenerateLesson = async (topic: string) => {
    if (isGenerating) return;

    setIsGenerating(true);
    setGeneratedLesson(null);
    setWasCancelled(false);

    // Create a new AbortController for this generation
    const controller = new AbortController();
    setAbortController(controller);

    try {
      console.log("=== GENERATING LESSON ===");
      console.log("Topic:", topic);
      console.log("Difficulty:", lessonDifficulty);
      console.log("Personalized:", true); // Always personalized

      let lesson;
      lesson = await generatePersonalizedLesson({
        subcategory: topic,
        difficulty: lessonDifficulty,
      });

      // Check if the generation was cancelled
      if (controller.signal.aborted) {
        console.log("Lesson generation was cancelled");
        return;
      }

      console.log("Lesson generated successfully:", lesson);
      setGeneratedLesson(lesson);

      // Lesson is already saved to database by the backend
      // No need to save to localStorage anymore
    } catch (error) {
      // Check if the error was due to cancellation
      if (controller.signal.aborted) {
        console.log("Lesson generation was cancelled");
        return;
      }

      console.error("Error generating lesson:", error);
      alert("Failed to generate lesson. Please try again.");
    } finally {
      setIsGenerating(false);
      setAbortController(null);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Function to capitalize subcategory names properly
  const capitalizeSubcategory = (subcategory: string) => {
    return subcategory
      .split(" ")
      .map((word) => {
        // Handle hyphenated words
        if (word.includes("-")) {
          return word
            .split("-")
            .map(
              (part) =>
                part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
            )
            .join("-");
        }
        // Handle regular words
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  };

  const recommendedLessons = getRecommendedLessons();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <Link
              href="/"
              className="flex items-center space-x-4 hover:scale-105 transition-transform duration-200"
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  InvestIQ
                </h1>
                <p className="text-base text-blue-300 font-medium">
                  AI-Powered IB Prep
                </p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/progress"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium text-base">Progress</span>
              </Link>
              <Link
                href="/quiz"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Start Quiz
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 font-medium text-sm tracking-wide">
              AI-Powered Learning
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-10 leading-tight tracking-tight">
            Master Investment Banking
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-16 leading-relaxed max-w-4xl mx-auto font-light">
            Personalized AI lessons tailored to your learning style and
            performance. Get comprehensive coverage of all IB topics with
            interactive examples and practice questions.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800/50 rounded-xl p-1 mb-8 max-w-2xl mx-auto">
          <button
            onClick={() => setActiveTab("recommended")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === "recommended"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "text-gray-300 hover:text-white hover:bg-gray-700/50"
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Recommended</span>
          </button>

          <button
            onClick={() => setActiveTab("topics")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === "topics"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "text-gray-300 hover:text-white hover:bg-gray-700/50"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>All Topics</span>
          </button>

          <button
            onClick={() => setActiveTab("my-lessons")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === "my-lessons"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "text-gray-300 hover:text-white hover:bg-gray-700/50"
            }`}
          >
            <BookMarked className="w-4 h-4" />
            <span>My Lessons</span>
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Content Selection */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 transition-all duration-300">
              {activeTab === "recommended" && (
                <>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Star className="w-6 h-6 mr-3 text-yellow-400" />
                    Recommended
                  </h2>

                  {/* Difficulty Toggle */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Lesson Difficulty
                    </label>
                    <div className="flex bg-gray-700/30 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setLessonDifficulty("beginner")}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                          lessonDifficulty === "beginner"
                            ? "bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg"
                            : "text-gray-300 hover:text-white hover:bg-gray-600/50"
                        }`}
                      >
                        Beginner
                      </button>
                      <button
                        type="button"
                        onClick={() => setLessonDifficulty("expert")}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                          lessonDifficulty === "expert"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                            : "text-gray-300 hover:text-white hover:bg-gray-600/50"
                        }`}
                      >
                        Expert
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {lessonDifficulty === "beginner"
                        ? "Shorter explanations, perfect for getting started"
                        : "Detailed explanations with comprehensive coverage"}
                    </p>
                  </div>

                  {/* Personalization Toggle */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Lesson Type
                    </label>
                    <div className="flex bg-gray-700/30 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => {}} // No toggle needed
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                          true // Always personalized
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                            : "text-gray-300 hover:text-white hover:bg-gray-600/50"
                        }`}
                      >
                        Personalized
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Always personalized content based on your quiz mistakes
                    </p>
                  </div>

                  {/* Generation Status */}
                  {isGenerating && (
                    <>
                      <div className="mb-4 p-4 rounded-xl border bg-blue-600/10 border-blue-500/30 text-blue-300 transition-all duration-200">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="font-medium">Generating...</span>
                        </div>
                      </div>
                      <div className="mb-4 flex justify-center">
                        <button
                          onClick={stopGeneration}
                          className="px-4 py-2 text-sm bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-colors duration-200 flex items-center space-x-2 text-red-300 hover:text-red-200"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Stop Generation</span>
                        </button>
                      </div>
                    </>
                  )}

                  {generatedLesson && !isGenerating && (
                    <div className="mb-4 p-4 rounded-xl border bg-green-600/10 border-green-500/30 text-green-300 transition-all duration-200">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Generated ✓</span>
                      </div>
                    </div>
                  )}

                  {wasCancelled && !isGenerating && (
                    <div className="mb-4 p-4 rounded-xl border bg-yellow-600/10 border-yellow-500/30 text-yellow-300 transition-all duration-200">
                      <div className="flex items-center space-x-2">
                        <XCircle className="w-4 h-4" />
                        <span className="font-medium">
                          Generation Cancelled
                        </span>
                      </div>
                    </div>
                  )}

                  {recommendedLessons.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-yellow-400" />
                      </div>
                      <p className="text-gray-400 font-medium">
                        No recommendations yet
                      </p>
                      <p className="text-gray-500 text-sm mt-2">
                        Take more quizzes to get personalized recommendations
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {recommendedLessons.map((lesson, index) => (
                        <button
                          key={index}
                          onClick={() => handleGenerateLesson(lesson.topic)}
                          disabled={isGenerating}
                          className={`w-full text-left p-4 rounded-xl border transition-all duration-200 bg-gradient-to-r from-yellow-600/10 to-orange-600/10 border-yellow-500/30 text-yellow-300 hover:border-yellow-500/50 hover:bg-gradient-to-r hover:from-yellow-600/20 hover:to-orange-600/20 transform hover:scale-[1.02] ${
                            isGenerating
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer"
                          }`}
                        >
                          <div className="flex flex-col items-start">
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className="font-medium text-sm">
                                {lesson.topic}
                              </span>
                              {isGenerating &&
                                selectedTopic === lesson.topic && (
                                  <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                                )}
                            </div>
                            <span className="text-xs text-yellow-400/80">
                              {lesson.reason}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === "topics" && (
                <>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Brain className="w-6 h-6 mr-3 text-blue-400" />
                    All Topics
                  </h2>

                  {/* Difficulty Toggle */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Lesson Difficulty
                    </label>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setLessonDifficulty("beginner")}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                          lessonDifficulty === "beginner"
                            ? "bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg"
                            : "text-gray-300 hover:text-white hover:bg-gray-600/50"
                        }`}
                      >
                        Beginner
                      </button>
                      <button
                        type="button"
                        onClick={() => setLessonDifficulty("expert")}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                          lessonDifficulty === "expert"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                            : "text-gray-300 hover:text-white hover:bg-gray-600/50"
                        }`}
                      >
                        Expert
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {lessonDifficulty === "beginner"
                        ? "Shorter explanations, perfect for getting started"
                        : "Detailed explanations with comprehensive coverage"}
                    </p>
                  </div>

                  {/* Personalization Toggle */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Lesson Type
                    </label>
                    <div className="flex bg-gray-700/30 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => {}} // No toggle needed
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                          true // Always personalized
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                            : "text-gray-300 hover:text-white hover:bg-gray-600/50"
                        }`}
                      >
                        Personalized
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Always personalized content based on your quiz mistakes
                    </p>
                  </div>

                  {/* Generation Status */}
                  {isGenerating && (
                    <>
                      <div className="mb-4 p-4 rounded-xl border bg-blue-600/10 border-blue-500/30 text-blue-300 transition-all duration-200">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="font-medium">Generating...</span>
                        </div>
                      </div>
                      <div className="mb-4 flex justify-center">
                        <button
                          onClick={stopGeneration}
                          className="px-4 py-2 text-sm bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-colors duration-200 flex items-center space-x-2 text-red-300 hover:text-red-200"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Stop Generation</span>
                        </button>
                      </div>
                    </>
                  )}

                  {generatedLesson && !isGenerating && (
                    <div className="mb-4 p-4 rounded-xl border bg-green-600/10 border-green-500/30 text-green-300 transition-all duration-200">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Generated ✓</span>
                      </div>
                    </div>
                  )}

                  {wasCancelled && !isGenerating && (
                    <div className="mb-4 p-4 rounded-xl border bg-yellow-600/10 border-yellow-500/30 text-yellow-300 transition-all duration-200">
                      <div className="flex items-center space-x-2">
                        <XCircle className="w-4 h-4" />
                        <span className="font-medium">
                          Generation Cancelled
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Category Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-600/30 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none transition-all duration-200"
                    >
                      <option value="">All Categories</option>
                      {Object.keys(ALL_SUBCATEGORIES).map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {Object.entries(ALL_SUBCATEGORIES)
                      .filter(
                        ([category]) =>
                          !selectedCategory || category === selectedCategory
                      )
                      .map(([category, subcategories]) => (
                        <div key={category}>
                          {!selectedCategory && (
                            <h3 className="text-lg font-semibold text-blue-300 mb-3 mt-6 first:mt-0">
                              {category.charAt(0).toUpperCase() +
                                category.slice(1)}
                            </h3>
                          )}
                          {subcategories.map((topic) => (
                            <button
                              key={topic}
                              onClick={() => handleGenerateLesson(topic)}
                              disabled={isGenerating}
                              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                                selectedTopic === topic
                                  ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/50 text-blue-300"
                                  : "bg-gradient-to-r from-gray-700/20 to-gray-800/20 border-gray-600/30 text-gray-300 hover:border-blue-500/50 hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-purple-600/10"
                              } transform hover:scale-[1.02] ${
                                isGenerating
                                  ? "cursor-not-allowed opacity-50"
                                  : "cursor-pointer"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">
                                  {topic}
                                </span>
                                {isGenerating && selectedTopic === topic && (
                                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      ))}
                  </div>
                </>
              )}

              {activeTab === "my-lessons" && (
                <>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <BookMarked className="w-6 h-6 mr-3 text-green-400" />
                    My Lessons
                  </h2>

                  {allLessons && allLessons.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <BookMarked className="w-8 h-8 text-green-400" />
                      </div>
                      <p className="text-gray-400 font-medium">
                        No saved lessons yet
                      </p>
                      <p className="text-gray-500 text-sm mt-2">
                        Generate lessons to see them here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {allLessons?.map((lesson) => (
                        <button
                          key={lesson._id}
                          onClick={() => {
                            setSelectedTopic(lesson.subcategory);
                            setGeneratedLesson({
                              title: lesson.title,
                              summary: lesson.content.summary,
                              keyConcepts: lesson.content.keyConcepts,
                              commonMistakes: lesson.content.commonMistakes,
                              practiceQuestions: lesson.content.practiceQuestions,
                            });
                          }}
                          className="w-full text-left p-4 rounded-xl border transition-all duration-200 bg-gradient-to-r from-green-600/10 to-blue-600/10 border-green-500/30 text-green-300 hover:border-green-500/50 hover:bg-gradient-to-r hover:from-green-600/20 hover:to-blue-600/20 transform hover:scale-[1.02] cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-left">
                              <span className="font-medium text-sm block">
                                {lesson.title}
                              </span>
                              <span className="text-xs text-green-400 opacity-75">
                                {lesson.subcategory}
                              </span>
                            </div>
                            <Eye className="w-4 h-4" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Column - Generated Lesson */}
          <div className="lg:col-span-3">
            {generatedLesson ? (
              <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-8 hover:border-blue-500/40 transition-all duration-300">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-white mb-4">
                    {generatedLesson.title}
                  </h1>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {generatedLesson.summary}
                  </p>
                </div>

                {/* Key Concepts */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <Target className="w-5 h-5 mr-3 text-blue-400" />
                    Key Concepts
                  </h3>
                  <div className="space-y-6">
                    {generatedLesson.keyConcepts.map((concept, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-gray-700/20 to-gray-800/20 border border-gray-600/30 rounded-xl p-6 hover:border-gray-500/50 transition-all duration-300"
                      >
                        <h4 className="text-lg font-semibold text-white mb-3">
                          {concept.title}
                        </h4>
                        <p className="text-gray-300 mb-4 leading-relaxed">
                          {concept.explanation}
                        </p>
                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                          <p className="text-blue-300 text-sm">
                            <strong>Example:</strong> {concept.example}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Common Mistakes */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <Eye className="w-5 h-5 mr-3 text-red-400" />
                    Common Mistakes
                  </h3>
                  <div className="space-y-3">
                    {generatedLesson.commonMistakes.map((mistake, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-red-600/10 to-red-700/10 border border-red-500/30 rounded-xl p-4 hover:border-red-500/50 transition-all duration-300"
                      >
                        <p className="text-red-300">• {mistake}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Practice Questions */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <Play className="w-5 h-5 mr-3 text-green-400" />
                    Practice Questions
                  </h3>
                  <div className="space-y-6">
                    {generatedLesson.practiceQuestions.map((q, index) => (
                      <InteractiveQuestion
                        key={index}
                        question={q}
                        questionNumber={index + 1}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-8 hover:border-blue-500/40 transition-all duration-300 h-full flex items-center justify-center">
                <div className="text-center max-w-lg">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {activeTab === "recommended" && "Recommended Lessons"}
                    {activeTab === "topics" && "Select a Topic"}
                    {activeTab === "my-lessons" && "My Lessons"}
                  </h2>
                  <p className="text-gray-400 text-lg">
                    {activeTab === "recommended" &&
                      "Get personalized lesson recommendations based on your performance"}
                    {activeTab === "topics" &&
                      "Choose a topic from the left panel to generate a personalized AI lesson"}
                    {activeTab === "my-lessons" &&
                      "Your generated lessons will appear here for easy access"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
