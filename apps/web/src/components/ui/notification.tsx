import { AlertCircle, Bell, CheckCircle, Info, X } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

interface NotificationProps {
  title: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  onClose?: () => void;
  className?: string;
  showIcon?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function Notification({
  title,
  message,
  type = "info",
  onClose,
  className,
  showIcon = true,
  action,
}: NotificationProps) {
  const typeStyles = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "text-green-600",
      title: "text-green-800",
      message: "text-green-700",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "text-red-600",
      title: "text-red-800",
      message: "text-red-700",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      icon: "text-yellow-600",
      title: "text-yellow-800",
      message: "text-yellow-700",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "text-blue-600",
      title: "text-blue-800",
      message: "text-blue-700",
    },
  };

  const iconMap = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info,
  };

  const Icon = iconMap[type];
  const styles = typeStyles[type];

  return (
    <div
      className={cn(
        "p-4 rounded-lg border",
        styles.bg,
        styles.border,
        className
      )}
    >
      <div className="flex items-start space-x-3">
        {showIcon && <Icon className={cn("w-5 h-5 mt-0.5", styles.icon)} />}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={cn("text-sm font-medium", styles.title)}>
                {title}
              </h4>
              <p className={cn("text-sm mt-1", styles.message)}>{message}</p>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {action && (
            <div className="mt-3">
              <button
                onClick={action.onClick}
                className={cn(
                  "text-sm font-medium hover:underline",
                  styles.title
                )}
              >
                {action.label}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface NotificationListProps {
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type?: "success" | "error" | "warning" | "info";
    timestamp: Date;
    read: boolean;
  }>;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function NotificationList({
  notifications,
  onMarkAsRead,
  onDelete,
  className,
}: NotificationListProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type?: "success" | "error" | "warning" | "info";
    timestamp: Date;
    read: boolean;
  };
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <div
      className={cn(
        "p-4 rounded-lg border transition-colors",
        notification.read
          ? "bg-white border-gray-200"
          : "bg-blue-50 border-blue-200"
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4
                  className={cn(
                    "text-sm font-medium",
                    notification.read ? "text-gray-900" : "text-blue-900"
                  )}
                >
                  {notification.title}
                </h4>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </div>
              <p
                className={cn(
                  "text-sm mt-1",
                  notification.read ? "text-gray-600" : "text-blue-700"
                )}
              >
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {formatTime(notification.timestamp)}
              </p>
            </div>

            <div className="flex items-center space-x-2 ml-3">
              {!notification.read && onMarkAsRead && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark as read
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(notification.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose: () => void;
  className?: string;
}

export function Toast({
  message,
  type = "info",
  duration = 5000,
  onClose,
  className,
}: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  };

  return (
    <div
      className={cn("fixed bottom-4 right-4 z-50 max-w-sm w-full", className)}
    >
      <div
        className={cn("p-4 rounded-lg shadow-lg text-white", typeStyles[type])}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{message}</p>
          <button
            onClick={onClose}
            className="ml-3 text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
