import { TrendingDown, TrendingUp } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface ChartProps {
  data: DataPoint[];
  title: string;
  subtitle?: string;
  type?: "line" | "bar" | "pie";
  className?: string;
  showTrend?: boolean;
  trendValue?: number;
}

export function AnalyticsChart({
  data,
  title,
  subtitle,
  type = "line",
  className,
  showTrend = false,
  trendValue = 0,
}: ChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const _minValue = Math.min(...data.map((d) => d.value));

  return (
    <div
      className={cn(
        "bg-white p-6 rounded-lg border border-gray-200",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
        {showTrend && (
          <div className="flex items-center space-x-2">
            {trendValue > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span
              className={cn(
                "text-sm font-medium",
                trendValue > 0 ? "text-green-600" : "text-red-600"
              )}
            >
              {Math.abs(trendValue)}%
            </span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-64">
        {type === "line" && (
          <LineChartComponent data={data} maxValue={maxValue} />
        )}
        {type === "bar" && (
          <BarChartComponent data={data} maxValue={maxValue} />
        )}
        {type === "pie" && <PieChartComponent data={data} />}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4">
        {data.map((point, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: point.color || getDefaultColor(index) }}
            />
            <span className="text-sm text-gray-600">{point.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChartComponent({
  data,
  maxValue,
}: {
  data: DataPoint[];
  maxValue: number;
}) {
  const points = data.map((point, index) => ({
    x: (index / (data.length - 1 || 1)) * 100,
    y: 100 - ((point.value - 0) / (maxValue - 0 || 1)) * 100,
  }));

  const pathData = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path d={`${pathData} L 100 100 L 0 100 Z`} fill="url(#lineGradient)" />

      {/* Line */}
      <path
        d={pathData}
        stroke="#3b82f6"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Points */}
      {points.map((point, index) => (
        <circle key={index} cx={point.x} cy={point.y} r="2" fill="#3b82f6" />
      ))}
    </svg>
  );
}

function BarChartComponent({
  data,
  maxValue,
}: {
  data: DataPoint[];
  maxValue: number;
}) {
  const barWidth = 100 / (data.length || 1);
  const barSpacing = barWidth * 0.2;

  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {data.map((point, index) => {
        const height = ((point.value - 0) / (maxValue - 0 || 1)) * 80;
        const x = index * barWidth + barSpacing / 2;
        const y = 100 - height;
        const width = barWidth - barSpacing;

        return (
          <g key={index}>
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              fill={point.color || getDefaultColor(index)}
              rx="2"
            />
            <text
              x={x + width / 2}
              y="95"
              textAnchor="middle"
              fontSize="8"
              fill="#6b7280"
            >
              {point.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function PieChartComponent({ data }: { data: DataPoint[] }) {
  const total = data.reduce((sum, point) => sum + point.value, 0);
  let currentAngle = 0;

  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {data.map((point, index) => {
        const percentage = (point.value / total) * 100;
        const angle = (percentage / 100) * 360;
        const radius = 35;
        const centerX = 50;
        const centerY = 50;

        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;

        const startRadians = (startAngle - 90) * (Math.PI / 180);
        const endRadians = (endAngle - 90) * (Math.PI / 180);

        const x1 = centerX + radius * Math.cos(startRadians);
        const y1 = centerY + radius * Math.sin(startRadians);
        const x2 = centerX + radius * Math.cos(endRadians);
        const y2 = centerY + radius * Math.sin(endRadians);

        const largeArcFlag = angle > 180 ? 1 : 0;

        const pathData = [
          `M ${centerX} ${centerY}`,
          `L ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          "Z",
        ].join(" ");

        currentAngle += angle;

        return (
          <path
            key={index}
            d={pathData}
            fill={point.color || getDefaultColor(index)}
            stroke="#ffffff"
            strokeWidth="1"
          />
        );
      })}
    </svg>
  );
}

function getDefaultColor(index: number): string {
  const colors = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // yellow
    "#ef4444", // red
    "#8b5cf6", // purple
    "#06b6d4", // cyan
    "#f97316", // orange
    "#ec4899", // pink
  ];
  return colors[index % colors.length];
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease";
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "bg-white p-6 rounded-lg border border-gray-200",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="flex items-center space-x-1 mt-1">
              {changeType === "increase" ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  changeType === "increase" ? "text-green-600" : "text-red-600"
                )}
              >
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-blue-100 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
}
