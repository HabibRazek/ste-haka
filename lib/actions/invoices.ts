"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type InvoiceItemInput = {
  designation: string;
  quantite: number;
  prixUnit: number;
};

export type InvoiceFormData = {
  clientName: string;
  clientTel?: string;
  clientEmail?: string;
  clientAddress?: string;
  items: InvoiceItemInput[];
  timbre?: number;
};

export type InvoiceWithItems = {
  id: string;
  numero: string;
  date: Date;
  clientName: string;
  clientTel: string | null;
  clientEmail: string | null;
  clientAddress: string | null;
  sousTotal: number;
  timbre: number;
  total: number;
  status: "PENDING" | "PAID" | "CANCELLED";
  items: {
    id: string;
    designation: string;
    quantite: number;
    prixUnit: number;
    total: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
};

// Generate invoice number: YYYYMMDDHHMMSS
function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Get all invoices
export async function getInvoices() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: invoices as InvoiceWithItems[] };
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return { success: false, error: "Erreur lors de la récupération des devis" };
  }
}

// Get single invoice by ID
export async function getInvoice(id: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!invoice) {
      return { success: false, error: "Devis non trouvé" };
    }
    return { success: true, data: invoice as InvoiceWithItems };
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return { success: false, error: "Erreur lors de la récupération du devis" };
  }
}

// Create invoice
export async function createInvoice(data: InvoiceFormData) {
  try {
    const timbre = data.timbre || 0;
    const items = data.items.map((item) => ({
      designation: item.designation,
      quantite: item.quantite,
      prixUnit: item.prixUnit,
      total: item.quantite * item.prixUnit,
    }));
    const sousTotal = items.reduce((sum, item) => sum + item.total, 0);
    const total = sousTotal + timbre;

    const invoice = await prisma.invoice.create({
      data: {
        numero: generateInvoiceNumber(),
        clientName: data.clientName,
        clientTel: data.clientTel || null,
        clientEmail: data.clientEmail || null,
        clientAddress: data.clientAddress || null,
        sousTotal,
        timbre,
        total,
        items: { create: items },
      },
      include: { items: true },
    });

    revalidatePath("/devis");
    return { success: true, data: invoice };
  } catch (error) {
    console.error("Error creating invoice:", error);
    return { success: false, error: "Erreur lors de la création du devis" };
  }
}

// Update invoice
export async function updateInvoice(id: string, data: InvoiceFormData) {
  try {
    const timbre = data.timbre || 0;
    const items = data.items.map((item) => ({
      designation: item.designation,
      quantite: item.quantite,
      prixUnit: item.prixUnit,
      total: item.quantite * item.prixUnit,
    }));
    const sousTotal = items.reduce((sum, item) => sum + item.total, 0);
    const total = sousTotal + timbre;

    // Delete existing items and create new ones
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        clientName: data.clientName,
        clientTel: data.clientTel || null,
        clientEmail: data.clientEmail || null,
        clientAddress: data.clientAddress || null,
        sousTotal,
        timbre,
        total,
        items: { create: items },
      },
      include: { items: true },
    });

    revalidatePath("/devis");
    return { success: true, data: invoice };
  } catch (error) {
    console.error("Error updating invoice:", error);
    return { success: false, error: "Erreur lors de la mise à jour du devis" };
  }
}

// Delete invoice
export async function deleteInvoice(id: string) {
  try {
    await prisma.invoice.delete({ where: { id } });
    revalidatePath("/devis");
    return { success: true };
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return { success: false, error: "Erreur lors de la suppression du devis" };
  }
}

// Update invoice status
export async function updateInvoiceStatus(id: string, status: "PENDING" | "PAID" | "CANCELLED") {
  try {
    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
    revalidatePath("/devis");
    return { success: true, data: invoice };
  } catch (error) {
    console.error("Error updating invoice status:", error);
    return { success: false, error: "Erreur lors de la mise à jour du statut" };
  }
}

// Get invoice statistics
export async function getInvoiceStats() {
  try {
    const invoices = await prisma.invoice.findMany();
    const totalInvoices = invoices.length;
    const totalRevenue = invoices.filter((i) => i.status === "PAID").reduce((sum, i) => sum + i.total, 0);
    const pendingAmount = invoices.filter((i) => i.status === "PENDING").reduce((sum, i) => sum + i.total, 0);
    const paidCount = invoices.filter((i) => i.status === "PAID").length;

    return {
      success: true,
      data: {
        totalInvoices,
        totalRevenue: Math.round(totalRevenue * 1000) / 1000,
        pendingAmount: Math.round(pendingAmount * 1000) / 1000,
        paidCount,
      },
    };
  } catch (error) {
    console.error("Error fetching invoice stats:", error);
    return { success: false, error: "Erreur lors de la récupération des statistiques" };
  }
}

