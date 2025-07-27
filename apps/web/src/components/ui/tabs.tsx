import type React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
  variant?: "default" | "pills" | "underline";
  size?: "sm" | "md" | "lg";
}

export function Tabs({
  tabs,
  defaultTab,
  className,
  variant = "default",
  size = "md",
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const variantStyles = {
    default: {
      container: "border-b border-gray-200",
      tab: "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
      active: "border-blue-500 text-blue-600",
    },
    pills: {
      container: "space-x-1",
      tab: "rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100",
      active: "bg-blue-100 text-blue-700",
    },
    underline: {
      container: "border-b border-gray-200",
      tab: "border-b-2 border-transparent text-gray-500 hover:text-gray-700",
      active: "border-blue-500 text-blue-600",
    },
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const styles = variantStyles[variant];

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div
        className={cn(
          "flex",
          variant === "pills" ? styles.container : styles.container
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && setActiveTab(tab.id)}
            disabled={tab.disabled}
            className={cn(
              "flex items-center space-x-2 font-medium transition-colors duration-200",
              sizeStyles[size],
              styles.tab,
              activeTab === tab.id && styles.active,
              tab.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}

interface TabPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ children, className }: TabPanelProps) {
  return <div className={cn("focus:outline-none", className)}>{children}</div>;
}
