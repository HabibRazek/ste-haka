"use client";

import * as React from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, FileText, CheckCircle, Package, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import type { DashboardStats } from "@/lib/actions/dashboard";

const BRAND_BLUE = "#305CDE";
const BRAND_BLUE_LIGHT = "#5A7FE8";

const colisConfig = {
  colis: { label: "Nombre de Colis", color: BRAND_BLUE },
  marge: { label: "Marge (TND)", color: BRAND_BLUE_LIGHT },
} satisfies ChartConfig;

const performanceConfig = {
  value: { label: "Valeur", color: BRAND_BLUE },
} satisfies ChartConfig;

interface DashboardChartsProps {
  stats: DashboardStats;
  onExportExcel: () => void;
}

export function DashboardCharts({ stats, onExportExcel }: DashboardChartsProps) {
  const [timeRange, setTimeRange] = React.useState<"3m" | "6m" | "12m">("12m");

  // Filtered Colis data based on time range
  const filteredColisData = React.useMemo(() => {
    const monthsToShow = timeRange === "3m" ? 3 : timeRange === "6m" ? 6 : 12;
    return stats.monthlyColisData.slice(-monthsToShow);
  }, [stats.monthlyColisData, timeRange]);

  const totalColis = filteredColisData.reduce((sum, d) => sum + d.colis, 0);
  const totalMarge = filteredColisData.reduce((sum, d) => sum + d.marge, 0);
  const trend = totalMarge > 0 ? "up" : "down";
  const avgMargePerColis = totalColis > 0 ? Math.round((totalMarge / totalColis) * 1000) / 1000 : 0;

  // Performance data for bar chart
  const performanceData = [
    { metric: "Colis", value: stats.totalColis, fill: BRAND_BLUE },
    { metric: "Factures", value: stats.totalFactures, fill: BRAND_BLUE_LIGHT },
    { metric: "Devis", value: stats.totalDevis, fill: BRAND_BLUE },
    { metric: "Produits", value: stats.totalProducts, fill: BRAND_BLUE_LIGHT },
  ];

  // Radar data
  const radarData = [
    { subject: "Colis", A: Math.min(stats.totalColis * 2, 100), fullMark: 100 },
    { subject: "Marge", A: Math.min(stats.colisMarge / 100, 100), fullMark: 100 },
    { subject: "Factures", A: Math.min(stats.totalFactures * 10, 100), fullMark: 100 },
    { subject: "Tâches", A: Math.min(stats.completedTasks * 5, 100), fullMark: 100 },
    { subject: "Stock", A: Math.min(stats.totalStock, 100), fullMark: 100 },
    { subject: "Produits", A: Math.min(stats.totalProducts * 5, 100), fullMark: 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Export Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tableau de Bord</h2>
          <p className="text-sm text-gray-500">Vue d'ensemble de votre activité</p>
        </div>
        <Button onClick={onExportExcel} variant="outline" className="flex items-center gap-2">
          <Image src="/Microsoft_Office_Excel.svg" alt="Excel" width={20} height={20} />
          Exporter Excel
        </Button>
      </div>

      {/* KPI Cards - Compact & Professional */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard title="Total Colis" value={`${stats.totalColis}`} subtitle="livrés" icon={<Package className="h-4 w-4" />} />
        <KpiCard title="CA Colis" value={`${stats.colisRevenue.toLocaleString("fr-FR", { minimumFractionDigits: 3 })}`} subtitle="TND" icon={<DollarSign className="h-4 w-4" />} />
        <KpiCard title="Marge" value={`${stats.colisMarge.toLocaleString("fr-FR", { minimumFractionDigits: 3 })}`} subtitle="TND" trend={trend === "up" ? "+" : "-"} trendUp={trend === "up"} icon={<TrendingUp className="h-4 w-4" />} />
        <KpiCard title="Factures" value={`${stats.totalFactures}`} subtitle={`${stats.pendingFactures} en attente`} icon={<FileText className="h-4 w-4" />} />
      </div>

      {/* Charts Grid - All 3 charts on same row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart - Gestion & Suivi des Colis */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">📦 Gestion & Suivi des Colis</CardTitle>
            </div>
            <div className="flex gap-1 mt-1">
              {(["3m", "6m", "12m"] as const).map((range) => (
                <Button key={range} variant={timeRange === range ? "default" : "ghost"} size="sm" className="h-6 px-2 text-xs" onClick={() => setTimeRange(range)} style={timeRange === range ? { backgroundColor: BRAND_BLUE } : {}}>
                  {range}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer config={colisConfig} className="h-[200px] w-full">
              <AreaChart data={filteredColisData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorColis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND_BLUE} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={BRAND_BLUE} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorMarge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND_BLUE_LIGHT} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={BRAND_BLUE_LIGHT} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area yAxisId="left" type="monotone" dataKey="colis" stroke={BRAND_BLUE} fillOpacity={1} fill="url(#colorColis)" name="colis" />
                <Area yAxisId="left" type="monotone" dataKey="marge" stroke={BRAND_BLUE_LIGHT} fillOpacity={0.5} fill="url(#colorMarge)" name="marge" />
              </AreaChart>
            </ChartContainer>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Package className="h-3 w-3" style={{ color: BRAND_BLUE }} /> {totalColis} colis • {avgMargePerColis.toLocaleString("fr-FR")} TND/colis
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart - Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Performance</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer config={performanceConfig} className="h-[200px] w-full">
              <BarChart data={performanceData} layout="vertical" margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                <YAxis dataKey="metric" type="category" tickLine={false} axisLine={false} width={60} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Radar Chart - Vue Globale */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Vue Globale</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer config={{ A: { label: "Score", color: BRAND_BLUE } }} className="h-[200px] w-full">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b7280", fontSize: 9 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Performance" dataKey="A" stroke={BRAND_BLUE} fill={BRAND_BLUE} fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// KPI Card Component - Compact & Professional
interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

function KpiCard({ title, value, subtitle, icon, trend, trendUp }: KpiCardProps) {
  return (
    <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 truncate">{title}</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-gray-900 truncate">{value}</span>
              {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
            </div>
            {trend && (
              <div className={`flex items-center gap-0.5 mt-0.5 text-xs ${trendUp ? "text-blue-600" : "text-red-500"}`}>
                {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              </div>
            )}
          </div>
          <div className="p-1.5 rounded-md bg-gray-50 text-gray-600 ml-2">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

