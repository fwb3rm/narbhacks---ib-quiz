'use client';

import { useState, useEffect, useCallback } from 'react';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export function Quiz() {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const fetchQuestion = useCallback(async (showLoadingScreen = true) => {
    if (showLoadingScreen) setLoading(true);
    setError(null);
    setShowFeedback(false);
    setSelectedAnswer(null);
    try {
      const response = await fetch('http://localhost:3001/generate-question');
      if (!response.ok) throw new Error('Failed to fetch question');
      const data = await response.json();
      setQuestion(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestion(true);
  }, [fetchQuestion]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsFinished(true);
    }
  }, [timeLeft]);

  const handleAnswer = (selectedOption: string) => {
    if (!question || showFeedback) return;

    setSelectedAnswer(selectedOption);
    const correct = selectedOption === question.answer;
    setIsCorrect(correct);
    setScore(prev => correct ? prev + 1 : prev);
    setShowFeedback(true);
  };

  const handleNextQuestion = useCallback(() => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    fetchQuestion(false);
  }, [fetchQuestion]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (loading || isFinished) return;

      if (showFeedback) {
        if (event.key === 'Enter') {
          handleNextQuestion();
        }
      } else {
        const optionIndex = parseInt(event.key, 10) - 1;
        if (question && optionIndex >= 0 && optionIndex < question.options.length) {
          handleAnswer(question.options[optionIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [loading, isFinished, showFeedback, question, handleAnswer, handleNextQuestion]);

  if (isFinished) {
    return (
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Time's up!</h1>
        <p className="text-2xl">Your final score is: {score}</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center text-lg font-medium text-gray-700">Loading question...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 font-medium">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-200">
          <div className="text-xl font-medium text-gray-700">Time Left: <span className="font-bold text-blue-600">{timeLeft}s</span></div>
          <div className="text-xl font-medium text-gray-700 ml-auto">Score: <span className="font-bold text-green-600">{score}</span></div>
        </div>
        {question && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{question.question}</h2>
            <div className="grid grid-cols-1 gap-6">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={showFeedback || loading} // Disable buttons after an answer is selected or while loading
                  className={`w-full py-4 px-6 text-lg font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1
                    ${showFeedback && selectedAnswer === option
                      ? (isCorrect ? 'bg-green-500 text-white shadow-lg' : 'bg-red-500 text-white shadow-lg')
                      : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75'
                    }
                    ${showFeedback && option === question.answer && selectedAnswer !== option
                      ? 'bg-green-500 text-white shadow-lg' // Highlight correct answer if a wrong one was selected
                      : ''
                    }
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {index + 1}. {option}
                </button>
              ))}
            </div>

            {showFeedback && (
              <div className="mt-8 p-4 border-t-2 border-gray-200">
                <h3 className="text-xl font-bold mb-2">
                  {isCorrect ? 'Correct!' : 'Incorrect.'}
                </h3>
                <p className="text-lg mb-2">
                  The correct answer was: <span className="font-semibold">{question.answer}</span>
                </p>
                <p className="text-md text-gray-700 mb-4">
                  <span className="font-semibold">Explanation:</span> {question.explanation}
                </p>
                <button
                  onClick={handleNextQuestion}
                  className="w-full py-3 px-4 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 transition duration-200 ease-in-out transform hover:-translate-y-1"
                >
                  Next Question (Press Enter)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}