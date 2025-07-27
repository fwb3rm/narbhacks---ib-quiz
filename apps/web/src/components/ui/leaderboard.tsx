import {
  Crown,
  Medal,
  Minus,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar?: string;
  score: number;
  level: number;
  change?: number; // positive for up, negative for down, 0 for no change
  streak?: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
  className?: string;
  showChange?: boolean;
  showStreak?: boolean;
}

export function Leaderboard({
  entries,
  title = "Leaderboard",
  className,
  showChange = true,
  showStreak = true,
}: LeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getChangeIcon = (change?: number) => {
    if (!change) return <Minus className="w-4 h-4 text-gray-400" />;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  return (
    <div
      className={cn("bg-white rounded-xl border border-gray-200", className)}
    >
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              {/* Rank */}
              <div className="flex items-center justify-center w-8 h-8">
                {getRankIcon(entry.rank)}
              </div>

              {/* Avatar */}
              <div className="flex-shrink-0">
                {entry.avatar ? (
                  <img
                    src={entry.avatar}
                    alt={entry.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {entry.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {entry.name}
                  </p>
                  <span className="text-xs text-gray-500">
                    Lv.{entry.level}
                  </span>
                </div>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-600">
                    {entry.score} pts
                  </span>
                  {showStreak && entry.streak && (
                    <span className="text-xs text-orange-600 font-medium">
                      🔥 {entry.streak} day streak
                    </span>
                  )}
                </div>
              </div>

              {/* Change */}
              {showChange && (
                <div className="flex items-center space-x-1">
                  {getChangeIcon(entry.change)}
                  {entry.change && (
                    <span
                      className={cn(
                        "text-xs font-medium",
                        entry.change > 0 ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {Math.abs(entry.change)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
  className?: string;
}

export function LeaderboardCard({
  entry,
  isCurrentUser = false,
  className,
}: LeaderboardCardProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-lg border transition-colors",
        isCurrentUser
          ? "bg-blue-50 border-blue-200"
          : "bg-white border-gray-200 hover:bg-gray-50",
        className
      )}
    >
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-8 h-8">
          {entry.rank === 1 && <Crown className="w-5 h-5 text-yellow-500" />}
          {entry.rank === 2 && <Medal className="w-5 h-5 text-gray-400" />}
          {entry.rank === 3 && <Medal className="w-5 h-5 text-amber-600" />}
          {entry.rank > 3 && (
            <span className="text-sm font-bold text-gray-500">
              #{entry.rank}
            </span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <p className="font-medium text-gray-900">{entry.name}</p>
            {isCurrentUser && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                You
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{entry.score} points</p>
        </div>
      </div>
    </div>
  );
}
