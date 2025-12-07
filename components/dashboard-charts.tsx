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
const BRAND_GREEN = "#89F336";

const revenueExpenseConfig = {
  revenue: { label: "Chiffre d'Affaires", color: BRAND_BLUE },
  expenses: { label: "Charges", color: BRAND_GREEN },
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

  const filteredData = React.useMemo(() => {
    const monthsToShow = timeRange === "3m" ? 3 : timeRange === "6m" ? 6 : 12;
    return stats.monthlyData.slice(-monthsToShow);
  }, [stats.monthlyData, timeRange]);

  const totalRevenue = filteredData.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpenses = filteredData.reduce((sum, d) => sum + d.expenses, 0);
  const trend = totalRevenue > totalExpenses ? "up" : "down";
  const trendPercent = totalRevenue > 0 ? Math.round(((totalRevenue - totalExpenses) / totalRevenue) * 100) : 0;

  // Performance data for bar chart
  const performanceData = [
    { metric: "Devis", value: stats.totalDevis, fill: BRAND_BLUE },
    { metric: "Factures", value: stats.totalFactures, fill: BRAND_GREEN },
    { metric: "Tâches", value: stats.completedTasks, fill: BRAND_BLUE },
    { metric: "Produits", value: stats.totalProducts, fill: BRAND_GREEN },
  ];

  // Radar data
  const radarData = [
    { subject: "CA", A: Math.min(stats.totalRevenue / 1000, 100), fullMark: 100 },
    { subject: "Devis", A: Math.min(stats.totalDevis * 10, 100), fullMark: 100 },
    { subject: "Factures", A: Math.min(stats.totalFactures * 10, 100), fullMark: 100 },
    { subject: "Tâches", A: Math.min(stats.completedTasks * 5, 100), fullMark: 100 },
    { subject: "Stock", A: Math.min(stats.totalStock, 100), fullMark: 100 },
    { subject: "Marge", A: Math.max(stats.profitMargin, 0), fullMark: 100 },
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Chiffre d'Affaires" value={`${stats.totalRevenue.toLocaleString("fr-FR", { minimumFractionDigits: 3 })} TND`} icon={<DollarSign className="h-5 w-5" />} trend={trend === "up" ? `+${trendPercent}%` : `-${Math.abs(trendPercent)}%`} trendUp={trend === "up"} color={BRAND_BLUE} />
        <KpiCard title="Charges" value={`${stats.totalExpenses.toLocaleString("fr-FR", { minimumFractionDigits: 3 })} TND`} icon={<TrendingDown className="h-5 w-5" />} color={BRAND_GREEN} />
        <KpiCard title="Factures" value={`${stats.totalFactures}`} subtitle={`${stats.pendingFactures} en attente`} icon={<FileText className="h-5 w-5" />} color={BRAND_BLUE} />
        <KpiCard title="Tâches Terminées" value={`${stats.completedTasks}/${stats.totalTasks}`} icon={<CheckCircle className="h-5 w-5" />} color={BRAND_GREEN} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart - Revenue vs Expenses */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Revenus vs Charges</CardTitle>
              <CardDescription>Évolution mensuelle {new Date().getFullYear()}</CardDescription>
            </div>
            <div className="flex gap-2">
              {(["3m", "6m", "12m"] as const).map((range) => (
                <Button key={range} variant={timeRange === range ? "default" : "outline"} size="sm" onClick={() => setTimeRange(range)} style={timeRange === range ? { backgroundColor: BRAND_BLUE } : {}}>
                  {range === "3m" ? "3 mois" : range === "6m" ? "6 mois" : "12 mois"}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueExpenseConfig} className="h-[300px] w-full">
              <AreaChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND_BLUE} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={BRAND_BLUE} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND_GREEN} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={BRAND_GREEN} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="revenue" stroke={BRAND_BLUE} fillOpacity={1} fill="url(#colorRevenue)" name="revenue" />
                <Area type="monotone" dataKey="expenses" stroke={BRAND_GREEN} fillOpacity={1} fill="url(#colorExpenses)" name="expenses" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              {trend === "up" ? <><TrendingUp className="h-4 w-4" style={{ color: BRAND_GREEN }} /> Bénéfice de {trendPercent}%</> : <><TrendingDown className="h-4 w-4 text-red-500" /> Perte de {Math.abs(trendPercent)}%</>}
            </div>
            <div className="leading-none text-muted-foreground">Période: {timeRange === "3m" ? "3 derniers mois" : timeRange === "6m" ? "6 derniers mois" : "Année complète"}</div>
          </CardFooter>
        </Card>

        {/* Bar Chart - Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>Indicateurs clés</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={performanceConfig} className="h-[250px] w-full">
              <BarChart data={performanceData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis dataKey="metric" type="category" tickLine={false} axisLine={false} width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Vue Globale</CardTitle>
            <CardDescription>Analyse multi-dimensionnelle</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ A: { label: "Score", color: BRAND_BLUE } }} className="h-[250px] w-full">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="80%">
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b7280", fontSize: 12 }} />
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

// KPI Card Component
interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color: string;
}

function KpiCard({ title, value, subtitle, icon, trend, trendUp, color }: KpiCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10" style={{ backgroundColor: color }} />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <div style={{ color }}>{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${trendUp ? "text-green-600" : "text-red-600"}`}>
            {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

