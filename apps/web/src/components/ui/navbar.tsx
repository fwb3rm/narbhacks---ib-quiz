import { BarChart3, Bell, BookOpen, Target, Trophy, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavbarProps {
  className?: string;
  user?: {
    name: string;
    avatar?: string;
    level: number;
    points: number;
  };
}

export function Navbar({ className, user }: NavbarProps) {
  return (
    <nav
      className={cn(
        "bg-white border-b border-gray-200 sticky top-0 z-50",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">InvestIQ</h1>
                <p className="text-xs text-gray-500">Elite IB Prep</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="nav-link">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
            <Link href="/quiz" className="nav-link">
              <Target className="w-4 h-4 mr-2" />
              Practice
            </Link>
            <Link href="/progress" className="nav-link">
              <BookOpen className="w-4 h-4 mr-2" />
              Progress
            </Link>
            <Link href="/leaderboard" className="nav-link">
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </Link>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile */}
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Level {user.level} • {user.points} pts
                  </p>
                </div>
                <div className="relative">
                  <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="btn-primary">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// Add nav-link styles to globals.css
const _navLinkStyles = `
  .nav-link {
    @apply flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors;
  }
`;
