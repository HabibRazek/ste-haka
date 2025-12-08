"use client";

import * as React from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

// Theme colors - Dark Green Theme
const PRIMARY_GREEN = "#166534";
const PRIMARY_GREEN_LIGHT = "#dcfce7";
const CHART_GREEN = "#22c55e";

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
  chartColor = CHART_GREEN,
}: KpiCardProps) {
  // Convert chartData array to recharts format
  const data = chartData.map((v, i) => ({ value: v, index: i }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-lg transition-all duration-300 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-1">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
            {value}
          </p>
          {trend !== undefined && (
            <div
              className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: trend >= 0 ? PRIMARY_GREEN_LIGHT : "#fef2f2",
                color: trend >= 0 ? PRIMARY_GREEN : "#dc2626"
              }}
            >
              {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{trend >= 0 ? "+" : ""}{trend}%</span>
            </div>
          )}
        </div>

        <div
          className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: PRIMARY_GREEN_LIGHT, color: PRIMARY_GREEN }}
        >
          {icon}
        </div>
      </div>

      {data.length > 0 && (
        <div className="w-full h-12 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${title.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0.02} />
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

