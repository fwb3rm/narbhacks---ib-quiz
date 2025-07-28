"use client";

import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";

export default function TestPage() {
  const testOpenRouter = useAction(api.quiz.testOpenRouter);
  const generateQuestion = useAction(api.quiz.generateQuestion);
  const [testResult, setTestResult] = useState<any>(null);
  const [questionResult, setQuestionResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTestOpenRouter = async () => {
    setIsLoading(true);
    try {
      const result = await testOpenRouter({});
      setTestResult(result);
      console.log("Test result:", result);
    } catch (error) {
      console.error("Test failed:", error);
      setTestResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuestion = async () => {
    setIsLoading(true);
    try {
      const result = await generateQuestion({ difficulty: "medium" });
      setQuestionResult(result);
      console.log("Question result:", result);
    } catch (error) {
      console.error("Question generation failed:", error);
      setQuestionResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">API Test Page</h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Test OpenRouter API</h2>
          <button
            onClick={handleTestOpenRouter}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded"
          >
            {isLoading ? "Testing..." : "Test OpenRouter"}
          </button>
          {testResult && (
            <pre className="mt-4 p-4 bg-gray-800 rounded overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Test Question Generation</h2>
          <button
            onClick={handleGenerateQuestion}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded"
          >
            {isLoading ? "Generating..." : "Generate Question"}
          </button>
          {questionResult && (
            <pre className="mt-4 p-4 bg-gray-800 rounded overflow-auto">
              {JSON.stringify(questionResult, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
} 