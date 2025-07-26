'use client';

import { useState, useEffect } from 'react';
import { BarChart3, HelpCircle, Zap, Bot, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type QuestionType = {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

export function Quiz() {
  const [question, setQuestion] = useState<QuestionType | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);

  useEffect(() => {
    fetchQuestion();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchQuestion = async () => {
    const res = await fetch('http://localhost:3001/generate-question');
    const data = await res.json();
    setQuestion(data);
  };

  const handleAnswer = (option: string) => {
    if (!question || selected) return;

    setSelected(option);
    const correct = option === question.answer;
    setIsCorrect(correct);
    setScore((prev) => (correct ? prev + 1 : prev));
    setFeedback(correct ? 'Correct!' : 'Incorrect');

    setTimeout(() => {
      setSelected(null);
      setFeedback(null);
      setIsCorrect(null);
      setQuestionNumber(prev => prev + 1);
      fetchQuestion();
    }, 3000);
  };

  const handleNextQuestion = () => {
    setSelected(null);
    setFeedback(null);
    setIsCorrect(null);
    setQuestionNumber(prev => prev + 1);
    fetchQuestion();
  };

  if (timeLeft <= 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="header-gradient text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-8 h-8 text-blue-200" />
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">InvestIQ</h1>
                  <p className="text-sm text-blue-200 font-medium">Elite IB Prep</p>
                </div>
              </div>
            </div>
          </div>
          <div className="h-0.5 bg-green-400"></div>
        </header>

        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-xl card-shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">⏱ Time's Up</h1>
            <p className="text-xl text-gray-600 mb-8">You scored {score} point{score !== 1 ? 's' : ''}.</p>
            <Link href="/">
              <button className="btn-primary">
                Back to Home
              </button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!question) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading question...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="header-gradient text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-blue-200" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">InvestIQ</h1>
                <p className="text-sm text-blue-200 font-medium">Elite IB Prep</p>
              </div>
            </div>
            <nav className="flex items-center space-x-8">
              <Link href="/progress" className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors">
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">Progress</span>
              </Link>
              <Link href="/guide" className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors">
                <HelpCircle className="w-5 h-5" />
                <span className="font-medium">Guide</span>
              </Link>
            </nav>
          </div>
        </div>
        <div className="h-0.5 bg-green-400"></div>
      </header>

      {/* Status Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="status-card rounded-lg p-6">
          <div className="flex justify-around items-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{score}</div>
              <div className="text-sm text-gray-600 font-medium">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-600 font-medium">Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{score * 100}</div>
              <div className="text-sm text-gray-600 font-medium">Points</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-xl card-shadow-lg p-8">
          {/* Question Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center space-x-4">
              <span className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center space-x-1.5">
                <Zap className="w-4 h-4" />
                <span>Hard</span>
              </span>
              <span className="text-gray-700 font-medium">150 points</span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center space-x-1.5">
                <Bot className="w-4 h-4" />
                <span>AI Generated</span>
              </span>
            </div>
            <div className="text-gray-600 font-medium">Question {questionNumber}</div>
          </div>

          {/* Question */}
          <h2 className="text-xl font-semibold text-gray-900 mb-8 leading-relaxed">
            {question.question}
          </h2>

          {/* Options */}
          <div className="space-y-4 mb-8">
            {question.options.map((opt, idx) => {
              const isSelected = selected === opt;
              const correctAnswer = question.answer;
              let style = 'bg-gray-50 hover:bg-gray-100 border-gray-200';
              let icon = null;

              if (selected) {
                if (opt === correctAnswer) {
                  style = 'bg-green-50 border-green-500 text-green-800';
                  icon = <CheckCircle className="w-5 h-5 text-green-600" />;
                } else if (isSelected) {
                  style = 'bg-red-50 border-red-500 text-red-800';
                  icon = <XCircle className="w-5 h-5 text-red-600" />;
                }
              }

              return (
                <button
                  key={idx}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${style} flex items-center justify-between`}
                  onClick={() => handleAnswer(opt)}
                  disabled={!!selected}
                >
                  <span className="font-medium">{idx + 1}. {opt}</span>
                  {icon}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {feedback && (
            <div className="text-center mb-6">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {feedback}
              </span>
            </div>
          )}

          {/* Explanation */}
          {selected && (
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <p className="text-gray-700 leading-relaxed">
                <strong>Explanation:</strong> {question.explanation}
              </p>
            </div>
          )}

          {/* Next Button */}
          {selected && (
            <div className="text-center">
              <button
                onClick={handleNextQuestion}
                className="btn-primary flex items-center space-x-2 mx-auto"
              >
                <span>Next Question</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-sm text-gray-500 mt-3">Press Enter to continue</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}