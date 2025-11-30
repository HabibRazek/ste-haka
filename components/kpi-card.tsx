"use client";

import * as React from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

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
  chartColor = "#6b7280",
}: KpiCardProps) {
  // Convert chartData array to recharts format
  const data = chartData.map((v, i) => ({ value: v, index: i }));

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <div
          className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center shrink-0 bg-gray-50"
        >
          <div className="scale-75 sm:scale-100 text-gray-600">{icon}</div>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">{title}</p>
          <p className="text-sm sm:text-xl font-bold truncate text-gray-900">
            {value}
          </p>
          {trend !== undefined && (
            <p className={`text-[10px] sm:text-xs ${trend >= 0 ? "text-green-600" : "text-red-500"}`}>
              {trend >= 0 ? "+" : ""}{trend}%
            </p>
          )}
        </div>
      </div>

      {data.length > 0 && (
        <div className="w-12 h-8 sm:w-20 sm:h-10 shrink-0 hidden xs:block sm:block">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${title.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={1.5}
                fill={`url(#gradient-${title.replace(/\s/g, "")})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

