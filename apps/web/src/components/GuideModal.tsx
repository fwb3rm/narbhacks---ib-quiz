import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Lightbulb,
  Play,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Modal } from "./ui/modal";

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuideModal({ isOpen, onClose }: GuideModalProps) {
  const guideSections = [
    {
      icon: <Play className="w-6 h-6" />,
      title: "Getting Started",
      description: "Learn how to begin your IB interview preparation journey",
      items: [
        "Take your first quiz to assess your current knowledge",
        "Review your performance and identify areas for improvement",
        "Explore lessons to build foundational concepts",
        "Track your progress over time",
      ],
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Quiz Features",
      description: "Master the AI-powered quiz system",
      items: [
        "2-minute timer mimics real interview pressure",
        "AI-generated questions adapt to your skill level",
        "Instant feedback on answers with explanations",
        "Progress tracking across different topics",
      ],
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Learning Resources",
      description: "Access comprehensive study materials",
      items: [
        "Structured lessons covering key IB topics",
        "Real-world examples and case studies",
        "Interactive content for better retention",
        "Regular updates with latest industry trends",
      ],
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Progress Analytics",
      description: "Monitor your improvement journey",
      items: [
        "Detailed performance metrics and insights",
        "Topic-wise strength and weakness analysis",
        "Historical progress tracking",
        "Personalized improvement recommendations",
      ],
    },
  ];

  const tips = [
    "Practice regularly - consistency is key to success",
    "Focus on your weak areas identified by analytics",
    "Use the timer to build interview confidence",
    "Review explanations even for correct answers",
    "Take breaks between sessions to maintain focus",
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="InvestIQ Guide"
      size="xl"
      showCloseButton={true}
      className="bg-gradient-to-br from-slate-900 to-slate-800 border border-blue-500/20"
    >
      <div className="text-white">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Welcome to InvestIQ!
              </h2>
              <p className="text-blue-300">
                Your AI-powered IB interview preparation platform
              </p>
            </div>
          </div>
          <p className="text-gray-300 leading-relaxed">
            This guide will help you navigate through all the features and make
            the most of your learning experience. Whether you're just starting
            or looking to refine your skills, we've got you covered.
          </p>
        </div>

        {/* Guide Sections */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {guideSections.map((section, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-all duration-300"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  {section.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {section.title}
                  </h3>
                  <p className="text-sm text-blue-300">{section.description}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-br from-green-600/10 to-blue-600/10 border border-green-500/20 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Pro Tips for Success
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-gray-300">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Ready to Get Started?
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                onClose();
                window.location.href = "/quiz";
              }}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              <Play className="w-4 h-4" />
              <span>Start Your Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                onClose();
                window.location.href = "/lessons";
              }}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Lessons</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
