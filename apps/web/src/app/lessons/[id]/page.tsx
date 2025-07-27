"use client";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Clock,
  Play,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { type Lesson, LessonService } from "@/lib/lessons";

export default function LessonPage() {
  const params = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentSection, setCurrentSection] = useState<
    "content" | "examples" | "practice"
  >("content");
  const [_expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({});
  const [practiceAnswers, setPracticeAnswers] = useState<{
    [key: number]: string;
  }>({});
  const [showPracticeResults, setShowPracticeResults] = useState(false);

  useEffect(() => {
    if (params.id) {
      const lessonData = LessonService.getLessonById(params.id as string);
      setLesson(lessonData);
    }
  }, [params.id]);

  const _toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handlePracticeAnswer = (questionIndex: number, answer: string) => {
    setPracticeAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const checkPracticeResults = () => {
    setShowPracticeResults(true);
  };

  const getPracticeScore = () => {
    if (!lesson) return 0;
    let correct = 0;
    lesson.practiceQuestions.forEach((q, index) => {
      if (practiceAnswers[index] === q.answer) {
        correct++;
      }
    });
    return Math.round((correct / lesson.practiceQuestions.length) * 100);
  };

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading lesson...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link
              href="/lessons"
              className="flex items-center space-x-4 hover:scale-105 transition-transform duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl">
                    <BookOpen className="w-7 h-7 text-white" />
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
                href="/lessons"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Lessons</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lesson Header */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {lesson.title}
              </h1>
              <p className="text-xl text-gray-300">{lesson.subcategory}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium border ${
                  lesson.difficulty === "beginner"
                    ? "text-green-400 bg-green-500/20 border-green-500/30"
                    : lesson.difficulty === "intermediate"
                      ? "text-yellow-400 bg-yellow-500/20 border-yellow-500/30"
                      : "text-red-400 bg-red-500/20 border-red-500/30"
                }`}
              >
                {lesson.difficulty.toUpperCase()}
              </span>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">
                  {lesson.estimatedTime} min
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentSection("content")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentSection === "content"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600"
              }`}
            >
              Concepts
            </button>
            <button
              onClick={() => setCurrentSection("examples")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentSection === "examples"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600"
              }`}
            >
              Common Mistakes
            </button>
            <button
              onClick={() => setCurrentSection("practice")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentSection === "practice"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600"
              }`}
            >
              Practice ({lesson.practiceQuestions.length})
            </button>
          </div>
        </div>

        {/* Content Section */}
        {currentSection === "content" && (
          <div className="space-y-8">
            {/* Summary */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                Lesson Summary
              </h2>
              <div className="text-gray-300 leading-relaxed">
                {lesson.summary}
              </div>
            </div>

            {/* Key Concepts */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                Key Concepts
              </h2>
              <div className="space-y-6">
                {lesson.keyConcepts.map((concept, index) => (
                  <div key={index} className="border-l-4 border-green-400 pl-4">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {concept.title}
                    </h3>
                    <p className="text-gray-300 mb-3">{concept.explanation}</p>
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <p className="text-sm text-gray-400 mb-1">Example:</p>
                      <p className="text-gray-300">{concept.example}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Common Mistakes Section */}
        {currentSection === "examples" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                  <Target className="w-4 h-4 text-white" />
                </div>
                Common Mistakes to Avoid
              </h2>
              <div className="space-y-4">
                {lesson.commonMistakes.map((mistake, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300">{mistake}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Practice Section */}
        {currentSection === "practice" && (
          <div className="space-y-6">
            {lesson.practiceQuestions.map((question, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4">
                  Practice Question {index + 1}
                </h3>
                <p className="text-gray-300 mb-6">{question.question}</p>

                <div className="space-y-3 mb-6">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        checked={practiceAnswers[index] === option}
                        onChange={(e) =>
                          handlePracticeAnswer(index, e.target.value)
                        }
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>

                {showPracticeResults && (
                  <div
                    className={`p-4 rounded-lg ${
                      practiceAnswers[index] === question.answer
                        ? "bg-green-500/20 border border-green-500/30"
                        : "bg-red-500/20 border border-red-500/30"
                    }`}
                  >
                    <h4
                      className={`font-semibold mb-2 ${
                        practiceAnswers[index] === question.answer
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {practiceAnswers[index] === question.answer
                        ? "✓ Correct!"
                        : "✗ Incorrect"}
                    </h4>
                    <p className="text-gray-300 text-sm">
                      {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {lesson.practiceQuestions.length > 0 && (
              <div className="flex justify-between items-center">
                <button
                  onClick={checkPracticeResults}
                  disabled={
                    Object.keys(practiceAnswers).length <
                    lesson.practiceQuestions.length
                  }
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Check Answers
                </button>

                {showPracticeResults && (
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      {getPracticeScore()}%
                    </p>
                    <p className="text-gray-400 text-sm">Practice Score</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12">
          <Link
            href="/lessons"
            className="flex items-center space-x-2 px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Lessons</span>
          </Link>

          <Link
            href="/quiz"
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
          >
            <Play className="w-5 h-5" />
            <span>Take Quiz</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
