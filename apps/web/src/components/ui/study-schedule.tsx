import {
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  Edit,
  Plus,
  Trash,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudySession {
  id: string;
  title: string;
  topic: string;
  duration: number; // in minutes
  scheduledAt: Date;
  completed: boolean;
  completedAt?: Date;
  notes?: string;
}

interface StudyScheduleProps {
  sessions: StudySession[];
  className?: string;
  onAddSession?: () => void;
  onEditSession?: (session: StudySession) => void;
  onDeleteSession?: (sessionId: string) => void;
  onToggleComplete?: (sessionId: string) => void;
}

export function StudySchedule({
  sessions,
  className,
  onAddSession,
  onEditSession,
  onDeleteSession,
  onToggleComplete,
}: StudyScheduleProps) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaySessions = sessions.filter(
    (session) => session.scheduledAt.toDateString() === today.toDateString()
  );

  const upcomingSessions = sessions.filter(
    (session) => session.scheduledAt > today && session.scheduledAt < tomorrow
  );

  const _formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const _formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Study Schedule</h2>
        </div>
        {onAddSession && (
          <button
            onClick={onAddSession}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Session</span>
          </button>
        )}
      </div>

      {/* Today's Sessions */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Today&apos;s Sessions</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {todaySessions.length > 0 ? (
            todaySessions.map((session) => (
              <StudySessionItem
                key={session.id}
                session={session}
                onEdit={onEditSession}
                onDelete={onDeleteSession}
                onToggleComplete={onToggleComplete}
              />
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No sessions scheduled for today
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Upcoming Sessions</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {upcomingSessions.map((session) => (
              <StudySessionItem
                key={session.id}
                session={session}
                onEdit={onEditSession}
                onDelete={onDeleteSession}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface StudySessionItemProps {
  session: StudySession;
  onEdit?: (session: StudySession) => void;
  onDelete?: (sessionId: string) => void;
  onToggleComplete?: (sessionId: string) => void;
}

function StudySessionItem({
  session,
  onEdit,
  onDelete,
  onToggleComplete,
}: StudySessionItemProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3">
        {/* Completion Status */}
        <button
          onClick={() => onToggleComplete?.(session.id)}
          className="flex-shrink-0"
        >
          {session.completed ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          )}
        </button>

        {/* Session Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4
              className={cn(
                "font-medium text-sm",
                session.completed
                  ? "text-gray-500 line-through"
                  : "text-gray-900"
              )}
            >
              {session.title}
            </h4>
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
              {session.topic}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatTime(session.scheduledAt)}</span>
            </div>
            <span>•</span>
            <span>{formatDuration(session.duration)}</span>
            {session.completed && session.completedAt && (
              <>
                <span>•</span>
                <span className="text-green-600">Completed</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(session)}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(session.id)}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
            >
              <Trash className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface StudyStatsProps {
  totalSessions: number;
  completedSessions: number;
  totalStudyTime: number; // in minutes
  streak: number;
  className?: string;
}

export function StudyStats({
  totalSessions,
  completedSessions,
  totalStudyTime,
  streak,
  className,
}: StudyStatsProps) {
  const completionRate =
    totalSessions > 0
      ? Math.round((completedSessions / totalSessions) * 100)
      : 0;
  const totalHours = Math.floor(totalStudyTime / 60);
  const totalMinutes = totalStudyTime % 60;

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
        <div className="text-2xl font-bold text-blue-600">{totalSessions}</div>
        <div className="text-sm text-gray-600">Total Sessions</div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
        <div className="text-2xl font-bold text-green-600">
          {completionRate}%
        </div>
        <div className="text-sm text-gray-600">Completion Rate</div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
        <div className="text-2xl font-bold text-purple-600">
          {totalHours}h {totalMinutes}m
        </div>
        <div className="text-sm text-gray-600">Total Study Time</div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
        <div className="text-2xl font-bold text-orange-600">{streak}</div>
        <div className="text-sm text-gray-600">Day Streak</div>
      </div>
    </div>
  );
}
