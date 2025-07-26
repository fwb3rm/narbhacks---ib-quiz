'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="text-center bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-6">Welcome to InvestIQ!</h1>
        <p className="text-lg text-gray-700 mb-8">
          Test your knowledge of investment banking concepts with our interactive quiz. 
          Challenge yourself with multiple-choice questions and get instant feedback.
        </p>
        <Link href="/quiz">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition duration-200 ease-in-out transform hover:-translate-y-1">
            Start Quiz
          </button>
        </Link>
      </div>
    </main>
  );
}