import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle,
  Clock,
  Eye,
  HelpCircle,
  Lightbulb,
  Play,
  Target,
  TrendingUp,
  Users,
  Zap,
  Star,
  Award,
  Activity,
  AlertTriangle,
  BookMarked,
  Sparkles,
  Timer,
  LineChart,
  PieChart,
  Target as TargetIcon,
  Brain as BrainIcon,
  Zap as ZapIcon,
  BookOpen as BookOpenIcon,
  BarChart3 as BarChart3Icon,
  TrendingUp as TrendingUpIcon,
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
      title: "AI-Powered Quiz System",
      description: "Master the intelligent quiz experience",
      items: [
        "2-minute timer mimics real interview pressure",
        "AI-generated questions adapt to your skill level",
        "Dynamic difficulty adjustment (Easy/Medium/Hard)",
        "Instant feedback with detailed explanations",
        "Keyboard shortcuts: 1-4 for answers, Enter for next",
        "Auto-submission when time runs out",
        "Progress tracking across all topics",
        "Question review with performance analytics",
      ],
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Interactive Lessons",
      description: "Comprehensive learning resources",
      items: [
        "AI-generated personalized lessons",
        "Coverage of 6 major IB topics",
        "50+ specialized subcategories",
        "Real-world examples and case studies",
        "Interactive practice questions",
        "Common mistakes and pitfalls",
        "Key concepts with detailed explanations",
        "Progress-based lesson recommendations",
      ],
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Performance Insights",
      description: "Deep analytics and progress tracking",
      items: [
        "Detailed performance analytics dashboard",
        "Category and subcategory analysis",
        "Strength and weakness identification",
        "Time analysis and improvement trends",
        "Priority improvement areas",
        "Personalized recommendations",
        "Recent progress tracking",
        "Question-by-question review",
      ],
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Progress Tracking",
      description: "Monitor your learning journey",
      items: [
        "Visual progress charts and graphs",
        "Accuracy and score tracking",
        "Time-based performance metrics",
        "Topic-wise strength analysis",
        "Historical performance data",
        "Improvement recommendations",
        "Achievement tracking",
        "Study time analytics",
      ],
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Smart Features",
      description: "Advanced AI-powered capabilities",
      items: [
        "Adaptive difficulty based on performance",
        "Personalized question generation",
        "Intelligent topic recommendations",
        "Real-time performance analysis",
        "Automated progress insights",
        "Smart study scheduling",
        "Performance pattern recognition",
        "Predictive improvement suggestions",
      ],
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Interview Preparation",
      description: "Real-world interview simulation",
      items: [
        "Pressure-based timing system",
        "Realistic question difficulty",
        "Industry-standard topics",
        "Comprehensive topic coverage",
        "Interview-style feedback",
        "Performance under pressure",
        "Time management skills",
        "Confidence building exercises",
      ],
    },
  ];

  const topicCategories = [
    {
      name: "Accounting",
      icon: <BookMarked className="w-5 h-5" />,
      subcategories: ["Income Statement", "Balance Sheet", "Cash Flow", "3-Statement Linkages", "Working Capital", "Depreciation", "Deferred Taxes"],
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "Valuation",
      icon: <TargetIcon className="w-5 h-5" />,
      subcategories: ["DCF Analysis", "Comparable Companies", "Precedent Transactions", "WACC", "Multiples", "Terminal Value"],
      color: "from-green-500 to-green-600"
    },
    {
      name: "M&A",
      icon: <Users className="w-5 h-5" />,
      subcategories: ["Deal Structures", "Accretion/Dilution", "Synergies", "Due Diligence", "Regulatory Review", "Pro Forma"],
      color: "from-purple-500 to-purple-600"
    },
    {
      name: "LBO",
      icon: <TrendingUpIcon className="w-5 h-5" />,
      subcategories: ["Capital Structure", "Sources & Uses", "IRR Analysis", "Debt Covenants", "Exit Strategies", "Management Incentives"],
      color: "from-orange-500 to-orange-600"
    },
    {
      name: "Capital Markets",
      icon: <BarChart3Icon className="w-5 h-5" />,
      subcategories: ["IPO Process", "Bookbuilding", "Underwriting", "Debt Issuance", "Pricing Strategies", "Regulatory Filings"],
      color: "from-pink-500 to-pink-600"
    },
    {
      name: "Corporate Finance",
      icon: <BrainIcon className="w-5 h-5" />,
      subcategories: ["Capital Budgeting", "Working Capital", "Dividend Policy", "Cost of Capital", "Financial Planning", "Risk Management"],
      color: "from-indigo-500 to-indigo-600"
    },
  ];

  const tips = [
    "Practice regularly with the 2-minute timer to build interview confidence",
    "Focus on your weak areas identified in the Performance Insights",
    "Use keyboard shortcuts (1-4, Enter) for faster quiz navigation",
    "Review explanations even for correct answers to deepen understanding",
    "Take advantage of the AI-generated lessons for targeted learning",
    "Monitor your progress analytics to track improvement over time",
    "Use the question review feature to learn from mistakes",
    "Set aside dedicated study sessions for consistent improvement",
  ];

  const keyboardShortcuts = [
    { key: "1-4", description: "Select answer options" },
    { key: "Enter", description: "Proceed to next question" },
    { key: "Space", description: "Toggle question details" },
    { key: "Escape", description: "Close modals and popups" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="InvestIQ Complete Guide"
      size="full"
      showCloseButton={true}
      className="bg-gradient-to-br from-slate-900 to-slate-800 border border-blue-500/20"
    >
      <div className="text-white max-h-[80vh] overflow-y-auto">
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
                Your comprehensive AI-powered IB interview preparation platform
              </p>
            </div>
          </div>
          <p className="text-gray-300 leading-relaxed">
            This comprehensive guide covers all features and capabilities of InvestIQ. 
            From AI-powered quizzes to detailed analytics, learn how to maximize your 
            investment banking interview preparation.
          </p>
        </div>

        {/* Main Features Grid */}
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

        {/* Topic Coverage */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <BookOpenIcon className="w-6 h-6 mr-3 text-blue-400" />
            Comprehensive Topic Coverage
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topicCategories.map((category, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-700/20 to-gray-800/20 border border-gray-600/30 rounded-xl p-4 hover:border-gray-500/50 transition-all duration-300"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-8 h-8 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center`}>
                    {category.icon}
                  </div>
                  <h4 className="font-semibold text-white">{category.name}</h4>
                </div>
                <div className="space-y-1">
                  {category.subcategories.map((sub, subIndex) => (
                    <div key={subIndex} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span className="text-xs text-gray-300">{sub}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-gradient-to-br from-green-600/10 to-blue-600/10 border border-green-500/20 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Keyboard Shortcuts
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {keyboardShortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">{shortcut.description}</span>
                <kbd className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-sm">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Tips */}
        <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/20 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Pro Tips for Success
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-gray-300">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Timer className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-white mb-2">Real Interview Pressure</h4>
            <p className="text-xs text-gray-300">2-minute timer mimics actual interview conditions</p>
          </div>
          <div className="bg-gradient-to-br from-green-600/10 to-blue-600/10 border border-green-500/20 rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-white mb-2">AI-Powered Learning</h4>
            <p className="text-xs text-gray-300">Adaptive questions and personalized lessons</p>
          </div>
          <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/20 rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-white mb-2">Deep Analytics</h4>
            <p className="text-xs text-gray-300">Comprehensive performance insights and tracking</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-gray-700/20 to-gray-800/20 border border-gray-600/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
            Ready to Get Started?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => {
                onClose();
                window.location.href = "/quiz";
              }}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm"
            >
              <Play className="w-4 h-4" />
              <span>Start Quiz</span>
            </button>
            <button
              onClick={() => {
                onClose();
                window.location.href = "/lessons";
              }}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Lessons</span>
            </button>
            <button
              onClick={() => {
                onClose();
                window.location.href = "/performance-insights";
              }}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200 text-sm"
            >
              <BarChart3 className="w-4 h-4" />
              <span>View Insights</span>
            </button>
            <button
              onClick={() => {
                onClose();
                window.location.href = "/progress";
              }}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-3 rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-200 text-sm"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Track Progress</span>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Need help? The guide is always available from the navigation menu.
          </p>
        </div>
      </div>
    </Modal>
  );
}
