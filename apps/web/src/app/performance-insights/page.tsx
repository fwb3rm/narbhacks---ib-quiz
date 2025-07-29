"use client";

import { useQuery, useMutation } from "convex/react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Award,
  BarChart3,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Lightbulb,
  LineChart,
  Minus,
  PieChart,
  Star,
  Target,
  Target as TargetIcon,
  Timer,
  TrendingDown,
  TrendingUp,
  TrendingUp as TrendingUpIcon,
  Trophy,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AnalyticsDashboard from "@/components/ui/analytics-dashboard";
import SubcategoryAnalysis from "@/components/ui/subcategory-analysis";
import { api } from "../../../convex/_generated/api";

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

interface PerformanceData {
  overallStats: {
    totalQuizzes: number;
    averageScore: number;
    averageAccuracy: number;
    totalQuestions: number;
    totalCorrect: number;
    bestScore: number;
    worstScore: number;
    averageTimePerQuestion: number;
    totalStudyTime: number;
  };
  categoryPerformance: Array<{
    category: string;
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    averageTime: number;
    strength: "strong" | "needs_work" | "weak";
  }>;
  subcategoryPerformance: Array<{
    subcategory: string;
    category: string;
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    averageTime: number;
    strength: "strong" | "needs_work" | "weak";
    recentTrend: "improving" | "declining" | "stable";
  }>;
  difficultyPerformance: {
    easy: { total: number; correct: number; accuracy: number };
    medium: { total: number; correct: number; accuracy: number };
    hard: { total: number; correct: number; accuracy: number };
  };
  timeAnalysis: {
    averageTimePerQuestion: number;
    fastestCategory: string;
    slowestCategory: string;
    timeTrend: "improving" | "declining" | "stable";
  };
  improvementAreas: Array<{
    subcategory: string;
    category: string;
    currentAccuracy: number;
    questionsNeeded: number;
    priority: "high" | "medium" | "low";
  }>;
  strengthAreas: Array<{
    subcategory: string;
    category: string;
    accuracy: number;
    totalQuestions: number;
  }>;
  recentProgress: Array<{
    date: string;
    accuracy: number;
    score: number;
    questionsAnswered: number;
  }>;
}

export default function ProgressPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "all"
  >("all");
  const [selectedView, setSelectedView] = useState<
    "overview" | "detailed" | "improvements"
  >("overview");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null
  );

  const performanceData = useQuery(api.performance.getPerformanceAnalytics, {
    userId: undefined,
  });
  const allQuizResults = useQuery(api.quiz.getAllQuizResults);
  
  // Filter out Investment Banking category from display
  const filteredPerformanceData = performanceData ? {
    ...performanceData,
    categoryPerformance: performanceData.categoryPerformance.filter(cat => cat.category !== "Investment Banking"),
    subcategoryPerformance: performanceData.subcategoryPerformance.filter(sub => sub.category !== "Investment Banking"),
    improvementAreas: performanceData.improvementAreas.filter(area => area.category !== "Investment Banking"),
    strengthAreas: performanceData.strengthAreas.filter(area => area.category !== "Investment Banking"),
  } : null;

  // Get recent questions
  const getRecentQuestions = useCallback(() => {
    if (!allQuizResults) return [];

    const recentQuestions: RecentQuestion[] = [];
    allQuizResults.forEach((result) => {
      result.questions.forEach((q) => {
        // Skip investment banking category (fallback category)
        if (q.category === "Investment Banking") {
          return;
        }

        recentQuestions.push({
          question: q.question,
          userAnswer: q.userAnswer,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          category: q.category,
          subcategory: q.subcategory || "unknown",
          difficulty: q.difficulty,
          isCorrect: q.isCorrect,
          date: result.date,
        });
      });
    });

    return recentQuestions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10); // Get 10 most recent
  }, [allQuizResults]);

  const recentQuestions = getRecentQuestions();

  const getStrengthIcon = (strength: "strong" | "needs_work" | "weak") => {
    switch (strength) {
      case "strong":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "needs_work":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "weak":
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStrengthColor = (strength: "strong" | "needs_work" | "weak") => {
    switch (strength) {
      case "strong":
        return "text-green-400";
      case "needs_work":
        return "text-yellow-400";
      case "weak":
        return "text-red-400";
    }
  };

  const getTrendIcon = (trend: "improving" | "declining" | "stable") => {
    switch (trend) {
      case "improving":
        return <TrendingUpIcon className="w-4 h-4 text-green-500" />;
      case "declining":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case "stable":
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "border-red-500 bg-red-500/10";
      case "medium":
        return "border-yellow-500 bg-yellow-500/10";
      case "low":
        return "border-blue-500 bg-blue-500/10";
    }
  };

  if (!filteredPerformanceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading performance data...</p>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatStudyTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const capitalizeCategory = (category: string) => {
    // Handle special cases
    if (category === "M&A") return "M&A";
    if (category === "LBO") return "LBO";
    
    // Capitalize first letter of each word
    return category.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <Link
              href="/"
              className="flex items-center space-x-4 hover:scale-105 transition-transform duration-200"
            >
              <div className="flex items-center space-x-4">
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
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-10 leading-tight tracking-tight">
            Performance Insights
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-16 leading-relaxed max-w-4xl mx-auto font-light">
            Deep dive into your learning analytics with actionable insights and
            personalized recommendations
          </p>
        </div>

        {/* View Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl p-2 border border-gray-600/30 shadow-xl">
            <button
              onClick={() => setSelectedView("overview")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                selectedView === "overview"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedView("detailed")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                selectedView === "detailed"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              Detailed Analysis
            </button>
            <button
              onClick={() => setSelectedView("improvements")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                selectedView === "improvements"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              Improvement Areas
            </button>
          </div>
        </div>
        


        {selectedView === "overview" && (
          <>
            <AnalyticsDashboard performanceData={filteredPerformanceData} />

            {/* Recent Questions Section */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-6 shadow-xl mt-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                Recent Questions
              </h3>

              {recentQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <p className="text-gray-400">
                    No recent questions available.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentQuestions.map((q, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-gray-700/30 to-gray-800/30 border border-gray-600/40 rounded-xl p-4 hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-800/50 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-white font-semibold text-base">
                            {q.subcategory}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              q.difficulty === "easy"
                                ? "bg-green-500/20 text-green-400"
                                : q.difficulty === "medium"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {q.difficulty.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {q.isCorrect ? (
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 text-xs font-medium">
                                CORRECT
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <XCircle className="w-4 h-4 text-red-400" />
                              <span className="text-red-400 text-xs font-medium">
                                INCORRECT
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                        {q.question}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="text-gray-400 text-xs">
                          {new Date(q.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <button
                          onClick={() => {
                            const questionId = `${q.subcategory}-${q.date}-${q.question.substring(0, 20)}`;
                            if (selectedQuestionId === questionId) {
                              setSelectedQuestionId(null);
                            } else {
                              setSelectedQuestionId(questionId);
                            }
                          }}
                          className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {selectedQuestionId ===
                            `${q.subcategory}-${q.date}-${q.question.substring(0, 20)}`
                              ? "HIDE DETAILS"
                              : "VIEW DETAILS"}
                          </span>
                        </button>
                      </div>

                      {/* Expandable Details */}
                      {selectedQuestionId ===
                        `${q.subcategory}-${q.date}-${q.question.substring(0, 20)}` && (
                        <div className="mt-4 pt-4 border-t border-gray-600/30 space-y-4">
                          {/* User Answer */}
                          <div className="bg-gray-700/30 rounded-lg p-3">
                            <h4 className="text-white font-semibold mb-2 text-sm">
                              Your Answer:
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  q.isCorrect
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {q.userAnswer}
                              </span>
                              {!q.isCorrect && (
                                <span className="text-gray-400 text-sm">→</span>
                              )}
                            </div>
                          </div>

                          {/* Correct Answer */}
                          {!q.isCorrect && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                              <h4 className="text-green-400 font-semibold mb-2 text-sm">
                                Correct Answer:
                              </h4>
                              <span className="text-green-300 font-medium text-sm">
                                {q.correctAnswer}
                              </span>
                            </div>
                          )}

                          {/* Explanation */}
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                            <h4 className="text-blue-400 font-semibold mb-2 text-sm flex items-center">
                              <Lightbulb className="w-3 h-3 mr-2" />
                              Explanation:
                            </h4>
                            <p className="text-blue-300 leading-relaxed text-sm">
                              {q.explanation}
                            </p>
                          </div>

                          {/* Metadata */}
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Category: {capitalizeCategory(q.category)}</span>
                            <span>
                              {new Date(q.date).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {selectedView === "detailed" && (
          <div className="space-y-8">
            {/* Category Performance */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                Detailed Category Analysis
              </h3>
              <div className="space-y-4">
                {filteredPerformanceData.categoryPerformance.map((category) => (
                  <div
                    key={category.category}
                    className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl"
                  >
                    <div className="flex items-center space-x-4">
                      {getStrengthIcon(category.strength)}
                      <div>
                        <span className="font-medium text-white">
                          {capitalizeCategory(category.category)}
                        </span>
                        <span className="text-gray-400 ml-2">
                          ({category.correctAnswers}/{category.totalQuestions})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">
                          {category.accuracy}%
                        </div>
                        <div className="text-xs text-gray-400">Accuracy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">
                          {formatTime(category.averageTime)}
                        </div>
                        <div className="text-xs text-gray-400">Avg Time</div>
                      </div>
                      <div className="w-32 bg-gray-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            category.strength === "strong"
                              ? "bg-green-500"
                              : category.strength === "needs_work"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${category.accuracy}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subcategory Performance */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                  <Target className="w-4 h-4 text-white" />
                </div>
                Subcategory Performance
              </h3>
              <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                {filteredPerformanceData.subcategoryPerformance.map((subcategory) => (
                  <div
                    key={subcategory.subcategory}
                    className="bg-gray-700/30 rounded-xl p-4 hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
                    onClick={() =>
                      setSelectedSubcategory(subcategory.subcategory)
                    }
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getStrengthIcon(subcategory.strength)}
                        <span className="font-medium text-white">
                          {subcategory.subcategory}
                        </span>
                      </div>
                      {getTrendIcon(subcategory.recentTrend)}
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">
                        {capitalizeCategory(subcategory.category)}
                      </span>
                      <span className="text-sm text-gray-400">
                        {subcategory.totalQuestions} questions
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span
                          className={`font-bold ${getStrengthColor(subcategory.strength)}`}
                        >
                          {subcategory.accuracy}%
                        </span>
                        <span className="text-sm text-gray-400">
                          {formatTime(subcategory.averageTime)}
                        </span>
                      </div>
                      <div className="w-20 bg-gray-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            subcategory.strength === "strong"
                              ? "bg-green-500"
                              : subcategory.strength === "needs_work"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${subcategory.accuracy}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Analysis */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
                  <Timer className="w-4 h-4 text-white" />
                </div>
                Time Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {formatTime(
                        filteredPerformanceData.timeAnalysis.averageTimePerQuestion
                      )}
                    </div>
                    <div className="text-gray-400 text-sm">
                      Average Time per Question
                    </div>
                  </div>
                </div>
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">
                      {filteredPerformanceData.timeAnalysis.fastestCategory}
                    </div>
                    <div className="text-gray-400 text-sm">
                      Fastest Category
                    </div>
                  </div>
                </div>
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-400">
                      {filteredPerformanceData.timeAnalysis.slowestCategory}
                    </div>
                    <div className="text-gray-400 text-sm">
                      Slowest Category
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedView === "improvements" && (
          <div className="space-y-8">
            {/* Priority Improvement Areas */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                Priority Improvement Areas
              </h3>
              <div className="space-y-4">
                {filteredPerformanceData.improvementAreas.map((area, index) => (
                  <div
                    key={area.subcategory}
                    className={`p-6 rounded-xl border ${getPriorityColor(area.priority)}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            area.priority === "high"
                              ? "bg-red-500"
                              : area.priority === "medium"
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                          }`}
                        >
                          <span className="text-white font-bold">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-white">
                            {area.subcategory}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {area.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-400">
                          {area.currentAccuracy}%
                        </div>
                        <div className="text-sm text-gray-400">
                          Current Accuracy
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-gray-400">
                            {area.questionsNeeded} more questions needed
                          </span>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm">
                        Practice Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                  <Lightbulb className="w-4 h-4 text-white" />
                </div>
                Personalized Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <h4 className="font-bold text-white mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-green-400" />
                    Focus Areas
                  </h4>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Prioritize high-priority improvement areas</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Practice medium-difficulty questions first</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Review explanations for incorrect answers</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <h4 className="font-bold text-white mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-blue-400" />
                    Study Strategy
                  </h4>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Take regular quizzes to track progress</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Focus on time management</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Build on your strength areas</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Progress Chart */}
        {filteredPerformanceData.recentProgress.length > 0 && (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-6 shadow-xl mt-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                <LineChart className="w-4 h-4 text-white" />
              </div>
              Recent Progress Trend
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {filteredPerformanceData.recentProgress
                .slice(0, 5)
                .map((progress, index) => (
                  <div
                    key={index}
                    className="bg-gray-700/30 rounded-xl p-4 text-center"
                  >
                    <div className="text-sm text-gray-400 mb-2">
                      {new Date(progress.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {progress.accuracy}%
                    </div>
                    <div className="text-sm text-gray-400">
                      {progress.score} pts
                    </div>
                    <div className="text-xs text-gray-500">
                      {progress.questionsAnswered} questions
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Subcategory Analysis Modal */}
        {selectedSubcategory && (
          <SubcategoryAnalysis
            subcategory={selectedSubcategory}
            onClose={() => setSelectedSubcategory(null)}
          />
        )}
      </div>
    </div>
  );
}
