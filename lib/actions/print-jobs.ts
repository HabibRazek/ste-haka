"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type PrintJobFormData = {
  client: string;
  description?: string;
  largeur: number; // cm
  hauteur: number; // cm
  quantite: number;
  prixUnitaire?: number; // TND per m²
};

export type PrintJobWithCalculations = {
  id: string;
  client: string;
  description: string | null;
  largeur: number;
  hauteur: number;
  quantite: number;
  surfaceUnitM2: number;
  surfaceTotalM2: number;
  prixUnitaire: number;
  prixTotal: number;
  createdAt: Date;
  updatedAt: Date;
};

const PRIX_PAR_M2 = 24; // 24 TND per m²

// Calculate surface and price
function calculatePrintJob(largeur: number, hauteur: number, quantite: number, prixUnitaire: number = PRIX_PAR_M2) {
  // Convert cm to m and calculate surface
  const surfaceUnitM2 = (largeur / 100) * (hauteur / 100);
  const surfaceTotalM2 = surfaceUnitM2 * quantite;
  const prixTotal = surfaceTotalM2 * prixUnitaire;
  
  return {
    surfaceUnitM2: Math.round(surfaceUnitM2 * 10000) / 10000, // 4 decimals
    surfaceTotalM2: Math.round(surfaceTotalM2 * 10000) / 10000,
    prixTotal: Math.round(prixTotal * 100) / 100, // 2 decimals
  };
}

// Get all print jobs
export async function getPrintJobs() {
  try {
    const printJobs = await prisma.printJob.findMany({
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: printJobs };
  } catch (error) {
    console.error("Error fetching print jobs:", error);
    return { success: false, error: "Erreur lors de la récupération des travaux d'impression" };
  }
}

// Create a new print job
export async function createPrintJob(data: PrintJobFormData) {
  try {
    const prixUnitaire = data.prixUnitaire || PRIX_PAR_M2;
    const calculations = calculatePrintJob(data.largeur, data.hauteur, data.quantite, prixUnitaire);

    const printJob = await prisma.printJob.create({
      data: {
        client: data.client,
        description: data.description || null,
        largeur: data.largeur,
        hauteur: data.hauteur,
        quantite: data.quantite,
        prixUnitaire,
        ...calculations,
      },
    });

    revalidatePath("/impression");
    return { success: true, data: printJob };
  } catch (error) {
    console.error("Error creating print job:", error);
    return { success: false, error: "Erreur lors de la création du travail d'impression" };
  }
}

// Update a print job
export async function updatePrintJob(id: string, data: PrintJobFormData) {
  try {
    const prixUnitaire = data.prixUnitaire || PRIX_PAR_M2;
    const calculations = calculatePrintJob(data.largeur, data.hauteur, data.quantite, prixUnitaire);

    const printJob = await prisma.printJob.update({
      where: { id },
      data: {
        client: data.client,
        description: data.description || null,
        largeur: data.largeur,
        hauteur: data.hauteur,
        quantite: data.quantite,
        prixUnitaire,
        ...calculations,
      },
    });

    revalidatePath("/impression");
    return { success: true, data: printJob };
  } catch (error) {
    console.error("Error updating print job:", error);
    return { success: false, error: "Erreur lors de la mise à jour du travail d'impression" };
  }
}

// Delete a print job
export async function deletePrintJob(id: string) {
  try {
    await prisma.printJob.delete({
      where: { id },
    });

    revalidatePath("/impression");
    return { success: true };
  } catch (error) {
    console.error("Error deleting print job:", error);
    return { success: false, error: "Erreur lors de la suppression du travail d'impression" };
  }
}

// Get statistics
export async function getPrintJobStats() {
  try {
    const printJobs = await prisma.printJob.findMany();
    
    const totalJobs = printJobs.length;
    const totalSurfaceM2 = printJobs.reduce((sum, job) => sum + job.surfaceTotalM2, 0);
    const totalRevenue = printJobs.reduce((sum, job) => sum + job.prixTotal, 0);
    const totalEtiquettes = printJobs.reduce((sum, job) => sum + job.quantite, 0);

    return {
      success: true,
      data: {
        totalJobs,
        totalSurfaceM2: Math.round(totalSurfaceM2 * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalEtiquettes,
      },
    };
  } catch (error) {
    console.error("Error fetching print job stats:", error);
    return { success: false, error: "Erreur lors de la récupération des statistiques" };
  }
}

