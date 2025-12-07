"use server";

import { prisma } from "@/lib/prisma";

export type MonthlyData = {
  month: string;
  revenue: number;
  expenses: number;
};

export type DashboardStats = {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  profitMargin: number;
  totalDevis: number;
  totalFactures: number;
  pendingDevis: number;
  pendingFactures: number;
  totalTasks: number;
  completedTasks: number;
  totalProducts: number;
  totalStock: number;
  monthlyData: MonthlyData[];
  revenueByCategory: { name: string; value: number }[];
  tasksByStatus: { name: string; value: number }[];
};

// Get monthly revenue and expenses for the current year
async function getMonthlyData(year: number): Promise<MonthlyData[]> {
  const months = [
    "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
    "Juil", "Août", "Sep", "Oct", "Nov", "Déc"
  ];

  const monthlyData: MonthlyData[] = [];

  for (let i = 0; i < 12; i++) {
    const startDate = new Date(year, i, 1);
    const endDate = new Date(year, i + 1, 0, 23, 59, 59);

    // Revenue from paid factures
    const revenueResult = await prisma.facture.aggregate({
      _sum: { total: true },
      where: {
        status: "PAID",
        date: { gte: startDate, lte: endDate },
      },
    });

    // Expenses from charges
    const expensesResult = await prisma.charge.aggregate({
      _sum: { montantTTC: true },
      where: {
        date: { gte: startDate, lte: endDate },
      },
    });

    monthlyData.push({
      month: months[i],
      revenue: Math.round((revenueResult._sum.total || 0) * 1000) / 1000,
      expenses: Math.round((expensesResult._sum.montantTTC || 0) * 1000) / 1000,
    });
  }

  return monthlyData;
}

// Get dashboard statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  const currentYear = new Date().getFullYear();
  const yearStart = new Date(currentYear, 0, 1);
  const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

  // Factures stats
  const factures = await prisma.facture.findMany({
    where: { date: { gte: yearStart, lte: yearEnd } },
  });
  const totalFactures = factures.length;
  const pendingFactures = factures.filter(f => f.status === "PENDING").length;
  const totalRevenue = factures.filter(f => f.status === "PAID").reduce((sum, f) => sum + f.total, 0);

  // Devis stats
  const devis = await prisma.invoice.findMany({
    where: { date: { gte: yearStart, lte: yearEnd } },
  });
  const totalDevis = devis.length;
  const pendingDevis = devis.filter(d => d.status === "PENDING").length;

  // Charges stats
  const chargesResult = await prisma.charge.aggregate({
    _sum: { montantTTC: true },
    where: { date: { gte: yearStart, lte: yearEnd } },
  });
  const totalExpenses = chargesResult._sum.montantTTC || 0;

  // Profit calculation
  const profit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? Math.round((profit / totalRevenue) * 100) : 0;

  // Tasks stats
  const tasks = await prisma.task.findMany();
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;

  // Products stats
  const products = await prisma.product.findMany();
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

  // Monthly data
  const monthlyData = await getMonthlyData(currentYear);

  // Revenue by category (from charges categories)
  const chargesByCategory = await prisma.charge.groupBy({
    by: ["categorie"],
    _sum: { montantTTC: true },
    where: { date: { gte: yearStart, lte: yearEnd } },
  });
  const revenueByCategory = chargesByCategory.map(c => ({
    name: c.categorie,
    value: Math.round((c._sum.montantTTC || 0) * 1000) / 1000,
  }));

  // Tasks by status
  const tasksByStatus = [
    { name: "Terminées", value: completedTasks },
    { name: "En cours", value: totalTasks - completedTasks },
  ];

  return {
    totalRevenue: Math.round(totalRevenue * 1000) / 1000,
    totalExpenses: Math.round(totalExpenses * 1000) / 1000,
    profit: Math.round(profit * 1000) / 1000,
    profitMargin,
    totalDevis,
    totalFactures,
    pendingDevis,
    pendingFactures,
    totalTasks,
    completedTasks,
    totalProducts,
    totalStock,
    monthlyData,
    revenueByCategory,
    tasksByStatus,
  };
}

// Export data for Excel
export async function getExportData() {
  const stats = await getDashboardStats();
  return {
    summary: {
      "Chiffre d'Affaires": stats.totalRevenue,
      "Charges": stats.totalExpenses,
      "Bénéfice": stats.profit,
      "Marge (%)": stats.profitMargin,
      "Total Devis": stats.totalDevis,
      "Total Factures": stats.totalFactures,
      "Devis en attente": stats.pendingDevis,
      "Factures en attente": stats.pendingFactures,
    },
    monthlyData: stats.monthlyData,
    chargesByCategory: stats.revenueByCategory,
  };
}

