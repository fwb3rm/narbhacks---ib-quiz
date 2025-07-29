"use client";

import { useQuery } from "convex/react";
import {
  Activity,
  BarChart3,
  BookOpen,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

// Simple line chart component
const LineChart = ({
  data,
  title,
  color,
  showPercentage = false,
}: {
  data: Array<{ date: string; value: number }>;
  title: string;
  color: string;
  showPercentage?: boolean;
}) => {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue;

  // Calculate padding for labels
  const labelHeight = 20;
  const chartHeight = 120;
  const totalHeight = chartHeight + labelHeight;

  return (
    <div className="bg-gradient-to-r from-gray-700/20 to-gray-800/20 border border-gray-600/30 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="relative h-48">
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${data.length * 60} ${totalHeight}`}
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={labelHeight + (chartHeight - (y / 100) * chartHeight)}
              x2={data.length * 60}
              y2={labelHeight + (chartHeight - (y / 100) * chartHeight)}
              stroke="rgba(156, 163, 175, 0.2)"
              strokeWidth="1"
            />
          ))}

          {/* Line chart */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={data
              .map((d, i) => {
                const x = i * 60;
                const y =
                  range === 0
                    ? labelHeight + chartHeight / 2
                    : labelHeight +
                      (chartHeight -
                        ((d.value - minValue) / range) * chartHeight);
                return `${x},${y}`;
              })
              .join(" ")}
          />

          {/* Data points and labels */}
          {data.map((d, i) => {
            const x = i * 60;
            const y =
              range === 0
                ? labelHeight + chartHeight / 2
                : labelHeight +
                  (chartHeight - ((d.value - minValue) / range) * chartHeight);
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill={color}
                  className="hover:r-5 transition-all duration-200"
                />
                {/* Value label - positioned above or below based on available space */}
                <text
                  x={x}
                  y={y > labelHeight + chartHeight / 2 ? y - 8 : y + 16}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {showPercentage
                    ? `${d.value.toFixed(1)}%`
                    : d.value.toFixed(1)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
};

export default function ProgressPage() {
  const allQuizResults = useQuery(api.quiz.getAllQuizResults);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "all" | "week" | "month"
  >("all");

  // Calculate basic progress stats
  const calculateProgress = () => {
    if (!allQuizResults || allQuizResults.length === 0) {
      return {
        averageScore: 0,
        averageAccuracy: 0,
        averageTimePerQuestion: 0,
        totalTime: 0,
        recentQuizzes: [],
        chartData: {
          scores: [],
          questionsAnswered: [],
          accuracy: [],
        },
      };
    }

    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    let filteredResults = allQuizResults;
    if (selectedPeriod === "week") {
      filteredResults = allQuizResults.filter(
        (result) => new Date(result.date).getTime() > oneWeekAgo
      );
    } else if (selectedPeriod === "month") {
      filteredResults = allQuizResults.filter(
        (result) => new Date(result.date).getTime() > oneMonthAgo
      );
    }

    const totalQuizzes = filteredResults.length;
    const totalQuestions = filteredResults.reduce(
      (sum, result) => sum + result.totalQuestions,
      0
    );
    const correctAnswers = filteredResults.reduce(
      (sum, result) => sum + result.correctAnswers,
      0
    );
    const averageAccuracy =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const averageScore =
      totalQuizzes > 0
        ? filteredResults.reduce((sum, result) => sum + result.score, 0) /
          totalQuizzes
        : 0;
    const totalTime = filteredResults.reduce(
      (sum, result) => sum + result.timeTaken,
      0
    );
    const averageTimePerQuestion =
      totalQuestions > 0 ? totalTime / totalQuestions : 0;

    // Sort by date for chart data
    const sortedResults = filteredResults.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Prepare chart data
    const chartData = {
      scores: sortedResults.map((result) => ({
        date: new Date(result.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        value: result.score,
      })),
      questionsAnswered: sortedResults.map((result) => ({
        date: new Date(result.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        value: result.totalQuestions,
      })),
      accuracy: sortedResults.map((result) => ({
        date: new Date(result.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        value: result.accuracy,
      })),
    };

    const recentQuizzes = filteredResults
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      averageScore,
      averageAccuracy,
      averageTimePerQuestion,
      totalTime,
      recentQuizzes,
      chartData,
    };
  };

  const progress = calculateProgress();

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

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
                href="/quiz"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-200"
              >
                Take Quiz
              </Link>
              <Link
                href="/performance-insights"
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-1 transition-all duration-200"
              >
                Performance Insights
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-10 leading-tight tracking-tight">
            Progress Tracking
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-16 leading-relaxed max-w-4xl mx-auto font-light">
            Track your learning journey and see your improvement over time
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-gray-800/50 rounded-xl p-1">
            <button
              onClick={() => setSelectedPeriod("all")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                selectedPeriod === "all"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setSelectedPeriod("month")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                selectedPeriod === "month"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setSelectedPeriod("week")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                selectedPeriod === "week"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              This Week
            </button>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {progress.averageScore.toFixed(1)}
            </h3>
            <p className="text-gray-400">Average Score</p>
          </div>

          <div className="bg-gradient-to-r from-green-600/10 to-green-700/10 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {progress.averageAccuracy.toFixed(1)}%
            </h3>
            <p className="text-gray-400">Average Accuracy</p>
          </div>

          <div className="bg-gradient-to-r from-yellow-600/10 to-yellow-700/10 border border-yellow-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {progress.averageTimePerQuestion.toFixed(2)}s
            </h3>
            <p className="text-gray-400">Avg Time/Question</p>
          </div>

          <div className="bg-gradient-to-r from-purple-600/10 to-purple-700/10 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {formatTime(progress.totalTime)}
            </h3>
            <p className="text-gray-400">Total Study Time</p>
          </div>
        </div>

        {/* Progress Charts */}
        {progress.chartData.scores.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <BarChart3 className="w-6 h-6 mr-3 text-blue-400" />
              Progress Over Time
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <LineChart
                data={progress.chartData.scores}
                title="Score Trend"
                color="#3B82F6"
              />
              <LineChart
                data={progress.chartData.questionsAnswered}
                title="Questions Answered"
                color="#10B981"
              />
              <LineChart
                data={progress.chartData.accuracy}
                title="Accuracy Trend"
                color="#F59E0B"
                showPercentage={true}
              />
            </div>
          </div>
        )}

        {/* Recent Quizzes */}
        <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <BarChart3 className="w-6 h-6 mr-3 text-blue-400" />
            Recent Quizzes
          </h2>

          {progress.recentQuizzes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No Quizzes Yet
              </h3>
              <p className="text-gray-400 mb-4">
                Take your first quiz to start tracking your progress.
              </p>
              <Link
                href="/quiz"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-200"
              >
                Start Quiz
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {progress.recentQuizzes.map((quiz, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-gray-700/20 to-gray-800/20 border border-gray-600/30 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-300">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">
                          Quiz #{quiz.totalQuestions} Questions
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {new Date(quiz.date).toLocaleDateString()} •{" "}
                          {formatTime(quiz.timeTaken)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">
                        {quiz.accuracy.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-400">
                        {quiz.correctAnswers}/{quiz.totalQuestions} correct
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom spacing to prevent abrupt ending */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}
