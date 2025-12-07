"use client";

import { DashboardCharts } from "@/components/dashboard-charts";
import type { DashboardStats } from "@/lib/actions/dashboard";
import * as XLSX from "xlsx";

interface DashboardWrapperProps {
  stats: DashboardStats;
}

export function DashboardWrapper({ stats }: DashboardWrapperProps) {
  const handleExportExcel = () => {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ["Tableau de Bord - Résumé", ""],
      ["", ""],
      ["Indicateur", "Valeur"],
      ["Chiffre d'Affaires (TND)", stats.totalRevenue.toLocaleString("fr-FR", { minimumFractionDigits: 3 })],
      ["Charges (TND)", stats.totalExpenses.toLocaleString("fr-FR", { minimumFractionDigits: 3 })],
      ["Bénéfice (TND)", stats.profit.toLocaleString("fr-FR", { minimumFractionDigits: 3 })],
      ["Marge (%)", `${stats.profitMargin}%`],
      ["", ""],
      ["Total Devis", stats.totalDevis],
      ["Devis en attente", stats.pendingDevis],
      ["Total Factures", stats.totalFactures],
      ["Factures en attente", stats.pendingFactures],
      ["", ""],
      ["Total Tâches", stats.totalTasks],
      ["Tâches Terminées", stats.completedTasks],
      ["Total Produits", stats.totalProducts],
      ["Stock Total", stats.totalStock],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary["!cols"] = [{ wch: 25 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, "Résumé");

    // Monthly data sheet
    const monthlyHeaders = ["Mois", "Chiffre d'Affaires (TND)", "Charges (TND)", "Bénéfice (TND)"];
    const monthlyRows = stats.monthlyData.map((m) => [
      m.month,
      m.revenue.toLocaleString("fr-FR", { minimumFractionDigits: 3 }),
      m.expenses.toLocaleString("fr-FR", { minimumFractionDigits: 3 }),
      (m.revenue - m.expenses).toLocaleString("fr-FR", { minimumFractionDigits: 3 }),
    ]);
    const wsMonthly = XLSX.utils.aoa_to_sheet([monthlyHeaders, ...monthlyRows]);
    wsMonthly["!cols"] = [{ wch: 10 }, { wch: 25 }, { wch: 20 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsMonthly, "Données Mensuelles");

    // Charges by category sheet
    if (stats.revenueByCategory.length > 0) {
      const categoryHeaders = ["Catégorie", "Montant (TND)"];
      const categoryRows = stats.revenueByCategory.map((c) => [
        c.name,
        c.value.toLocaleString("fr-FR", { minimumFractionDigits: 3 }),
      ]);
      const wsCategory = XLSX.utils.aoa_to_sheet([categoryHeaders, ...categoryRows]);
      wsCategory["!cols"] = [{ wch: 25 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsCategory, "Charges par Catégorie");
    }

    // Generate filename with date
    const date = new Date();
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const filename = `Dashboard_STE_HAKA_${dateStr}.xlsx`;

    // Download
    XLSX.writeFile(wb, filename);
  };

  return <DashboardCharts stats={stats} onExportExcel={handleExportExcel} />;
}

