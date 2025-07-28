"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ProgressService } from "@/lib/progress";

interface QuestionType {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  category?: string;
  subcategory?: string;
  type?: "pre-generated" | "ai-generated";
  difficulty?: "easy" | "medium" | "hard";
  points?: number;
}

export default function Quiz() {
  const saveQuizResult = useMutation(api.quiz.saveQuizResult);
  // Quiz component updated to use hardcoded questions - NO CONVEX CALLS
  const [question, setQuestion] = useState<QuestionType | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [score, setScore] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [timerActive, setTimerActive] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [showQuestionReview, setShowQuestionReview] = useState(false);
  const [_questionType, setQuestionType] = useState<
    "pre-generated" | "ai-generated"
  >("pre-generated");
  const [answeredQuestions, setAnsweredQuestions] = useState<
    Array<{
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
    }>
  >([]);

  // Difficulty distribution tracking
  const [difficultyCounts, setDifficultyCounts] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });

  // Target distribution: 30% easy, 50% medium, 20% hard
  const targetDistribution = {
    easy: 0.3,
    medium: 0.5,
    hard: 0.2,
  };

  // Function to determine which difficulty to request next
  const getNextDifficulty = useCallback(() => {
    const totalQuestions = Math.max(questionNumber, 1); // Prevent division by zero
    const currentDistribution = {
      easy: difficultyCounts.easy / totalQuestions,
      medium: difficultyCounts.medium / totalQuestions,
      hard: difficultyCounts.hard / totalQuestions,
    };

    // Calculate how far we are from target for each difficulty
    const deviations = {
      easy: targetDistribution.easy - currentDistribution.easy,
      medium: targetDistribution.medium - currentDistribution.medium,
      hard: targetDistribution.hard - currentDistribution.hard,
    };

    // Find the difficulty that needs more questions
    let nextDifficulty = "medium"; // default
    let maxDeviation = -1;

    Object.entries(deviations).forEach(([difficulty, deviation]) => {
      if (deviation > maxDeviation) {
        maxDeviation = deviation;
        nextDifficulty = difficulty;
      }
    });

    return nextDifficulty as "easy" | "medium" | "hard";
  }, [questionNumber, difficultyCounts]);

  const fetchQuestion = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextDifficulty = getNextDifficulty();
      console.log(`Requesting question with difficulty: ${nextDifficulty}`);
      
      // Use hardcoded questions for now
      const questions = [
        {
          question: "What is the primary purpose of a P/E ratio in valuation?",
          options: [
            "To measure a company's debt levels",
            "To compare a company's stock price to its earnings",
            "To calculate a company's cash flow",
            "To determine a company's market share",
          ],
          answer: "To compare a company's stock price to its earnings",
          explanation: "The P/E ratio compares a company's stock price to its earnings per share, helping investors assess valuation.",
          category: "Investment Banking",
          subcategory: "Valuation",
          difficulty: nextDifficulty,
          points: 100,
          type: "pre-generated" as const,
        },
        {
          question: "What is EBITDA?",
          options: [
            "Earnings Before Interest, Taxes, Depreciation, and Amortization",
            "Earnings Before Interest and Taxes",
            "Earnings Before Depreciation and Amortization",
            "Earnings Before Taxes",
          ],
          answer: "Earnings Before Interest, Taxes, Depreciation, and Amortization",
          explanation: "EBITDA is a measure of a company's operating performance.",
          category: "Investment Banking",
          subcategory: "Accounting",
          difficulty: nextDifficulty,
          points: 100,
          type: "pre-generated" as const,
        },
        {
          question: "What is the main purpose of a DCF valuation?",
          options: [
            "To determine a company's current market value",
            "To estimate a company's intrinsic value based on future cash flows",
            "To calculate a company's book value",
            "To assess a company's historical performance",
          ],
          answer: "To estimate a company's intrinsic value based on future cash flows",
          explanation: "DCF valuation estimates a company's intrinsic value by discounting its projected future cash flows to present value.",
          category: "Investment Banking",
          subcategory: "Valuation",
          difficulty: nextDifficulty,
          points: 150,
          type: "pre-generated" as const,
        }
      ];
      
      // Pick a random question
      const randomIndex = Math.floor(Math.random() * questions.length);
      const data = questions[randomIndex];
      
      console.log(`Selected question: ${data.question}`);
      setQuestion(data);
      setSelected(null);
      setFeedback("");
      setIsCorrect(null);
      setHasAnswered(false);
      setShowNotification(false);

      // Use the actual question type from the API response
      setQuestionType(data.type || "pre-generated");
    } catch (error) {
      console.error("Failed to fetch question:", error);
      setFeedback("Failed to load question. Please try again.");
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  }, [getNextDifficulty]);

  useEffect(() => {
    fetchQuestion();
  }, []); // Only run once on mount

  // Timer effect
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          // Auto-submit when time runs out
          if (!hasAnswered && question) {
            // Auto-select first option without calling handleAnswer directly
            const option = question.options[0];
            setSelected(option);
            setHasAnswered(true);

            const correct = option === question.answer;
            const questionDifficulty = question.difficulty || "medium";

            setAnsweredQuestions((prevQuestions) => [
              ...prevQuestions,
              {
                question: question.question,
                userAnswer: option,
                correctAnswer: question.answer,
                explanation: question.explanation,
                isCorrect: correct,
                category:
                  question.category ||
                  (question.type === "ai-generated"
                    ? "AI Generated"
                    : "Pre-generated"),
                subcategory: question.subcategory,
                difficulty: questionDifficulty,
                points: question.points || 100,
                timeTaken: 120 - prev,
              },
            ]);

            setDifficultyCounts((prevCounts) => ({
              ...prevCounts,
              [questionDifficulty]:
                prevCounts[questionDifficulty as keyof typeof prevCounts] + 1,
            }));

            setIsCorrect(correct);
            if (correct) {
              setScore((prevScore) => prevScore + (question.points || 100));
              setFeedback(`Correct! 🎉 +${question.points || 100} points`);
            } else {
              setFeedback(
                `Incorrect. The correct answer is: ${question.answer}`
              );
            }
            setShowNotification(true);

            setTimeout(() => {
              setShowNotification(false);
            }, 3000);
          }
          // Show results after a short delay to allow the last answer to be processed
          setTimeout(() => {
            setShowResults(true);
          }, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive, timeLeft, hasAnswered, question]);

  // Start timer only once at the beginning - no resets
  useEffect(() => {
    if (timeLeft === 120) {
      // Only start if not already started
      setTimerActive(true);
    }
  }, [timeLeft]); // Empty dependency array - only runs once

  // Save quiz result when results are shown
  useEffect(() => {
    if (showResults && answeredQuestions.length > 0) {
      const correctAnswers = answeredQuestions.filter(
        (q) => q.isCorrect
      ).length;
      const totalTimeTaken = answeredQuestions.reduce(
        (sum, q) => sum + q.timeTaken,
        0
      );

      // Save to both Convex and localStorage for now
      saveQuizResult({
        date: new Date().toISOString(),
        score,
        totalQuestions: answeredQuestions.length,
        correctAnswers,
        accuracy: Math.round((correctAnswers / answeredQuestions.length) * 100),
        timeTaken: totalTimeTaken,
        questions: answeredQuestions,
      });
      
      // Also save to localStorage for backward compatibility
      ProgressService.saveQuizResult({
        date: new Date().toISOString(),
        score,
        totalQuestions: answeredQuestions.length,
        correctAnswers,
        accuracy: Math.round((correctAnswers / answeredQuestions.length) * 100),
        timeTaken: totalTimeTaken,
        questions: answeredQuestions,
      });
    }
  }, [showResults, answeredQuestions, score]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswer = useCallback(
    (option: string) => {
      if (!question || hasAnswered || isLoading) return;

      setSelected(option);
      setHasAnswered(true);
      // Don't stop the timer - let it continue until time runs out

      const correct = option === question.answer;

      // Store answered question for results
      const questionDifficulty = question.difficulty || "medium";
      setAnsweredQuestions((prev) => [
        ...prev,
        {
          question: question.question,
          userAnswer: option,
          correctAnswer: question.answer,
          explanation: question.explanation,
          isCorrect: correct,
          category:
            question.category ||
            (question.type === "ai-generated"
              ? "AI Generated"
              : "Pre-generated"),
          subcategory: question.subcategory,
          difficulty: questionDifficulty,
          points: question.points || 100,
          timeTaken: 120 - timeLeft,
        },
      ]);

      // Update difficulty counts
      setDifficultyCounts((prev) => ({
        ...prev,
        [questionDifficulty]: prev[questionDifficulty as keyof typeof prev] + 1,
      }));
      setIsCorrect(correct);

      if (correct) {
        setScore((prev) => prev + (question.points || 100));
        setFeedback(`Correct! 🎉 +${question.points || 100} points`);
        setShowNotification(true);
      } else {
        setFeedback(`Incorrect. The correct answer is: ${question.answer}`);
        setShowNotification(true);
      }

      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    },
    [question, hasAnswered, isLoading, timeLeft]
  );

  const handleNextQuestion = useCallback(async () => {
    if (isLoading) return;

    console.log('Current question number before increment:', questionNumber);
    const newQuestionNumber = questionNumber + 1;
    console.log('New question number:', newQuestionNumber);
    setQuestionNumber(newQuestionNumber);
    await fetchQuestion();
  }, [isLoading, fetchQuestion, questionNumber]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!question) return;

      const key = event.key;

      // Handle number keys 1-4 for answer selection (only if not answered)
      if (key >= "1" && key <= "4" && !hasAnswered && !isLoading) {
        const optionIndex = parseInt(key) - 1;
        if (optionIndex < question.options.length) {
          handleAnswer(question.options[optionIndex]);
        }
      }

      // Handle Enter key for next question (only if already answered and not loading)
      if (key === "Enter" && hasAnswered && !isLoading) {
        event.preventDefault();
        console.log('Enter key pressed for next question!');
        console.log('hasAnswered:', hasAnswered);
        console.log('isLoading:', isLoading);
        handleNextQuestion();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [question, hasAnswered, isLoading, handleAnswer, handleNextQuestion]);

  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-12 w-full max-w-2xl mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Loading Quiz...
            </h2>
            <p className="text-gray-400">Preparing your AI-powered questions</p>
          </div>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('Render - questionNumber:', questionNumber, 'hasAnswered:', hasAnswered, 'isLoading:', isLoading);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/"
            className="inline-block hover:scale-105 transition-transform duration-200"
          >
            <h1 className="text-6xl font-bold text-white mb-3 cursor-pointer">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                InvestIQ
              </span>
            </h1>
            <p className="text-2xl text-gray-400 cursor-pointer">
              AI-Powered Investment Banking Quiz
            </p>
          </Link>
        </div>

        {/* Progress Bar and Timer */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-6">
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full px-6 py-2">
                <span className="text-lg font-semibold text-white">
                  Question {questionNumber}
                </span>
              </div>
              <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-full px-6 py-2">
                <span className="text-lg font-semibold text-white">
                  Score: {score} pts
                </span>
              </div>
              {/* Difficulty Distribution Indicator */}
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full px-4 py-2">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-green-300">
                    E:{difficultyCounts.easy}
                  </span>
                  <span className="text-yellow-300">
                    M:{difficultyCounts.medium}
                  </span>
                  <span className="text-red-300">
                    H:{difficultyCounts.hard}
                  </span>
                </div>
              </div>
            </div>
            <div
              className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${
                timeLeft <= 30
                  ? "bg-red-600/20 border-red-500/50 text-red-300"
                  : timeLeft <= 60
                    ? "bg-yellow-600/20 border-yellow-500/50 text-yellow-300"
                    : "bg-green-600/20 border-green-500/50 text-green-300"
              }`}
            >
              <span className="text-lg">⏱️</span>
              <span className="text-lg font-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((questionNumber - 1) * 10, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-8 mb-8 hover:border-blue-500/40 transition-all duration-300">
          <div className="mb-6">
            <div className="mb-4">
              <h2 className="text-3xl font-bold text-white leading-relaxed">
                {question.question}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {question.category && (
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-gray-600/20 to-gray-700/20 border border-gray-500/30 rounded-full px-4 py-1">
                  <span className="text-gray-300 text-sm font-medium">
                    {question.category}
                  </span>
                </div>
              )}
              {question.subcategory && (
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full px-4 py-1">
                  <span className="text-blue-300 text-sm font-medium">
                    {question.subcategory}
                  </span>
                </div>
              )}
              {question.difficulty && (
                <div
                  className={`inline-flex items-center space-x-2 rounded-full px-4 py-1 ${
                    question.difficulty === "easy"
                      ? "bg-gradient-to-r from-green-600/20 to-green-700/20 border border-green-500/30"
                      : question.difficulty === "medium"
                        ? "bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 border border-yellow-500/30"
                        : "bg-gradient-to-r from-red-600/20 to-red-700/20 border border-red-500/30"
                  }`}
                >
                  <span
                    className={`text-sm font-medium ${
                      question.difficulty === "easy"
                        ? "text-green-300"
                        : question.difficulty === "medium"
                          ? "text-yellow-300"
                          : "text-red-300"
                    }`}
                  >
                    {question.difficulty.charAt(0).toUpperCase() +
                      question.difficulty.slice(1)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={hasAnswered || isLoading}
                className={`w-full text-left p-6 rounded-xl border transition-all duration-200 ${
                  selected === option
                    ? isCorrect
                      ? "bg-gradient-to-r from-green-600/20 to-green-700/20 border-green-500/50 text-green-300"
                      : "bg-gradient-to-r from-red-600/20 to-red-700/20 border-red-500/50 text-red-300"
                    : "bg-gradient-to-r from-gray-700/20 to-gray-800/20 border-gray-600/30 text-gray-300 hover:border-blue-500/50 hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-purple-600/10"
                } ${hasAnswered || isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-[1.02]"}`}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selected === option
                        ? isCorrect
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                        : "bg-gray-600 text-gray-300"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-2xl leading-relaxed">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`mt-6 p-6 rounded-xl border ${
                isCorrect
                  ? "bg-gradient-to-r from-green-600/20 to-green-700/20 border-green-500/50"
                  : "bg-gradient-to-r from-red-600/20 to-red-700/20 border-red-500/50"
              }`}
            >
              <p
                className={`font-semibold text-2xl ${isCorrect ? "text-green-300" : "text-red-300"}`}
              >
                {feedback}
              </p>
              {!isCorrect && (
                <div className="mt-3 p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-300 text-xl">
                    <strong className="text-white">Explanation:</strong>{" "}
                    {question.explanation}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Next Question Button */}
          {hasAnswered && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => {
                  console.log('Next Question button clicked!');
                  console.log('hasAnswered:', hasAnswered);
                  console.log('isLoading:', isLoading);
                  handleNextQuestion();
                }}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Next Question</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Keyboard Instructions */}
        <div className="bg-gradient-to-br from-gray-700/20 to-gray-800/20 border border-gray-600/30 rounded-2xl p-8">
          <h3 className="font-semibold text-white mb-4 text-xl">
            Keyboard Shortcuts:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg text-gray-300">
            <div className="flex items-center space-x-3">
              <span>• Press</span>
              <kbd className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono">
                1-4
              </kbd>
              <span>to select answer</span>
            </div>
            <div className="flex items-center space-x-3">
              <span>• Press</span>
              <kbd className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono">
                Enter
              </kbd>
              <span>for next question</span>
            </div>
          </div>
        </div>

        {/* Success Notification */}
        {showNotification && isCorrect && (
          <div className="fixed top-4 right-4 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl shadow-2xl animate-bounce border border-green-500/50">
            🎉 Correct!
          </div>
        )}

        {/* Time's Up Notification */}
        {timeLeft === 0 && !hasAnswered && (
          <div className="fixed top-4 right-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl shadow-2xl animate-bounce border border-red-500/50">
            ⏰ Time's up! Answer automatically selected.
          </div>
        )}

        {/* Quiz Results Popup */}
        {showResults && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
              {/* Close Button */}
              <button
                onClick={() => setShowResults(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100 z-10"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">🏆</div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-2">
                    Quiz Complete!
                  </h1>
                  <div className="text-8xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent mb-2">
                    {(() => {
                      const accuracy = Math.round(
                        (answeredQuestions.filter((q) => q.isCorrect).length /
                          answeredQuestions.length) *
                          100
                      );
                      const totalQuestions = answeredQuestions.length;
                      
                      // Grade based on accuracy and number of questions answered
                      if (totalQuestions >= 5) {
                        if (accuracy >= 90) return "A";
                        if (accuracy >= 80) return "B";
                        if (accuracy >= 70) return "C";
                        if (accuracy >= 60) return "D";
                        return "F";
                      } else if (totalQuestions >= 3) {
                        if (accuracy >= 85) return "A";
                        if (accuracy >= 75) return "B";
                        if (accuracy >= 65) return "C";
                        if (accuracy >= 55) return "D";
                        return "F";
                      } else {
                        if (accuracy >= 80) return "A";
                        if (accuracy >= 70) return "B";
                        if (accuracy >= 60) return "C";
                        if (accuracy >= 50) return "D";
                        return "F";
                      }
                    })()}
                  </div>
                  <p className="text-gray-600 text-lg">Keep practicing!</p>
                </div>

                {/* Performance Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {score}
                    </div>
                    <div className="text-gray-600">Total Points</div>
                  </div>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {Math.round(
                        (answeredQuestions.filter((q) => q.isCorrect).length /
                          answeredQuestions.length) *
                          100
                      )}
                      %
                    </div>
                    <div className="text-gray-600">Accuracy</div>
                  </div>
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {answeredQuestions.filter((q) => q.isCorrect).length}
                    </div>
                    <div className="text-gray-600">Correct</div>
                  </div>
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {Math.max(
                        ...answeredQuestions.map((_q, i) => {
                          let streak = 0;
                          for (let j = i; j >= 0; j--) {
                            if (answeredQuestions[j].isCorrect) streak++;
                            else break;
                          }
                          return streak;
                        })
                      )}
                    </div>
                    <div className="text-gray-600">Best Streak</div>
                  </div>
                </div>

                {/* Performance by Category */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    📊 Performance by Category
                  </h3>
                  <div className="space-y-3">
                    {Array.from(
                      new Set(answeredQuestions.map((q) => q.category))
                    ).map((category) => {
                      const categoryQuestions = answeredQuestions.filter(
                        (q) => q.category === category
                      );
                      const correct = categoryQuestions.filter(
                        (q) => q.isCorrect
                      ).length;
                      const percentage = Math.round(
                        (correct / categoryQuestions.length) * 100
                      );
                      return (
                        <div
                          key={category}
                          className="flex justify-between items-center p-4 bg-gray-50 border-2 border-gray-200 rounded-xl"
                        >
                          <div>
                            <span className="font-medium text-gray-800">
                              {category?.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </span>
                            <span className="text-gray-600 ml-2">
                              ({correct}/{categoryQuestions.length})
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">
                              {percentage}%
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-sm ${
                                percentage >= 80
                                  ? "bg-green-100 text-green-800 border border-green-300"
                                  : percentage >= 60
                                    ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                                    : "bg-orange-100 text-orange-800 border border-orange-300"
                              }`}
                            >
                              {percentage >= 80
                                ? "Strong"
                                : percentage >= 60
                                  ? "Good"
                                  : "Needs work"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setShowQuestionReview(true)}
                    className="flex-1 py-3 text-lg bg-gray-100 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-200 hover:border-gray-400 transition-all duration-200"
                  >
                    👁️ Review Questions
                  </button>
                  <button
                    onClick={() => {
                      setShowResults(false);
                      setShowQuestionReview(false);
                      setQuestionNumber(1);
                      setScore(0);
                      setAnsweredQuestions([]);
                      setDifficultyCounts({ easy: 0, medium: 0, hard: 0 });
                      setTimeLeft(120);
                      setTimerActive(true);
                      setHasAnswered(false);
                      setSelected(null);
                      setFeedback("");
                      setShowNotification(false);
                      fetchQuestion();
                    }}
                    className="flex-1 py-3 text-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    🔄 Play Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Question Review Popup */}
        {showQuestionReview && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Question Review
                  </h2>
                  <button
                    onClick={() => setShowQuestionReview(false)}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    ← Back to Results
                  </button>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                  {answeredQuestions.map((q, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 mb-2 line-clamp-2">
                            {q.question}
                          </h4>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 border border-blue-300 rounded">
                              {q.category?.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </span>
                            {q.subcategory && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 border border-green-300 rounded">
                                {q.subcategory.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              </span>
                            )}
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 border border-gray-300 rounded">
                              {q.difficulty} ({q.points} pts)
                            </span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 border border-purple-300 rounded">
                              {q.timeTaken}s
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              q.isCorrect ? "bg-green-500" : "bg-red-500"
                            }`}
                          >
                            <span className="text-white font-bold">
                              {q.isCorrect ? "✓" : "✗"}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              // Show detailed explanation in a modal or expand this section
                              alert(
                                `Question: ${q.question}\n\nYour Answer: ${q.userAnswer}\nCorrect Answer: ${q.correctAnswer}\n\nExplanation: ${q.explanation}`
                              );
                            }}
                            className="text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            👁️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
