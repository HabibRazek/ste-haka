"use client";

import * as React from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, FileText, CheckCircle, Package, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import type { DashboardStats } from "@/lib/actions/dashboard";

// Dark theme colors
const BRAND_DARK = "#1a1a1a";
const BRAND_GRAY = "#4a4a4a";

// Accent lime colors
const ACCENT_LIME = "#c4f500";
const ACCENT_LIME_DARK = "#80a100";

const colisConfig = {
  colis: { label: "Nombre de Colis", color: BRAND_DARK },
  marge: { label: "Marge (TND)", color: ACCENT_LIME_DARK },
} satisfies ChartConfig;

const performanceConfig = {
  value: { label: "Valeur", color: BRAND_DARK },
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

  // Performance data for bar chart - alternating dark and lime accent
  const performanceData = [
    { metric: "Colis", value: stats.totalColis, fill: BRAND_DARK },
    { metric: "Factures", value: stats.totalFactures, fill: ACCENT_LIME_DARK },
    { metric: "Devis", value: stats.totalDevis, fill: BRAND_DARK },
    { metric: "Produits", value: stats.totalProducts, fill: ACCENT_LIME_DARK },
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
                <Button key={range} variant={timeRange === range ? "default" : "ghost"} size="sm" className="h-6 px-2 text-xs" onClick={() => setTimeRange(range)} style={timeRange === range ? { backgroundColor: BRAND_DARK, color: ACCENT_LIME } : {}}>
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
                    <stop offset="5%" stopColor={BRAND_DARK} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={BRAND_DARK} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorMarge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={ACCENT_LIME_DARK} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={ACCENT_LIME_DARK} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#666" }} />
                <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#666" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area yAxisId="left" type="monotone" dataKey="colis" stroke={BRAND_DARK} fillOpacity={1} fill="url(#colorColis)" name="colis" />
                <Area yAxisId="left" type="monotone" dataKey="marge" stroke={ACCENT_LIME_DARK} fillOpacity={0.5} fill="url(#colorMarge)" name="marge" />
              </AreaChart>
            </ChartContainer>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Package className="h-3 w-3" style={{ color: ACCENT_LIME_DARK }} /> {totalColis} colis • <span style={{ color: ACCENT_LIME_DARK }}>{avgMargePerColis.toLocaleString("fr-FR")} TND/colis</span>
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
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e5e5" />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#666" }} />
                <YAxis dataKey="metric" type="category" tickLine={false} axisLine={false} width={60} tick={{ fontSize: 10, fill: "#666" }} />
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
            <ChartContainer config={{ A: { label: "Score", color: ACCENT_LIME_DARK } }} className="h-[200px] w-full">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#d4d4d4" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#525252", fontSize: 9 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Performance" dataKey="A" stroke={ACCENT_LIME_DARK} fill={ACCENT_LIME_DARK} fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Factures */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">📄 Factures Récentes</CardTitle>
              <span className="text-xs text-muted-foreground">{stats.recentFactures.length} dernières</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-2 py-2 text-left font-medium text-gray-500">N°</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-500">Date</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-500">Client</th>
                    <th className="px-2 py-2 text-right font-medium text-gray-500">Total</th>
                    <th className="px-2 py-2 text-center font-medium text-gray-500">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentFactures.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-2 py-6 text-center text-gray-400">Aucune facture</td>
                    </tr>
                  ) : (
                    stats.recentFactures.map((facture) => (
                      <tr key={facture.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-2 py-2 font-medium text-gray-900">{facture.numero}</td>
                        <td className="px-2 py-2 text-gray-500">{formatDate(facture.date)}</td>
                        <td className="px-2 py-2 text-gray-700 truncate max-w-[120px]">{facture.clientName}</td>
                        <td className="px-2 py-2 text-right font-medium text-gray-900">{formatNumber(facture.total)} TND</td>
                        <td className="px-2 py-2 text-center">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            facture.status === "PAID"
                              ? "text-white"
                              : facture.status === "PENDING"
                                ? "bg-gray-100 text-gray-700"
                                : "bg-red-100 text-red-700"
                          }`} style={facture.status === "PAID" ? { backgroundColor: ACCENT_LIME_DARK } : {}}>
                            {facture.status === "PAID" ? "Payée" : facture.status === "PENDING" ? "En attente" : "Annulée"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders (Colis) */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">📦 Colis Récents</CardTitle>
              <span className="text-xs text-muted-foreground">{stats.recentOrders.length} derniers</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-2 py-2 text-left font-medium text-gray-500">Date</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-500">Désignation</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-500">Client</th>
                    <th className="px-2 py-2 text-right font-medium text-gray-500">Prix</th>
                    <th className="px-2 py-2 text-right font-medium text-gray-500">Marge</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-2 py-6 text-center text-gray-400">Aucun colis</td>
                    </tr>
                  ) : (
                    stats.recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-2 py-2 text-gray-500">{formatDate(order.date)}</td>
                        <td className="px-2 py-2 text-gray-700 truncate max-w-[120px]">{order.designation}</td>
                        <td className="px-2 py-2 text-gray-700 truncate max-w-[100px]">{order.client}</td>
                        <td className="px-2 py-2 text-right font-medium text-gray-900">{formatNumber(order.prixVente)} TND</td>
                        <td className="px-2 py-2 text-right">
                          <span className="font-medium" style={{ color: order.marge >= 0 ? ACCENT_LIME_DARK : "#dc2626" }}>
                            {order.marge >= 0 ? "+" : ""}{formatNumber(order.marge)} TND
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper functions
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatNumber(value: number): string {
  return value.toLocaleString("fr-FR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
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
              <div className="flex items-center gap-0.5 mt-0.5 text-xs" style={{ color: trendUp ? ACCENT_LIME_DARK : "#dc2626" }}>
                {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              </div>
            )}
          </div>
          <div className="p-1.5 rounded-md ml-2" style={{ backgroundColor: `${ACCENT_LIME}15`, color: ACCENT_LIME_DARK }}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

