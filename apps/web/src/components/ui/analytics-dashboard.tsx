"use client";

import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Lightbulb,
  LineChart,
  Minus,
  PieChart,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

interface AnalyticsDashboardProps {
  performanceData: any;
}

export default function AnalyticsDashboard({
  performanceData,
}: AnalyticsDashboardProps) {
  const getTrendIcon = (trend: "improving" | "declining" | "stable") => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "declining":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case "stable":
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStrengthIcon = (strength: "strong" | "needs_work" | "weak") => {
    switch (strength) {
      case "strong":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "needs_work":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "weak":
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

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

  const calculateProgress = () => {
    const totalSubcategories = performanceData.subcategoryPerformance.length;
    const strongAreas = performanceData.subcategoryPerformance.filter(
      (s: any) => s.strength === "strong"
    ).length;
    const needsWork = performanceData.subcategoryPerformance.filter(
      (s: any) => s.strength === "needs_work"
    ).length;
    const weakAreas = performanceData.subcategoryPerformance.filter(
      (s: any) => s.strength === "weak"
    ).length;

    return {
      total: totalSubcategories,
      strong: strongAreas,
      needsWork,
      weak: weakAreas,
      strongPercentage: Math.round((strongAreas / totalSubcategories) * 100),
      needsWorkPercentage: Math.round((needsWork / totalSubcategories) * 100),
      weakPercentage: Math.round((weakAreas / totalSubcategories) * 100),
    };
  };

  const progress = calculateProgress();

  return (
    <div className="space-y-8">
      {/* Advanced Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-emerald-600/10 to-emerald-700/10 border border-emerald-500/20 rounded-2xl p-6 hover:border-emerald-500/40 transition-all duration-300 group shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6 text-white" />
            </div>
            <span className="text-emerald-400 text-sm font-medium">
              Strong Areas
            </span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">
            {progress.strong}
          </h3>
          <p className="text-gray-400">
            {progress.strongPercentage}% of topics
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-600/10 to-yellow-700/10 border border-yellow-500/20 rounded-2xl p-6 hover:border-yellow-500/40 transition-all duration-300 group shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-yellow-400 text-sm font-medium">
              Needs Work
            </span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">
            {progress.needsWork}
          </h3>
          <p className="text-gray-400">
            {progress.needsWorkPercentage}% of topics
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-600/10 to-red-700/10 border border-red-500/20 rounded-2xl p-6 hover:border-red-500/40 transition-all duration-300 group shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <span className="text-red-400 text-sm font-medium">Weak Areas</span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">
            {progress.weak}
          </h3>
          <p className="text-gray-400">{progress.weakPercentage}% of topics</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600/10 to-blue-700/10 border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 transition-all duration-300 group shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-blue-400 text-sm font-medium">
              Study Efficiency
            </span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">
            {performanceData.overallStats.averageTimePerQuestion}s
          </h3>
          <p className="text-gray-400">Avg time per question</p>
        </div>
      </div>

      {/* Progress Distribution */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
            <PieChart className="w-4 h-4 text-white" />
          </div>
          Knowledge Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-emerald-400">Strong Areas</span>
              <span className="text-2xl font-bold text-emerald-400">
                {progress.strong}
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-3">
              <div
                className="bg-emerald-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress.strongPercentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {progress.strongPercentage}% of your knowledge base
            </p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-yellow-400">Needs Work</span>
              <span className="text-2xl font-bold text-yellow-400">
                {progress.needsWork}
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-3">
              <div
                className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress.needsWorkPercentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {progress.needsWorkPercentage}% need improvement
            </p>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-red-400">Weak Areas</span>
              <span className="text-2xl font-bold text-red-400">
                {progress.weak}
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-3">
              <div
                className="bg-red-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress.weakPercentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {progress.weakPercentage}% need focus
            </p>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performers */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-6 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
              <Award className="w-4 h-4 text-white" />
            </div>
            Top Performers
          </h3>
          <div className="space-y-4">
            {performanceData.strengthAreas
              .slice(0, 5)
              .map((area: any, index: number) => (
                <div
                  key={area.subcategory}
                  className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center">
                      <span className="text-green-400 font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-white">
                        {area.subcategory}
                      </span>
                      <span className="text-gray-400 ml-2">
                        ({area.totalQuestions} questions)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-20 bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${area.accuracy}%` }}
                      />
                    </div>
                    <span className="font-medium text-green-400 w-12 text-right">
                      {area.accuracy}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Priority Improvements */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-6 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
              <Target className="w-4 h-4 text-white" />
            </div>
            Priority Improvements
          </h3>
          <div className="space-y-4">
            {performanceData.improvementAreas
              .slice(0, 5)
              .map((area: any, index: number) => (
                <div
                  key={area.subcategory}
                  className={`p-4 rounded-xl border ${
                    area.priority === "high"
                      ? "border-red-500 bg-red-500/10"
                      : area.priority === "medium"
                        ? "border-yellow-500 bg-yellow-500/10"
                        : "border-blue-500 bg-blue-500/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          area.priority === "high"
                            ? "bg-red-500"
                            : area.priority === "medium"
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                        }`}
                      >
                        <span className="text-white font-bold text-xs">
                          {index + 1}
                        </span>
                      </div>
                      <span className="font-medium text-white">
                        {area.subcategory}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        area.priority === "high"
                          ? "text-red-400"
                          : area.priority === "medium"
                            ? "text-yellow-400"
                            : "text-blue-400"
                      }`}
                    >
                      {area.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">
                      {area.questionsNeeded} more questions needed
                    </span>
                    <span className="text-red-400 font-bold">
                      {area.currentAccuracy}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Study Insights */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
          Study Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-700/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white mb-2">
              {performanceData.overallStats.totalStudyTime > 0
                ? formatStudyTime(performanceData.overallStats.totalStudyTime)
                : "0m"}
            </div>
            <div className="text-sm text-gray-400">Total Study Time</div>
          </div>
          <div className="bg-gray-700/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white mb-2">
              {performanceData.overallStats.totalQuestions}
            </div>
            <div className="text-sm text-gray-400">Questions Answered</div>
          </div>
          <div className="bg-gray-700/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white mb-2">
              {performanceData.overallStats.averageAccuracy}%
            </div>
            <div className="text-sm text-gray-400">Overall Accuracy</div>
          </div>
          <div className="bg-gray-700/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white mb-2">
              {performanceData.overallStats.totalQuizzes}
            </div>
            <div className="text-sm text-gray-400">Quizzes Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
