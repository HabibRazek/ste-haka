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

    // Summary sheet - Focus on Colis (Suivi des Colis)
    const summaryData = [
      ["📦 Gestion & Suivi des Colis - Résumé", ""],
      ["", ""],
      ["Indicateur", "Valeur"],
      ["Total Colis", stats.totalColis],
      ["CA Colis (TND)", stats.colisRevenue.toLocaleString("fr-FR", { minimumFractionDigits: 3 })],
      ["Marge Totale (TND)", stats.colisMarge.toLocaleString("fr-FR", { minimumFractionDigits: 3 })],
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
    wsSummary["!cols"] = [{ wch: 35 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, "Résumé");

    // Monthly Colis data sheet
    const colisHeaders = ["Mois", "Nombre de Colis", "Marge (TND)"];
    const colisRows = stats.monthlyColisData.map((m) => [
      m.month,
      m.colis,
      m.marge.toLocaleString("fr-FR", { minimumFractionDigits: 3 }),
    ]);
    const wsColis = XLSX.utils.aoa_to_sheet([colisHeaders, ...colisRows]);
    wsColis["!cols"] = [{ wch: 10 }, { wch: 20 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsColis, "Suivi Colis Mensuel");

    // Monthly revenue data sheet (optional)
    const monthlyHeaders = ["Mois", "Chiffre d'Affaires (TND)", "Charges (TND)", "Bénéfice (TND)"];
    const monthlyRows = stats.monthlyData.map((m) => [
      m.month,
      m.revenue.toLocaleString("fr-FR", { minimumFractionDigits: 3 }),
      m.expenses.toLocaleString("fr-FR", { minimumFractionDigits: 3 }),
      (m.revenue - m.expenses).toLocaleString("fr-FR", { minimumFractionDigits: 3 }),
    ]);
    const wsMonthly = XLSX.utils.aoa_to_sheet([monthlyHeaders, ...monthlyRows]);
    wsMonthly["!cols"] = [{ wch: 10 }, { wch: 25 }, { wch: 20 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsMonthly, "Comptabilité Mensuelle");

    // Generate filename with date
    const date = new Date();
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const filename = `Dashboard_STE_HAKA_${dateStr}.xlsx`;

    // Download
    XLSX.writeFile(wb, filename);
  };

  return <DashboardCharts stats={stats} onExportExcel={handleExportExcel} />;
}

