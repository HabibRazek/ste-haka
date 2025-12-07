"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type FactureItemInput = {
  designation: string;
  quantite: number;
  prixUnit: number;
};

export type FactureFormData = {
  clientName: string;
  clientTel?: string;
  clientEmail?: string;
  clientAddress?: string;
  clientMatriculeFiscale?: string;
  items: FactureItemInput[];
  timbre?: number;
};

export type FactureWithItems = {
  id: string;
  numero: string;
  date: Date;
  clientName: string;
  clientTel: string | null;
  clientEmail: string | null;
  clientAddress: string | null;
  clientMatriculeFiscale: string | null;
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

// Generate facture number: 0001-2025 format
async function generateFactureNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();

  // Get count of factures this year to generate next number
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);

  const count = await prisma.facture.count({
    where: {
      createdAt: {
        gte: startOfYear,
        lt: endOfYear,
      },
    },
  });

  const nextNumber = String(count + 1).padStart(4, "0");
  return `${nextNumber}-${year}`;
}

// Get all factures
export async function getFactures() {
  try {
    const factures = await prisma.facture.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: factures as FactureWithItems[] };
  } catch (error) {
    console.error("Error fetching factures:", error);
    return { success: false, error: "Erreur lors de la récupération des factures" };
  }
}

// Get single facture by ID
export async function getFacture(id: string) {
  try {
    const facture = await prisma.facture.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!facture) {
      return { success: false, error: "Facture non trouvée" };
    }
    return { success: true, data: facture as FactureWithItems };
  } catch (error) {
    console.error("Error fetching facture:", error);
    return { success: false, error: "Erreur lors de la récupération de la facture" };
  }
}

// Create facture
export async function createFacture(data: FactureFormData) {
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

    const numero = await generateFactureNumber();

    const facture = await prisma.facture.create({
      data: {
        numero,
        clientName: data.clientName,
        clientTel: data.clientTel || null,
        clientEmail: data.clientEmail || null,
        clientAddress: data.clientAddress || null,
        clientMatriculeFiscale: data.clientMatriculeFiscale || null,
        sousTotal,
        timbre,
        total,
        items: { create: items },
      },
      include: { items: true },
    });

    revalidatePath("/factures");
    return { success: true, data: facture };
  } catch (error) {
    console.error("Error creating facture:", error);
    return { success: false, error: "Erreur lors de la création de la facture" };
  }
}

// Update facture
export async function updateFacture(id: string, data: FactureFormData) {
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

    await prisma.factureItem.deleteMany({ where: { factureId: id } });

    const facture = await prisma.facture.update({
      where: { id },
      data: {
        clientName: data.clientName,
        clientTel: data.clientTel || null,
        clientEmail: data.clientEmail || null,
        clientAddress: data.clientAddress || null,
        clientMatriculeFiscale: data.clientMatriculeFiscale || null,
        sousTotal,
        timbre,
        total,
        items: { create: items },
      },
      include: { items: true },
    });

    revalidatePath("/factures");
    return { success: true, data: facture };
  } catch (error) {
    console.error("Error updating facture:", error);
    return { success: false, error: "Erreur lors de la mise à jour de la facture" };
  }
}

// Delete facture
export async function deleteFacture(id: string) {
  try {
    await prisma.facture.delete({ where: { id } });
    revalidatePath("/factures");
    return { success: true };
  } catch (error) {
    console.error("Error deleting facture:", error);
    return { success: false, error: "Erreur lors de la suppression de la facture" };
  }
}

// Update facture status
export async function updateFactureStatus(id: string, status: "PENDING" | "PAID" | "CANCELLED") {
  try {
    const facture = await prisma.facture.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
    revalidatePath("/factures");
    return { success: true, data: facture };
  } catch (error) {
    console.error("Error updating facture status:", error);
    return { success: false, error: "Erreur lors de la mise à jour du statut" };
  }
}

// Get facture statistics
export async function getFactureStats() {
  try {
    const factures = await prisma.facture.findMany();
    const totalFactures = factures.length;
    const totalRevenue = factures.filter((f) => f.status === "PAID").reduce((sum, f) => sum + f.total, 0);
    const pendingAmount = factures.filter((f) => f.status === "PENDING").reduce((sum, f) => sum + f.total, 0);
    const paidCount = factures.filter((f) => f.status === "PAID").length;

    return {
      success: true,
      data: {
        totalFactures,
        totalRevenue: Math.round(totalRevenue * 1000) / 1000,
        pendingAmount: Math.round(pendingAmount * 1000) / 1000,
        paidCount,
      },
    };
  } catch (error) {
    console.error("Error fetching facture stats:", error);
    return { success: false, error: "Erreur lors de la récupération des statistiques" };
  }
}

