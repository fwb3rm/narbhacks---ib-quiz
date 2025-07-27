import {
  Award,
  BookOpen,
  Crown,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon:
    | "trophy"
    | "star"
    | "zap"
    | "target"
    | "book"
    | "trending"
    | "award"
    | "crown";
  category: "quiz" | "streak" | "level" | "social" | "special";
  rarity: "common" | "rare" | "epic" | "legendary";
  unlocked: boolean;
  progress?: {
    current: number;
    total: number;
  };
  unlockedAt?: Date;
  points?: number;
}

interface AchievementCardProps {
  achievement: Achievement;
  className?: string;
  onClick?: () => void;
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  zap: Zap,
  target: Target,
  book: BookOpen,
  trending: TrendingUp,
  award: Award,
  crown: Crown,
};

const rarityStyles = {
  common: {
    bg: "bg-gray-100",
    border: "border-gray-300",
    icon: "text-gray-600",
    text: "text-gray-700",
  },
  rare: {
    bg: "bg-blue-100",
    border: "border-blue-300",
    icon: "text-blue-600",
    text: "text-blue-700",
  },
  epic: {
    bg: "bg-purple-100",
    border: "border-purple-300",
    icon: "text-purple-600",
    text: "text-purple-700",
  },
  legendary: {
    bg: "bg-yellow-100",
    border: "border-yellow-300",
    icon: "text-yellow-600",
    text: "text-yellow-700",
  },
};

export function AchievementCard({
  achievement,
  className,
  onClick,
}: AchievementCardProps) {
  const Icon = iconMap[achievement.icon];
  const styles = rarityStyles[achievement.rarity];
  const progressPercentage = achievement.progress
    ? (achievement.progress.current / achievement.progress.total) * 100
    : 0;

  return (
    <div
      className={cn(
        "p-4 rounded-lg border transition-all duration-200",
        styles.bg,
        styles.border,
        !achievement.unlocked && "opacity-60",
        onClick && "cursor-pointer hover:scale-105 hover:shadow-md",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={cn("p-2 rounded-lg bg-white/80", styles.icon)}>
          <Icon className="w-6 h-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className={cn("font-semibold text-sm", styles.text)}>
              {achievement.title}
            </h3>
            <span
              className={cn(
                "px-2 py-0.5 text-xs font-medium rounded-full capitalize",
                achievement.rarity === "legendary" &&
                  "bg-yellow-200 text-yellow-800",
                achievement.rarity === "epic" &&
                  "bg-purple-200 text-purple-800",
                achievement.rarity === "rare" && "bg-blue-200 text-blue-800",
                achievement.rarity === "common" && "bg-gray-200 text-gray-800"
              )}
            >
              {achievement.rarity}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-2">
            {achievement.description}
          </p>

          {/* Progress Bar */}
          {achievement.progress && !achievement.unlocked && (
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>
                  {achievement.progress.current}/{achievement.progress.total}
                </span>
              </div>
              <div className="w-full bg-white/50 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    styles.bg
                  )}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            {achievement.unlocked ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-green-600 font-medium">
                  ✓ Unlocked
                </span>
                {achievement.unlockedAt && (
                  <span className="text-xs text-gray-500">
                    {achievement.unlockedAt.toLocaleDateString()}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-gray-500">Locked</span>
            )}

            {achievement.points && (
              <span className="text-xs font-medium text-gray-600">
                +{achievement.points} pts
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface AchievementGridProps {
  achievements: Achievement[];
  className?: string;
}

export function AchievementGrid({
  achievements,
  className,
}: AchievementGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        className
      )}
    >
      {achievements.map((achievement) => (
        <AchievementCard key={achievement.id} achievement={achievement} />
      ))}
    </div>
  );
}

interface AchievementStatsProps {
  total: number;
  unlocked: number;
  className?: string;
}

export function AchievementStats({
  total,
  unlocked,
  className,
}: AchievementStatsProps) {
  const percentage = Math.round((unlocked / total) * 100);

  return (
    <div
      className={cn(
        "bg-white p-4 rounded-lg border border-gray-200",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">Achievements</h3>
        <span className="text-sm text-gray-600">
          {unlocked}/{total}
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-xs text-gray-500">{percentage}% complete</p>
    </div>
  );
}
