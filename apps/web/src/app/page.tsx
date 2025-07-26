'use client';

import Link from 'next/link';
import { BarChart3, HelpCircle } from 'lucide-react';

export default function Home() {
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
            Master Investment Banking
          </h2>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            Test your knowledge with our elite preparation platform. 
            Challenge yourself with AI-generated questions and track your progress.
          </p>
          <Link href="/quiz">
            <button className="btn-primary text-lg px-8 py-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
              Start Elite Prep
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}