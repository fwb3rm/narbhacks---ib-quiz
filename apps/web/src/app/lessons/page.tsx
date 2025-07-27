"use client";

import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle,
  Clock,
  Loader2,
  Play,
  Star,
  Target,
  TrendingUp,
  ChevronDown,
  Filter,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  type Lesson,
  type LessonRecommendation,
  LessonService,
} from "@/lib/lessons";
import { ProgressService, type PerformanceInsight, type QuestionHistory } from "@/lib/progress";

// All potential lesson topics from the quiz API
const ALL_LESSON_TOPICS = {
  accounting: [
    "income statement breakdown",
    "balance sheet breakdown",
    "cash flow statement breakdown",
    "3-statement linkages",
    "accrual vs cash accounting",
    "depreciation & amortization",
    "working capital",
    "inventory methods (FIFO, LIFO)",
    "lease accounting (operating vs capital)",
    "deferred taxes",
    "stock-based compensation",
    "asset write-downs & impairments",
    "shareholders' equity & retained earnings",
    "prepaid vs accrued expenses",
    "interest expense",
    "accounting for debt issuance",
  ],
  valuation: [
    "DCF analysis",
    "comparable company analysis",
    "precedent transactions",
    "WACC calculation",
    "beta estimation",
    "terminal value",
    "multiples analysis (EV/EBITDA, P/E, etc.)",
    "enterprise value vs equity value",
    "dilution impact",
    "sensitivity analysis",
    "calendarization & LTM adjustments",
    "sum-of-the-parts (SOTP) valuation",
    "adjusting comparables",
    "equity value bridges",
    "control premiums & discounts",
  ],
  "M&A": [
    "deal structures (cash vs stock)",
    "merger model mechanics",
    "accretion/dilution analysis",
    "purchase price allocation (PPA)",
    "synergy analysis",
    "goodwill creation in M&A",
    "financing options in M&A",
    "due diligence process",
    "regulatory review & antitrust",
    "pro forma financial statements",
    "deal protection mechanisms",
    "earnouts & contingent payments",
    "target valuation in M&A context",
    "hostile takeovers & defense mechanisms",
    "shareholder approval & board dynamics",
  ],
  LBO: [
    "LBO capital structure",
    "sources & uses of funds",
    "types of debt financing",
    "cash flow modeling in LBOs",
    "working capital in LBOs",
    "IRR calculation & return drivers",
    "debt covenants & restrictions",
    "credit metrics (debt/EBITDA, interest coverage)",
    "dividend recapitalization",
    "refinancing strategies",
    "exit strategies (IPO, M&A, secondary)",
    "management incentives",
    "operational improvements",
    "roll-forward of debt",
  ],
  "capital markets": [
    "IPO process overview",
    "bookbuilding process",
    "underwriting & syndication",
    "equity vs debt offerings",
    "debt issuance mechanics",
    "pricing strategies for offerings",
    "roadshows & investor presentations",
    "regulatory filings (S-1, 10-K, etc.)",
    "market timing considerations",
    "convertible securities",
    "high-yield vs investment-grade debt",
    "private placements",
    "PIPE deals",
    "secondary offerings",
    "credit ratings impact",
    "investor relations strategy",
  ],
  "corporate finance": [
    "capital budgeting (NPV, IRR)",
    "internal rate of return (IRR)",
    "working capital management",
    "dividend policy decisions",
    "capital structure optimization",
    "cost of capital estimation",
    "financial planning & forecasting",
    "treasury operations",
    "risk management strategies",
    "scenario & sensitivity analysis",
    "restructuring & turnaround strategy",
    "strategic alternatives (M&A, dividends, buybacks)",
    "bankruptcy process & recovery",
    "basic financial modeling",
    "return on invested capital (ROIC)",
    "management reporting & KPIs",
  ],
  "technical modeling": [
    "modeling circular references",
    "building a debt schedule",
    "forecasting working capital",
    "modeling revolvers & minimum cash",
    "tracing model errors",
    "Excel modeling best practices",
  ],
};

export default function LessonsPage() {
  const [recommendations, setRecommendations] = useState<
    LessonRecommendation[]
  >([]);
  const [savedLessons, setSavedLessons] = useState<Lesson[]>([]);
  const [_loading, _setLoading] = useState(false);
  const [generatingLesson, setGeneratingLesson] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [showAllTopics, setShowAllTopics] = useState(false);
  const [showPerformanceInsights, setShowPerformanceInsights] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [performanceInsights, setPerformanceInsights] = useState<PerformanceInsight[]>([]);
  const [insightsLoaded, setInsightsLoaded] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [showRecommendedLessons, setShowRecommendedLessons] = useState(true);
  const [showSavedLessons, setShowSavedLessons] = useState(true);
  const [detailedAnalysis, setDetailedAnalysis] = useState<{[key: string]: any}>({});
  const [loadingAnalysis, setLoadingAnalysis] = useState<string | null>(null);

  const loadData = useCallback(() => {
    // Get subcategory performance from progress data
    const subcategoryPerformance = ProgressService.getSubcategoryPerformance();
    const lessonRecommendations = LessonService.getLessonRecommendations(
      subcategoryPerformance
    );
    setRecommendations(lessonRecommendations);

    // Load saved lessons
    const lessons = LessonService.getAllLessons();
    setSavedLessons(lessons);
  }, []);

  const loadPerformanceInsights = useCallback(() => {
    if (insightsLoaded) return; // Cache the insights to avoid recalculating

    // Only load basic performance data, not detailed analysis
    const insights = ProgressService.getWeakestSubcategoriesWithThreshold(5, 2);
    console.log('Loading basic performance insights:', insights);
    console.log('Total question history:', ProgressService.getAllQuestionHistory().length);
    setPerformanceInsights(insights);
    setInsightsLoaded(true);
  }, [insightsLoaded]);

  const refreshPerformanceInsights = useCallback(() => {
    setInsightsLoaded(false);
    // Use the improved method that considers both accuracy and number of questions
    const insights = ProgressService.getWeakestSubcategoriesWithThreshold(5, 2);
    console.log('Refreshing performance insights:', insights);
    console.log('All subcategories with performance:', ProgressService.getAllSubcategoriesWithPerformance());
    setPerformanceInsights(insights);
    setInsightsLoaded(true);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (showPerformanceInsights && !insightsLoaded) {
      loadPerformanceInsights();
    }
  }, [showPerformanceInsights, insightsLoaded, loadPerformanceInsights]);

  const generateLesson = async (
    subcategory: string
  ) => {
    setGeneratingLesson(subcategory);
    try {
      const lesson = await LessonService.generateLesson(
        subcategory,
        "intermediate"
      );
      setSavedLessons((prev) => [...prev, lesson]);
      setGeneratingLesson(null);
    } catch (error) {
      console.error("Error generating lesson:", error);
      setGeneratingLesson(null);
      alert("Failed to generate lesson. Please try again.");
    }
  };

  const generateDetailedAnalysis = async (subcategory: string) => {
    if (detailedAnalysis[subcategory]) return; // Already loaded
    
    setLoadingAnalysis(subcategory);
    try {
      // Get the data we need to send
      const performanceData = ProgressService.getPerformanceInsights(subcategory);
      const wrongAnswers = ProgressService.getWrongAnswersBySubcategory(subcategory);
      const patterns = ProgressService.analyzeWrongAnswerPatterns(subcategory);
      
      console.log('Sending analysis request for:', subcategory);
      console.log('Performance data:', performanceData);
      console.log('Wrong answers count:', wrongAnswers.length);
      console.log('Patterns:', patterns);

      const response = await fetch("/api/generate-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subcategory,
          performanceData,
          wrongAnswers,
          patterns,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const analysis = await response.json();
      console.log('Received analysis:', analysis);
      
      setDetailedAnalysis(prev => ({
        ...prev,
        [subcategory]: analysis
      }));
    } catch (error) {
      console.error("Error generating detailed analysis:", error);
      
      // More specific error messages
      if (error instanceof TypeError && (error as Error).message.includes('fetch')) {
        alert("Network error: Please check if the API server is running");
      } else if (error instanceof Error && error.message.includes('HTTP error')) {
        alert(`Server error: ${error.message}`);
      } else {
        alert("Failed to generate detailed analysis. Please try again.");
      }
    } finally {
      setLoadingAnalysis(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "low":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/30";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      case "intermediate":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "advanced":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/30";
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return "text-green-400";
    if (accuracy >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const toggleQuestionExpansion = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // Get all topics with performance data
  const getAllTopicsWithPerformance = () => {
    const subcategoryPerformance = ProgressService.getSubcategoryPerformance();
    const allTopics: Array<{
      category: string;
      subcategory: string;
      accuracy: number;
      totalQuestions: number;
      correctAnswers: number;
    }> = [];

    Object.entries(ALL_LESSON_TOPICS).forEach(([category, subcategories]) => {
      subcategories.forEach((subcategory) => {
        const performance = subcategoryPerformance[subcategory] || {
          correct: 0,
          total: 0,
          accuracy: 0,
        };
        allTopics.push({
          category,
          subcategory,
          accuracy: performance.accuracy,
          totalQuestions: performance.total,
          correctAnswers: performance.correct,
        });
      });
    });

    return allTopics.sort((a, b) => b.totalQuestions - a.totalQuestions);
  };

  const allTopicsWithPerformance = getAllTopicsWithPerformance();

  // Filter topics based on selected category and difficulty
  const filteredTopics = allTopicsWithPerformance.filter((topic) => {
    const categoryMatch = selectedCategory === "all" || topic.category === selectedCategory;
    return categoryMatch;
  });

  // Get performance insights for selected subcategory
  const selectedInsights = selectedSubcategory 
    ? ProgressService.getPerformanceInsights(selectedSubcategory)
    : null;

  // Get recent wrong answers
  const recentWrongAnswers = ProgressService.getRecentWrongAnswers(7);
  const weakestSubcategories = ProgressService.getWeakestSubcategories(5);

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
                <ArrowRight className="w-5 h-5" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI-Powered Lessons
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Personalized lessons based on your quiz performance. Focus on areas
            where you need improvement.
          </p>

        </div>

        {/* Performance Insights Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              Performance Insights
            </h2>
            <button
              onClick={() => setShowPerformanceInsights(!showPerformanceInsights)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200"
            >
              <span>{showPerformanceInsights ? "Hide" : "Show"} Insights</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showPerformanceInsights ? "rotate-180" : ""}`} />
            </button>
          </div>

          {showPerformanceInsights && (
            <div className="space-y-6">
              {/* Weakest Subcategories */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Your Weakest Areas</h3>
                    <p className="text-sm text-gray-400">Click any area to see detailed analysis</p>
                  </div>
                  <button
                    onClick={refreshPerformanceInsights}
                    className="flex items-center space-x-2 px-3 py-2 bg-orange-600/20 border border-orange-500/30 rounded-lg text-orange-400 hover:bg-orange-600/30 transition-all duration-200"
                  >
                    <span className="text-sm">Refresh</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {performanceInsights.map((insight) => (
                    <div
                      key={insight.subcategory}
                      className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-6 hover:border-gray-500/50 transition-all duration-200 shadow-xl group cursor-pointer"
                      onClick={() => setSelectedSubcategory(insight.subcategory)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 rounded-full text-sm font-medium border text-red-400 bg-red-500/20 border-red-500/30">
                          HIGH PRIORITY
                        </span>
                        <span className={`text-lg font-bold ${getAccuracyColor(insight.currentAccuracy)}`}>
                          {insight.currentAccuracy}%
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2 group-hover:text-orange-300 transition-colors">
                        {insight.subcategory.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </h3>
                      
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                        <span>Questions: {insight.totalQuestions}</span>
                        <span>Wrong: {insight.patterns.totalWrongAnswers}</span>
                      </div>

                      {insight.conceptualGaps.length > 0 && (
                        <div className="bg-purple-600/10 border border-purple-500/20 rounded-lg p-3 mb-4">
                          <div className="text-xs font-medium text-purple-300 mb-1">Key Concept Gap:</div>
                          <div className="text-sm text-purple-200 leading-relaxed">
                            {insight.conceptualGaps[0]}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            generateDetailedAnalysis(insight.subcategory);
                            setSelectedSubcategory(insight.subcategory);
                          }}
                          disabled={loadingAnalysis === insight.subcategory}
                          className="w-full px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingAnalysis === insight.subcategory ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <span>View Analysis</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Subcategory Details */}
              {(() => {
                const selectedInsights = selectedSubcategory 
                  ? performanceInsights.find(insight => insight.subcategory === selectedSubcategory)
                  : null;
                const analysis = detailedAnalysis[selectedSubcategory];
                
                return selectedInsights && (
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">
                      AI Analysis: {selectedInsights.subcategory.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </h3>
                    <button
                      onClick={() => setSelectedSubcategory("")}
                      className="text-gray-400 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                  
                  {loadingAnalysis === selectedSubcategory ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent mx-auto mb-4"></div>
                        <p className="text-gray-400">Generating AI-powered analysis...</p>
                        <p className="text-sm text-gray-500 mt-2">Analyzing your performance patterns and generating personalized insights</p>
                      </div>
                    </div>
                  ) : analysis ? (
                    <div className="space-y-6">
                      {/* AI-Generated Analysis */}
                      <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-4">
                        <h4 className="font-semibold text-white mb-3 flex items-center">
                          <span className="text-blue-400 mr-2">🤖</span>
                          AI Analysis Summary
                        </h4>
                        <p className="text-gray-300 leading-relaxed">
                          {analysis.summary || "AI analysis generated successfully."}
                        </p>
                      </div>

                      {/* Key Weaknesses */}
                      {analysis.keyWeaknesses && analysis.keyWeaknesses.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-white mb-3">Key Weaknesses Identified</h4>
                          <div className="space-y-2">
                            {analysis.keyWeaknesses.map((weakness: string, index: number) => (
                              <div key={index} className="bg-red-600/10 border border-red-500/20 rounded-lg p-3">
                                <div className="text-sm text-red-300 leading-relaxed">{weakness}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Improvement Strategies */}
                      {analysis.improvementStrategies && analysis.improvementStrategies.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-white mb-3">Recommended Improvement Strategies</h4>
                          <div className="space-y-2">
                            {analysis.improvementStrategies.map((strategy: string, index: number) => (
                              <div key={index} className="bg-green-600/10 border border-green-500/20 rounded-lg p-3">
                                <div className="text-sm text-green-300 leading-relaxed">{strategy}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Practice Focus Areas */}
                      {analysis.practiceFocusAreas && analysis.practiceFocusAreas.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-white mb-3">Practice Focus Areas</h4>
                          <div className="flex flex-wrap gap-2">
                            {analysis.practiceFocusAreas.map((area: string, index: number) => (
                              <span key={index} className="px-3 py-1 bg-orange-600/20 border border-orange-500/30 rounded-full text-sm text-orange-400">
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Basic Performance Data */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-600/30">
                        <div>
                          <h4 className="font-semibold text-white mb-2">Performance Summary</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Accuracy:</span>
                              <span className={`font-medium ${getAccuracyColor(selectedInsights.currentAccuracy)}`}>
                                {selectedInsights.currentAccuracy}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Total Questions:</span>
                              <span className="text-white">{selectedInsights.totalQuestions}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Wrong Answers:</span>
                              <span className="text-red-400">{selectedInsights.patterns.totalWrongAnswers}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Avg Time (wrong):</span>
                              <span className="text-white">{selectedInsights.patterns.averageTimeOnWrongAnswers}s</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-white mb-2">Common Mistakes</h4>
                          <div className="space-y-2">
                            {selectedInsights.patterns.commonMistakes.length > 0 ? (
                              selectedInsights.patterns.commonMistakes.slice(0, 3).map((mistake, index) => (
                                <div key={index} className="text-sm text-gray-300 bg-gray-700/50 rounded p-2">
                                  {mistake}
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-gray-400">No patterns detected yet</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Click "View Analysis" to generate AI-powered insights</p>
                    </div>
                  )}
                </div>
              );
            })()}

              {/* Recent Wrong Answers */}
              {(() => {
                const recentWrongAnswers = ProgressService.getRecentWrongAnswers();
                return recentWrongAnswers.length > 0 ? (
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">Recent Wrong Answers</h3>
                        <p className="text-sm text-gray-400">Click to expand and see full questions</p>
                      </div>
                    </div>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {recentWrongAnswers.slice(0, 6).map((wrong) => {
                        const isExpanded = expandedQuestions.has(wrong.id);
                        return (
                          <div
                            key={wrong.id}
                            className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-xl p-4 hover:border-gray-500/50 transition-all duration-200 shadow-lg flex items-center justify-between relative"
                          >
                            <div className="flex items-center space-x-4 flex-1">
                              <span className="px-2 py-1 rounded-full text-xs font-medium border text-yellow-400 bg-yellow-500/20 border-yellow-500/30">
                                RECENT
                              </span>
                              <span className="text-xs px-2 py-1 bg-gray-600/50 rounded-full text-gray-300">
                                {wrong.timeTaken}s
                              </span>
                              <h3 className="text-sm font-semibold text-white flex-1">
                                {wrong.subcategory.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              </h3>

                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleQuestionExpansion(wrong.id);
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md flex items-center space-x-2 text-sm font-medium"
                            >
                              <span>{isExpanded ? "Hide" : "View"}</span>
                              {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>

                            {isExpanded && (
                              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 border border-gray-600/30 rounded-xl p-4 space-y-3 z-10 shadow-xl">
                                <div className="bg-gray-800/50 rounded-lg p-3">
                                  <div className="text-sm text-white font-medium mb-2">Full Question:</div>
                                  <div className="text-sm text-gray-300 leading-relaxed">
                                    {wrong.questionText}
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                  <div className="bg-red-600/10 border border-red-500/20 rounded-lg p-3">
                                    <div className="text-xs font-medium text-red-300 mb-1">Your Answer:</div>
                                    <div className="text-sm text-red-200">{wrong.userAnswer}</div>
                                  </div>
                                  <div className="bg-green-600/10 border border-green-500/20 rounded-lg p-3">
                                    <div className="text-xs font-medium text-green-300 mb-1">Correct Answer:</div>
                                    <div className="text-sm text-green-200">{wrong.correctAnswer}</div>
                                  </div>
                                </div>
                                {wrong.explanation && (
                                  <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-3">
                                    <div className="text-xs font-medium text-blue-300 mb-1">Explanation:</div>
                                    <div className="text-sm text-blue-200 leading-relaxed">
                                      {wrong.explanation}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>

        {/* All Topics Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                <Filter className="w-4 h-4 text-white" />
              </div>
              All Lesson Topics
            </h2>
            <button
              onClick={() => setShowAllTopics(!showAllTopics)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              <span>{showAllTopics ? "Hide" : "Show"} All Topics</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showAllTopics ? "rotate-180" : ""}`} />
            </button>
          </div>

          {showAllTopics && (
            <>
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                                     {Object.keys(ALL_LESSON_TOPICS).map((category) => (
                     <option key={category} value={category}>
                       {category.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                     </option>
                   ))}
                </select>


              </div>

              {/* Topics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {filteredTopics.map((topic) => (
                  <div
                    key={topic.subcategory}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-xl p-4 hover:border-gray-500/50 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                                             <span className="text-xs px-2 py-1 bg-gray-700 rounded-full text-gray-300">
                         {topic.category.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                       </span>
                      <span className={`text-sm font-medium ${getAccuracyColor(topic.accuracy)}`}>
                        {topic.accuracy}%
                      </span>
                    </div>
                    
                    <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2">
                      {topic.subcategory.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </h3>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                      <span>{topic.totalQuestions} questions</span>
                      <span>{topic.correctAnswers} correct</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => generateLesson(topic.subcategory)}
                        disabled={generatingLesson === topic.subcategory}
                        className="w-full px-3 py-1.5 text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        {generatingLesson === topic.subcategory ? (
                          <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                        ) : (
                          "Generate Lesson"
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Recommendations Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Target className="w-4 h-4 text-white" />
              </div>
              Recommended Lessons
            </h2>
            <button
              onClick={() => setShowRecommendedLessons(!showRecommendedLessons)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              <span>{showRecommendedLessons ? "Hide" : "Show"} Recommendations</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showRecommendedLessons ? "rotate-180" : ""}`} />
            </button>
          </div>

          {showRecommendedLessons && (
            <>
              {recommendations.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl shadow-xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-400 text-lg mb-2">
                    No recommendations yet
                  </p>
                  <p className="text-gray-500">
                    Complete some quizzes to get personalized lesson
                    recommendations!
                  </p>
                  <Link
                    href="/quiz"
                    className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                  >
                    Start Quiz
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.slice(0, 9).map((rec, _index) => (
                    <div
                      key={rec.subcategory}
                      className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-6 hover:border-gray-500/50 transition-all duration-200 shadow-xl group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(rec.priority)}`}
                        >
                          {rec.priority.toUpperCase()} PRIORITY
                        </span>

                      </div>

                      <h3 className="text-xl font-bold text-white mb-2">
                        {rec.subcategory.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">{rec.reason}</p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                            <Star className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm text-gray-300">
                            {rec.currentAccuracy}% accuracy
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          generateLesson(rec.subcategory)
                        }
                        disabled={generatingLesson === rec.subcategory}
                        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg group-hover:shadow-blue-500/25"
                      >
                        {generatingLesson === rec.subcategory ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5" />
                            <span>Generate Lesson</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Saved Lessons Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              Your Lessons
            </h2>
            <button
              onClick={() => setShowSavedLessons(!showSavedLessons)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
            >
              <span>{showSavedLessons ? "Hide" : "Show"} Lessons</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showSavedLessons ? "rotate-180" : ""}`} />
            </button>
          </div>

          {showSavedLessons && (
            <>
              {savedLessons.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl shadow-xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-400 text-lg mb-2">No lessons yet</p>
                  <p className="text-gray-500">
                    Generate your first lesson to get started!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-6 hover:border-gray-500/50 transition-all duration-200 shadow-xl group"
                    >
                      <div className="flex items-center justify-end mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                            <Clock className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm text-gray-400">
                            {lesson.estimatedTime} min
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2">
                        {lesson.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        {lesson.subcategory.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </p>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm text-gray-300">
                            {lesson.keyConcepts.length} key concepts
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Brain className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-gray-300">
                            {lesson.commonMistakes.length} common mistakes
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-gray-300">
                            {lesson.practiceQuestions.length} practice questions
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/lessons/${lesson.id}`}
                        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
                      >
                        <BookOpen className="w-5 h-5" />
                        <span>Start Lesson</span>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/quiz"
              className="flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-600/20 to-blue-700/20 border border-blue-500/30 rounded-xl hover:border-blue-400/50 transition-all duration-200"
            >
              <Play className="w-8 h-8 text-blue-400" />
              <div>
                <h4 className="font-bold text-white">Take a Quiz</h4>
                <p className="text-gray-400 text-sm">Test your knowledge</p>
              </div>
            </Link>

            <Link
              href="/progress"
              className="flex items-center space-x-4 p-6 bg-gradient-to-r from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded-xl hover:border-purple-400/50 transition-all duration-200"
            >
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <div>
                <h4 className="font-bold text-white">View Progress</h4>
                <p className="text-gray-400 text-sm">Track your performance</p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => {
                LessonService.clearAllLessons();
                setSavedLessons([]);
              }}
              className="flex items-center space-x-4 p-6 bg-gradient-to-r from-red-600/20 to-red-700/20 border border-red-500/30 rounded-xl hover:border-red-400/50 transition-all duration-200"
            >
              <BookOpen className="w-8 h-8 text-red-400" />
              <div>
                <h4 className="font-bold text-white">Clear Lessons</h4>
                <p className="text-gray-400 text-sm">Start fresh</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
