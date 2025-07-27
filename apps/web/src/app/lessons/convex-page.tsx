"use client";

import {
  ArrowRight,
  Brain,
  CheckCircle,
  Clock,
  Loader2,
  Play,
  Star,
  Target,
  TrendingUp,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

// Simplified lesson topics
const LESSON_TOPICS = [
  "DCF analysis",
  "Comparable company analysis",
  "3-statement linkages",
  "LBO modeling",
  "M&A analysis",
  "WACC calculation",
  "Enterprise value vs equity value",
  "Working capital",
  "Depreciation & amortization",
  "Terminal value",
];

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

export default function LessonsPage() {
  const generateLesson = useAction(api.lessons.generateLesson);
  const allLessons = useQuery(api.lessons.getAllLessons);

  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [generatedLesson, setGeneratedLesson] = useState<GeneratedLesson | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedLessons, setSavedLessons] = useState<any[]>([]);

  // Load saved lessons from localStorage for now
  useEffect(() => {
    const saved = localStorage.getItem("savedLessons");
    if (saved) {
      setSavedLessons(JSON.parse(saved));
    }
  }, []);

  const handleGenerateLesson = async (topic: string) => {
    setIsGenerating(true);
    setSelectedTopic(topic);
    
    try {
      const lesson = await generateLesson({
        subcategory: topic,
        difficulty: "intermediate",
      });
      
      setGeneratedLesson(lesson);
      
      // Save to localStorage for now
      const newSavedLesson = {
        id: Date.now(),
        title: lesson.title,
        subcategory: topic,
        difficulty: "intermediate",
        content: lesson,
        createdAt: Date.now(),
      };
      
      const updatedSavedLessons = [...savedLessons, newSavedLesson];
      setSavedLessons(updatedSavedLessons);
      localStorage.setItem("savedLessons", JSON.stringify(updatedSavedLessons));
      
    } catch (error) {
      console.error("Failed to generate lesson:", error);
      alert("Failed to generate lesson. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center py-8">
          <Link
            href="/"
            className="flex items-center space-x-3 hover:scale-105 transition-transform duration-200"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-2">
              <TrendingUp className="w-7 h-7 text-white" />
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
          <div className="flex items-center space-x-4">
            <Link
              href="/quiz"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-200"
            >
              Take Quiz
            </Link>
            <Link
              href="/progress"
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-1 transition-all duration-200"
            >
              View Progress
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Topic Selection */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Brain className="w-6 h-6 mr-3 text-blue-400" />
                Lesson Topics
              </h2>
              
              <div className="space-y-3">
                {LESSON_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => handleGenerateLesson(topic)}
                    disabled={isGenerating}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                      selectedTopic === topic
                        ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/50 text-blue-300"
                        : "bg-gradient-to-r from-gray-700/20 to-gray-800/20 border-gray-600/30 text-gray-300 hover:border-blue-500/50 hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-purple-600/10"
                    } ${isGenerating ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-[1.02]"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{topic}</span>
                      {isGenerating && selectedTopic === topic && (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Generated Lesson */}
          <div className="lg:col-span-2">
            {generatedLesson ? (
              <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-8">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {generatedLesson.title}
                  </h1>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {generatedLesson.summary}
                  </p>
                </div>

                {/* Key Concepts */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-400" />
                    Key Concepts
                  </h3>
                  <div className="space-y-4">
                    {generatedLesson.keyConcepts.map((concept, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-gray-700/20 to-gray-800/20 border border-gray-600/30 rounded-xl p-6"
                      >
                        <h4 className="text-lg font-semibold text-white mb-3">
                          {concept.title}
                        </h4>
                        <p className="text-gray-300 mb-3 leading-relaxed">
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
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-red-400" />
                    Common Mistakes
                  </h3>
                  <div className="space-y-3">
                    {generatedLesson.commonMistakes.map((mistake, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-red-600/10 to-red-700/10 border border-red-500/30 rounded-xl p-4"
                      >
                        <p className="text-red-300">• {mistake}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Practice Questions */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Play className="w-5 h-5 mr-2 text-green-400" />
                    Practice Questions
                  </h3>
                  <div className="space-y-4">
                    {generatedLesson.practiceQuestions.map((q, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-gray-700/20 to-gray-800/20 border border-gray-600/30 rounded-xl p-6"
                      >
                        <h4 className="text-lg font-semibold text-white mb-4">
                          Question {index + 1}
                        </h4>
                        <p className="text-gray-300 mb-4 leading-relaxed">
                          {q.question}
                        </p>
                        <div className="space-y-2 mb-4">
                          {q.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-3 rounded-lg border ${
                                option === q.answer
                                  ? "bg-green-600/20 border-green-500/50 text-green-300"
                                  : "bg-gray-700/20 border-gray-600/30 text-gray-300"
                              }`}
                            >
                              {String.fromCharCode(65 + optIndex)}. {option}
                            </div>
                          ))}
                        </div>
                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                          <p className="text-blue-300 text-sm">
                            <strong>Explanation:</strong> {q.explanation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Select a Topic
                </h2>
                <p className="text-gray-400">
                  Choose a topic from the left panel to generate a personalized AI lesson
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Saved Lessons */}
        {savedLessons.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Star className="w-6 h-6 mr-3 text-yellow-400" />
              Saved Lessons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 transition-all duration-300"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {lesson.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {lesson.subcategory}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {new Date(lesson.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedTopic(lesson.subcategory);
                        setGeneratedLesson(lesson.content);
                      }}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 