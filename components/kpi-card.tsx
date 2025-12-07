"use client";

import * as React from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

// Theme colors
const ACCENT_LIME = "#c4f500";
const ACCENT_LIME_DARK = "#80a100";
const BRAND_DARK = "#1a1a1a";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number; // percentage change
  chartData?: number[];
  chartColor?: string;
}

export function KpiCard({
  title,
  value,
  icon,
  trend,
  chartData = [],
  chartColor = BRAND_DARK,
}: KpiCardProps) {
  // Convert chartData array to recharts format
  const data = chartData.map((v, i) => ({ value: v, index: i }));

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <div
          className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${ACCENT_LIME}15`, color: ACCENT_LIME_DARK }}
        >
          <div className="scale-75 sm:scale-100">{icon}</div>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">{title}</p>
          <p className="text-sm sm:text-xl font-bold truncate text-gray-900">
            {value}
          </p>
          {trend !== undefined && (
            <div className="flex items-center gap-0.5 text-[10px] sm:text-xs" style={{ color: trend >= 0 ? ACCENT_LIME_DARK : "#dc2626" }}>
              {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{trend >= 0 ? "+" : ""}{trend}%</span>
            </div>
          )}
        </div>
      </div>

      {data.length > 0 && (
        <div className="w-12 h-8 sm:w-20 sm:h-10 shrink-0 hidden xs:block sm:block">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${title.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={2}
                fill={`url(#gradient-${title.replace(/\s/g, "")})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

