'use client';

import { Quiz } from '@/components/Quiz';

export default function QuizPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-3xl">
        <Quiz />
      </div>
    </main>
  );
}
