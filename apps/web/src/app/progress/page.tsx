"use client";

import {
  ArrowLeft,
  BarChart3,
  Brain,
  Calendar,
  Clock,
  Target,
  Target as TargetIcon,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProgressService } from "@/lib/progress";

interface QuizResult {
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
}

export default function ProgressPage() {
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "all"
  >("week");
  const [chartMetric, setChartMetric] = useState<
    "questions" | "score" | "accuracy"
  >("score");
  const [subcategoryView, setSubcategoryView] = useState<"best" | "worst">(
    "best"
  );

  // Load real quiz data from localStorage
  useEffect(() => {
    const loadQuizData = () => {
      const results = ProgressService.getResultsByPeriod(selectedPeriod);
      setQuizHistory(results);
    };

    loadQuizData();
  }, [selectedPeriod]);

  const getFilteredHistory = () => {
    return quizHistory.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const getAverageScore = () => {
    const filtered = getFilteredHistory();
    if (filtered.length === 0) return 0;
    return Math.round(
      filtered.reduce((sum, result) => sum + result.score, 0) / filtered.length
    );
  };

  const getTotalQuizzes = () => {
    return getFilteredHistory().length;
  };

  const getBestScore = () => {
    const filtered = getFilteredHistory();
    if (filtered.length === 0) return 0;
    return Math.max(...filtered.map((result) => result.score));
  };

  const getAverageTimePerQuestion = () => {
    const filtered = getFilteredHistory();
    if (filtered.length === 0) return 0;
    
    const totalTime = filtered.reduce((sum, result) => sum + result.timeTaken, 0);
    const totalQuestions = filtered.reduce((sum, result) => sum + result.totalQuestions, 0);
    
    if (totalQuestions === 0) return 0;
    return Math.round(totalTime / totalQuestions);
  };

  const getCategoryPerformance = () => {
    const filtered = getFilteredHistory();
    const categoryStats: {
      [key: string]: { total: number; correct: number; percentage: number };
    } = {};

    filtered.forEach((result) => {
      result.questions.forEach((q) => {
        const category = q.category;
        if (!categoryStats[category]) {
          categoryStats[category] = { total: 0, correct: 0, percentage: 0 };
        }
        categoryStats[category].total++;
        if (q.isCorrect) {
          categoryStats[category].correct++;
        }
      });
    });

    // Calculate percentages
    Object.keys(categoryStats).forEach((category) => {
      const stats = categoryStats[category];
      stats.percentage = Math.round((stats.correct / stats.total) * 100);
    });

    return categoryStats;
  };

  const getSubcategoryPerformance = () => {
    const filtered = getFilteredHistory();
    const subcategoryStats: {
      [key: string]: { total: number; correct: number; percentage: number };
    } = {};

    filtered.forEach((result) => {
      result.questions.forEach((q) => {
        if (q.subcategory) {
          const subcategory = q.subcategory;
          if (!subcategoryStats[subcategory]) {
            subcategoryStats[subcategory] = {
              total: 0,
              correct: 0,
              percentage: 0,
            };
          }
          subcategoryStats[subcategory].total++;
          if (q.isCorrect) {
            subcategoryStats[subcategory].correct++;
          }
        }
      });
    });

    // Calculate percentages
    Object.keys(subcategoryStats).forEach((subcategory) => {
      const stats = subcategoryStats[subcategory];
      stats.percentage = Math.round((stats.correct / stats.total) * 100);
    });

    return subcategoryStats;
  };

  const getChartData = () => {
    const filtered = getFilteredHistory();
    return filtered.map((result) => ({
      date: new Date(result.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      questions: result.totalQuestions,
      score: result.score,
      accuracy: result.accuracy,
      correctAnswers: result.correctAnswers,
    }));
  };

  const renderLineChart = () => {
    const chartData = getChartData();
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No data available yet</p>
            <p className="text-sm text-gray-400">
              Complete your first quiz to see progress!
            </p>
          </div>
        </div>
      );
    }

    const maxValue = Math.max(
      ...chartData.map((d) => {
        if (chartMetric === "questions") return d.questions;
        if (chartMetric === "score") return d.score;
        return d.accuracy;
      })
    );
    const minValue = Math.min(
      ...chartData.map((d) => {
        if (chartMetric === "questions") return d.questions;
        if (chartMetric === "score") return d.score;
        return d.accuracy;
      })
    );
    const range = maxValue - minValue || 1; // Prevent division by zero

    return (
      <div className="relative">
        <svg width="100%" height="280" className="overflow-visible">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1="0"
              y1={i * 60 + 40}
              x2="100%"
              y2={i * 60 + 40}
              stroke="#374151"
              strokeWidth="1"
              opacity="0.2"
            />
          ))}

          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4].map((i) => (
            <text
              key={i}
              x="10"
              y={i * 60 + 45}
              className="text-xs text-gray-400"
              fill="currentColor"
            >
              {Math.round(maxValue - (i * range) / 4)}
            </text>
          ))}

          {/* Line path */}
          <path
            d={chartData
              .map((point, index) => {
                const x = index * 60 + 30;
                const value =
                  chartMetric === "questions"
                    ? point.questions
                    : chartMetric === "score"
                      ? point.score
                      : point.accuracy;
                const y = 240 - ((value - minValue) / range) * 200;
                return `${index === 0 ? "M" : "L"} ${x} ${y}`;
              })
              .join(" ")}
            stroke="url(#gradient)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>

          {/* Data points */}
          {chartData.map((point, index) => {
            const x = index * 60 + 30;
            const value =
              chartMetric === "questions"
                ? point.questions
                : chartMetric === "score"
                  ? point.score
                  : point.accuracy;
            const y = 240 - ((value - minValue) / range) * 200;
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill="white"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  className="cursor-pointer hover:r-10 transition-all duration-200"
                  filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"
                />
                {/* Background rectangle for text */}
                <rect
                  x={x - 20}
                  y={y - 35}
                  width="40"
                  height="20"
                  rx="4"
                  fill="rgba(0, 0, 0, 0.7)"
                  className="transition-opacity duration-200"
                />
                <text
                  x={x}
                  y={y - 20}
                  textAnchor="middle"
                  className="text-xs font-semibold text-white"
                  style={{ fontSize: "11px" }}
                  fill="white"
                >
                  {chartMetric === "questions"
                    ? point.questions
                    : chartMetric === "score"
                      ? point.score
                      : point.accuracy}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {chartData.map((point, index) => (
            <text
              key={index}
              x={index * 60 + 30}
              y="270"
              textAnchor="middle"
              className="text-xs text-gray-400"
              fill="currentColor"
            >
              {point.date}
            </text>
          ))}
        </svg>
      </div>
    );
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
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl">
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
              <button
                onClick={() => {
                  ProgressService.clearAllResults();
                  setQuizHistory([]);
                }}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-200 text-sm shadow-lg"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Your Progress
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Track your investment banking knowledge growth with detailed
            analytics and performance insights
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl p-2 border border-gray-600/30 shadow-xl">
            <button
              onClick={() => setSelectedPeriod("week")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                selectedPeriod === "week"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setSelectedPeriod("month")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                selectedPeriod === "month"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setSelectedPeriod("all")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                selectedPeriod === "all"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-600/10 to-blue-700/10 border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 transition-all duration-300 group shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <span className="text-blue-400 text-sm font-medium">
                Best Score
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">
              {getBestScore()}
            </h3>
            <p className="text-gray-400">Best Score (pts)</p>
          </div>

          <div className="bg-gradient-to-br from-green-600/10 to-green-700/10 border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-all duration-300 group shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <TargetIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-green-400 text-sm font-medium">
                Average Score
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">
              {getAverageScore()}
            </h3>
            <p className="text-gray-400">Average Score (pts)</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600/10 to-purple-700/10 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300 group shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-purple-400 text-sm font-medium">
                Total Quizzes
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">
              {getTotalQuizzes()}
            </h3>
            <p className="text-gray-400">Quizzes Completed</p>
          </div>

          <div className="bg-gradient-to-br from-orange-600/10 to-orange-700/10 border border-orange-500/20 rounded-2xl p-6 hover:border-orange-500/40 transition-all duration-300 group shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-orange-400 text-sm font-medium">
                Avg Time
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">
              {getAverageTimePerQuestion()}
            </h3>
            <p className="text-gray-400">Seconds per Question</p>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-8 mb-12 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Performance Trend
              </h2>
              <p className="text-gray-400 text-sm">
                {chartMetric === "questions"
                  ? "Number of questions answered per quiz over time"
                  : chartMetric === "score"
                    ? "Score points per quiz over time"
                    : "Accuracy percentage per quiz over time"}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setChartMetric("questions")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  chartMetric === "questions"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600"
                }`}
              >
                Questions
              </button>
              <button
                onClick={() => setChartMetric("score")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  chartMetric === "score"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600"
                }`}
              >
                Score
              </button>
              <button
                onClick={() => setChartMetric("accuracy")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  chartMetric === "accuracy"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600"
                }`}
              >
                Accuracy
              </button>
            </div>
          </div>
          {renderLineChart()}
        </div>

        {/* Category Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Brain className="w-4 h-4 text-white" />
              </div>
              Performance by Category
            </h3>
            <div className="space-y-4">
              {Object.entries(getCategoryPerformance())
                .sort(([, a], [, b]) => b.percentage - a.percentage)
                .map(([category, stats]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl"
                  >
                    <div>
                      <span className="font-medium text-white">{category}</span>
                      <span className="text-gray-400 ml-2">
                        ({stats.correct}/{stats.total})
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${stats.percentage}%` }}
                        />
                      </div>
                      <span className="font-medium text-white w-12 text-right">
                        {stats.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Target className="w-6 h-6 mr-3 text-green-400" />
                Performance by Subcategory
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSubcategoryView("best")}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    subcategoryView === "best"
                      ? "bg-green-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:text-white"
                  }`}
                >
                  Top 10
                </button>
                <button
                  onClick={() => setSubcategoryView("worst")}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    subcategoryView === "worst"
                      ? "bg-red-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:text-white"
                  }`}
                >
                  Bottom 10
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {Object.entries(getSubcategoryPerformance())
                .sort(([, a], [, b]) =>
                  subcategoryView === "best"
                    ? b.percentage - a.percentage
                    : a.percentage - b.percentage
                )
                .slice(0, 10)
                .map(([subcategory, stats]) => (
                  <div
                    key={subcategory}
                    className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl"
                  >
                    <div>
                      <span className="font-medium text-white">
                        {subcategory}
                      </span>
                      <span className="text-gray-400 ml-2">
                        ({stats.correct}/{stats.total})
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            subcategoryView === "best"
                              ? "bg-gradient-to-r from-green-500 to-emerald-500"
                              : "bg-gradient-to-r from-red-500 to-orange-500"
                          }`}
                          style={{ width: `${stats.percentage}%` }}
                        />
                      </div>
                      <span className="font-medium text-white w-12 text-right">
                        {stats.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Recent Quizzes */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Zap className="w-6 h-6 mr-3 text-yellow-400" />
            Recent Quiz Results
          </h3>
          {getFilteredHistory().length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">
                No quizzes completed yet
              </p>
              <p className="text-gray-500">
                Start your first quiz to see your progress here!
              </p>
              <Link
                href="/quiz"
                className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Start Quiz
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {getFilteredHistory()
                .slice(-5)
                .reverse()
                .map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          result.accuracy >= 80
                            ? "bg-green-500/20 border border-green-500/30"
                            : result.accuracy >= 60
                              ? "bg-yellow-500/20 border border-yellow-500/30"
                              : "bg-red-500/20 border border-red-500/30"
                        }`}
                      >
                        <span
                          className={`text-lg font-bold ${
                            result.accuracy >= 80
                              ? "text-green-400"
                              : result.accuracy >= 60
                                ? "text-yellow-400"
                                : "text-red-400"
                          }`}
                        >
                          {result.accuracy}%
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {new Date(result.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {result.totalQuestions} questions • {result.timeTaken}
                          s
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">
                        {result.score}
                      </p>
                      <p className="text-gray-400 text-sm">points</p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
