"use client";

import { useQuery } from "convex/react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CheckCircle,
  Clock,
  Lightbulb,
  Minus,
  Target,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";

interface SubcategoryAnalysisProps {
  subcategory: string;
  onClose: () => void;
}

export default function SubcategoryAnalysis({
  subcategory,
  onClose,
}: SubcategoryAnalysisProps) {
  const analysis = useQuery(api.performance.getSubcategoryAnalysis, {
    subcategory,
    userId: undefined,
  });

  if (!analysis) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading analysis...</p>
          </div>
        </div>
      </div>
    );
  }

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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {getStrengthIcon(analysis.strength)}
            <div>
              <h2 className="text-2xl font-bold text-white">
                {analysis.subcategory}
              </h2>
              <p className="text-gray-400">{analysis.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-700/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {analysis.accuracy}%
            </div>
            <div className="text-sm text-gray-400">Accuracy</div>
          </div>
          <div className="bg-gray-700/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {analysis.totalQuestions}
            </div>
            <div className="text-sm text-gray-400">Questions</div>
          </div>
          <div className="bg-gray-700/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {analysis.correctAnswers}
            </div>
            <div className="text-sm text-gray-400">Correct</div>
          </div>
          <div className="bg-gray-700/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {formatTime(analysis.averageTime)}
            </div>
            <div className="text-sm text-gray-400">Avg Time</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Difficulty Breakdown */}
          <div className="bg-gray-700/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
              Performance by Difficulty
            </h3>
            <div className="space-y-4">
              {Object.entries(analysis.difficultyBreakdown).map(
                ([difficulty, stats]: [string, any]) => (
                  <div
                    key={difficulty}
                    className="bg-gray-600/30 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white capitalize">
                        {difficulty}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {stats.total} questions
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-lg font-bold ${getStrengthColor(analysis.strength)}`}
                      >
                        {stats.accuracy}%
                      </span>
                      <span className="text-gray-400 text-sm">
                        {stats.correct}/{stats.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          difficulty === "easy"
                            ? "bg-green-500"
                            : difficulty === "medium"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${stats.accuracy}%` }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Recent Performance */}
          <div className="bg-gray-700/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              Recent Performance
            </h3>
            <div className="space-y-3">
              {analysis.recentPerformance
                .slice(0, 5)
                .map((performance: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-600/30 rounded-lg"
                  >
                    <div>
                      <div className="text-sm text-gray-400">
                        {new Date(performance.date).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {performance.questionsAnswered} questions
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-bold ${
                          performance.accuracy >= 80
                            ? "text-green-400"
                            : performance.accuracy >= 60
                              ? "text-yellow-400"
                              : "text-red-400"
                        }`}
                      >
                        {performance.accuracy}%
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Common Mistakes */}
        {analysis.commonMistakes.length > 0 && (
          <div className="bg-gray-700/30 rounded-xl p-6 mt-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
              Common Mistakes
            </h3>
            <div className="space-y-4">
              {analysis.commonMistakes.map((mistake: any, index: number) => (
                <div key={index} className="bg-gray-600/30 rounded-lg p-4">
                  <div className="mb-2">
                    <span className="text-sm text-gray-400">
                      Question {index + 1}:
                    </span>
                    <p className="text-white text-sm mt-1">
                      {mistake.question}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-red-400 font-medium">
                        Your Answer:
                      </span>
                      <p className="text-gray-300 mt-1">{mistake.userAnswer}</p>
                    </div>
                    <div>
                      <span className="text-green-400 font-medium">
                        Correct Answer:
                      </span>
                      <p className="text-gray-300 mt-1">
                        {mistake.correctAnswer}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <span className="text-blue-400 font-medium text-sm">
                      Explanation:
                    </span>
                    <p className="text-gray-300 text-sm mt-1">
                      {mistake.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-gray-700/30 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
            Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 bg-gray-600/30 rounded-lg"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-300 text-sm">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
          >
            Close
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
            Practice This Topic
          </button>
        </div>
      </div>
    </div>
  );
}
