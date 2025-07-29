"use client";

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  HelpCircle,
  Play,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GuideModal } from "@/components/GuideModal";

export default function Home() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const topics = [
    "Accounting",
    "LBOs",
    "Valuation",
    "Mergers",
    "Acquisitions",
    "Capital Markets",
    "Investment Banking.",
  ];

  useEffect(() => {
    let currentIndex = 0;

    // Start the animation after a short delay
    const startAnimation = setTimeout(() => {
      const interval = setInterval(() => {
        console.log("Animation triggered, current index:", currentIndex);
        setIsAnimating(true);

        setTimeout(() => {
          currentIndex = (currentIndex + 1) % topics.length;
          console.log("New index:", currentIndex);
          setCurrentTextIndex(currentIndex);
          setIsAnimating(false);

          // Stop animation after one complete cycle (when we reach "Investment Banking" again)
          if (currentIndex === topics.length - 1) {
            clearInterval(interval);
          }
        }, 250);
      }, 2000);

      return () => clearInterval(interval);
    }, 500);

    return () => clearTimeout(startAnimation);
  }, [topics.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-7 h-7 text-white" />
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
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/progress"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                <TrendingUp className="w-6 h-6" />
                <span className="font-semibold text-base">Progress</span>
              </Link>
              <Link
                href="/lessons"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                <BookOpen className="w-6 h-6" />
                <span className="font-semibold text-base">Lessons</span>
              </Link>
              <Link
                href="/performance-insights"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                <BarChart3 className="w-6 h-6" />
                <span className="font-semibold text-base">Insights</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                <HelpCircle className="w-6 h-6" />
                <span className="font-semibold text-base">Guide</span>
              </button>
              <Link
                href="/quiz"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold text-base hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Start Quiz
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full px-4 py-2 mb-12">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 font-medium text-sm tracking-wide">
                Powered by Advanced AI
              </span>
            </div>

            <div className="flex justify-center mb-12">
              <div className="relative">
                <div className="w-28 h-28 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-200">
                  <TrendingUp className="w-14 h-14 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-10 leading-tight tracking-tight">
              <div className="flex items-center justify-center w-full">
                <div className="flex items-center">
                  <span className="inline-block">Master</span>
                  <div className="inline-block relative h-20 w-[700px] overflow-hidden ml-4">
                    <div
                      className="absolute top-0 left-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                      style={{
                        transform: isAnimating
                          ? "translateY(100px)"
                          : "translateY(0px)",
                        opacity: isAnimating ? 0 : 1,
                        transition: "all 0.5s ease-in-out",
                        fontSize: "inherit",
                        fontWeight: "inherit",
                        lineHeight: "1.2",
                        whiteSpace: "nowrap",
                        top: "4px",
                        width: "100%",
                        textAlign: "left",
                      }}
                    >
                      {topics[currentTextIndex]}
                    </div>
                    <div
                      className="absolute top-0 left-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                      style={{
                        transform: isAnimating
                          ? "translateY(0px)"
                          : "translateY(-100px)",
                        opacity: isAnimating ? 1 : 0,
                        transition: "all 0.5s ease-in-out",
                        fontSize: "inherit",
                        fontWeight: "inherit",
                        lineHeight: "1.2",
                        whiteSpace: "nowrap",
                        top: "6px",
                        width: "100%",
                        textAlign: "left",
                      }}
                    >
                      {topics[(currentTextIndex + 1) % topics.length]}
                    </div>
                  </div>
                </div>
              </div>
            </h1>

            <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-16 leading-relaxed max-w-4xl mx-auto font-light">
              Revolutionize your investment banking interview preparation with
              our AI-powered platform. Get personalized questions, real-time
              feedback, and comprehensive progress tracking with cutting-edge
              analytics.
            </p>

            <div className="flex justify-center">
              <Link href="/quiz">
                <button
                  type="button"
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-200 flex items-center space-x-3"
                >
                  <Play className="w-5 h-5" />
                  <span>Start Quiz</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 tracking-tight">
              Why{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                InvestIQ
              </span>
              ?
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light">
              Our AI-powered platform combines cutting-edge technology with
              proven learning methodologies to deliver exceptional results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-10 hover:border-blue-500/40 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 tracking-tight">
                AI-Generated Questions
              </h3>
              <p className="text-gray-400 leading-relaxed text-base font-light">
                Dynamic questions that adapt to your skill level, ensuring
                you&apos;re always challenged and learning effectively with
                personalized difficulty progression.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/20 rounded-2xl p-10 hover:border-purple-500/40 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 tracking-tight">
                Personalized Learning
              </h3>
              <p className="text-gray-400 leading-relaxed text-base font-light">
                Track your progress across different topics and receive targeted
                recommendations with AI-generated lessons to strengthen your
                weak areas.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-600/10 to-blue-600/10 border border-green-500/20 rounded-2xl p-10 hover:border-green-500/40 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 tracking-tight">
                Real Interview Pressure
              </h3>
              <p className="text-gray-400 leading-relaxed text-base font-light">
                Train with purpose. Our 2-minute timer mimics real IB interview
                pressure, pushing you to think fast and stay sharp under fire.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-3xl p-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 tracking-tight">
              Ready to Ace Your IB Interview?
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-12 leading-relaxed font-light">
              Test your knowledge and improve your skills with our comprehensive
              AI-powered platform
            </p>
            <Link href="/quiz">
              <button
                type="button"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-200"
              >
                Start Practicing Now
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-base tracking-tight">
                InvestIQ
              </span>
            </div>
            <div className="text-gray-400 text-sm font-light">
              © 2025 InvestIQ. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Guide Modal */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
