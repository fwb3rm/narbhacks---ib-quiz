"use client";

import { Suspense } from "react";
import Quiz from "@/components/Quiz";

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-12 w-full max-w-2xl mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Loading Quiz...
            </h2>
            <p className="text-gray-400">Preparing your questions</p>
          </div>
        </div>
      </div>
    }>
      <Quiz />
    </Suspense>
  );
}
