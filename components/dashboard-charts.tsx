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

const colisConfig = {
  colis: { label: "Nombre de Colis", color: BRAND_BLUE },
  marge: { label: "Marge (TND)", color: BRAND_GREEN },
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
    { metric: "Factures", value: stats.totalFactures, fill: BRAND_GREEN },
    { metric: "Devis", value: stats.totalDevis, fill: BRAND_BLUE },
    { metric: "Produits", value: stats.totalProducts, fill: BRAND_GREEN },
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Colis" value={`${stats.totalColis}`} subtitle="Commandes livrées" icon={<Package className="h-5 w-5" />} color={BRAND_BLUE} />
        <KpiCard title="CA Colis" value={`${stats.colisRevenue.toLocaleString("fr-FR", { minimumFractionDigits: 3 })} TND`} icon={<DollarSign className="h-5 w-5" />} color={BRAND_GREEN} />
        <KpiCard title="Marge Totale" value={`${stats.colisMarge.toLocaleString("fr-FR", { minimumFractionDigits: 3 })} TND`} trend={trend === "up" ? "+" : "-"} trendUp={trend === "up"} icon={<TrendingUp className="h-5 w-5" />} color={BRAND_BLUE} />
        <KpiCard title="Factures" value={`${stats.totalFactures}`} subtitle={`${stats.pendingFactures} en attente`} icon={<FileText className="h-5 w-5" />} color={BRAND_GREEN} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart - Gestion & Suivi des Colis */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>📦 Gestion & Suivi des Colis</CardTitle>
              <CardDescription>Évolution mensuelle des livraisons et marges {new Date().getFullYear()}</CardDescription>
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
            <ChartContainer config={colisConfig} className="h-[300px] w-full">
              <AreaChart data={filteredColisData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorColis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND_BLUE} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={BRAND_BLUE} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorMarge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND_GREEN} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={BRAND_GREEN} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tickFormatter={(v) => `${v.toLocaleString("fr-FR")} TND`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area yAxisId="left" type="monotone" dataKey="colis" stroke={BRAND_BLUE} fillOpacity={1} fill="url(#colorColis)" name="colis" />
                <Area yAxisId="right" type="monotone" dataKey="marge" stroke={BRAND_GREEN} fillOpacity={1} fill="url(#colorMarge)" name="marge" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              <Package className="h-4 w-4" style={{ color: BRAND_BLUE }} /> {totalColis} colis • Marge moyenne: {avgMargePerColis.toLocaleString("fr-FR", { minimumFractionDigits: 3 })} TND/colis
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

