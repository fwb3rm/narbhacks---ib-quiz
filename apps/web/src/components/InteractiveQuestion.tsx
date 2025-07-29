"use client";

import { CheckCircle, Eye, EyeOff, XCircle } from "lucide-react";
import { useState } from "react";

interface PracticeQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface InteractiveQuestionProps {
  question: PracticeQuestion;
  questionNumber: number;
}

export default function InteractiveQuestion({
  question,
  questionNumber,
}: InteractiveQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleAnswerSelect = (option: string) => {
    if (hasAnswered) return; // Prevent changing answer after submission
    setSelectedAnswer(option);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    setHasAnswered(true);
  };

  const isCorrect = selectedAnswer === question.answer;

  return (
    <div className="bg-gradient-to-r from-gray-700/20 to-gray-800/20 border border-gray-600/30 rounded-xl p-6 hover:border-gray-500/50 transition-all duration-300">
      <h4 className="text-lg font-semibold text-white mb-4">
        Question {questionNumber}
      </h4>

      <p className="text-gray-300 mb-4 leading-relaxed">{question.question}</p>

      {/* Answer Options */}
      <div className="space-y-2 mb-4">
        {question.options.map((option, optIndex) => {
          const optionLetter = String.fromCharCode(65 + optIndex);
          const isSelected = selectedAnswer === option;
          const isCorrectAnswer = option === question.answer;
          const showResult = hasAnswered && (isSelected || isCorrectAnswer);

          return (
            <button
              key={optIndex}
              onClick={() => handleAnswerSelect(option)}
              disabled={hasAnswered}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                !hasAnswered
                  ? isSelected
                    ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                    : "bg-gray-700/20 border-gray-600/30 text-gray-300 hover:bg-gray-600/20 hover:border-gray-500/50"
                  : showResult
                    ? isCorrectAnswer
                      ? "bg-green-600/20 border-green-500/50 text-green-300"
                      : isSelected
                        ? "bg-red-600/20 border-red-500/50 text-red-300"
                        : "bg-gray-700/20 border-gray-600/30 text-gray-300"
                    : "bg-gray-700/20 border-gray-600/30 text-gray-300"
              } ${hasAnswered ? "cursor-default" : "cursor-pointer"}`}
            >
              <div className="flex items-center justify-between">
                <span>
                  {optionLetter}. {option}
                </span>
                {showResult && (
                  <div className="flex items-center">
                    {isCorrectAnswer ? (
                      <CheckCircle className="w-5 h-5 text-green-400 ml-2" />
                    ) : isSelected ? (
                      <XCircle className="w-5 h-5 text-red-400 ml-2" />
                    ) : null}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Submit Button */}
      {!hasAnswered && selectedAnswer && (
        <button
          onClick={handleSubmitAnswer}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl mb-4"
        >
          Submit Answer
        </button>
      )}

      {/* Answer Result */}
      {hasAnswered && (
        <div
          className={`mb-4 p-4 rounded-lg border ${
            isCorrect
              ? "bg-green-600/10 border-green-500/30 text-green-300"
              : "bg-red-600/10 border-red-500/30 text-red-300"
          }`}
        >
          <div className="flex items-center">
            {isCorrect ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <XCircle className="w-5 h-5 mr-2" />
            )}
            <span className="font-semibold">
              {isCorrect ? "Correct!" : "Incorrect"}
            </span>
          </div>
          {!isCorrect && (
            <p className="mt-2 text-sm">
              Correct answer:{" "}
              <span className="font-semibold">{question.answer}</span>
            </p>
          )}
        </div>
      )}

      {/* Explanation Toggle */}
      {hasAnswered && (
        <div className="border-t border-gray-600/30 pt-4">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            {showExplanation ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
            <span>{showExplanation ? "Hide" : "Show"} Explanation</span>
          </button>

          {showExplanation && (
            <div className="mt-4 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-300 text-sm leading-relaxed">
                <strong>Explanation:</strong> {question.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
