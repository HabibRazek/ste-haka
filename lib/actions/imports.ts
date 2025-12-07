"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ImportStatus } from "@prisma/client";

// Types
export type ImportContactFormData = {
  nom: string;
  entreprise?: string;
  pays?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  notes?: string;
};

export type ImportProcedureFormData = {
  description: string;
  fournisseur: string;
  pays?: string;
  dateCommande?: string;
  dateExpedition?: string;
  dateArrivee?: string;
  statut?: ImportStatus;
  montant?: number;
  devise?: string;
  documents?: string;
  notes?: string;
};

// Generate reference number for procedures
async function generateReference(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);

  const count = await prisma.importProcedure.count({
    where: {
      createdAt: {
        gte: startOfYear,
        lt: endOfYear,
      },
    },
  });

  const nextNumber = String(count + 1).padStart(4, "0");
  return `IMP-${nextNumber}-${year}`;
}

// ============ CONTACTS ============

export async function getImportContacts() {
  try {
    const contacts = await prisma.importContact.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: contacts };
  } catch (error) {
    console.error("Error fetching import contacts:", error);
    return { success: false, error: "Échec de la récupération des contacts" };
  }
}

export async function createImportContact(data: ImportContactFormData) {
  try {
    const contact = await prisma.importContact.create({
      data: {
        nom: data.nom,
        entreprise: data.entreprise || null,
        pays: data.pays || null,
        telephone: data.telephone || null,
        email: data.email || null,
        adresse: data.adresse || null,
        notes: data.notes || null,
      },
    });
    revalidatePath("/importation");
    return { success: true, data: contact };
  } catch (error) {
    console.error("Error creating import contact:", error);
    return { success: false, error: "Échec de la création du contact" };
  }
}

export async function updateImportContact(id: string, data: ImportContactFormData) {
  try {
    const contact = await prisma.importContact.update({
      where: { id },
      data: {
        nom: data.nom,
        entreprise: data.entreprise || null,
        pays: data.pays || null,
        telephone: data.telephone || null,
        email: data.email || null,
        adresse: data.adresse || null,
        notes: data.notes || null,
      },
    });
    revalidatePath("/importation");
    return { success: true, data: contact };
  } catch (error) {
    console.error("Error updating import contact:", error);
    return { success: false, error: "Échec de la mise à jour du contact" };
  }
}

export async function deleteImportContact(id: string) {
  try {
    await prisma.importContact.delete({ where: { id } });
    revalidatePath("/importation");
    return { success: true };
  } catch (error) {
    console.error("Error deleting import contact:", error);
    return { success: false, error: "Échec de la suppression du contact" };
  }
}

// ============ PROCEDURES ============

export async function getImportProcedures() {
  try {
    const procedures = await prisma.importProcedure.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: procedures };
  } catch (error) {
    console.error("Error fetching import procedures:", error);
    return { success: false, error: "Échec de la récupération des procédures" };
  }
}

export async function createImportProcedure(data: ImportProcedureFormData) {
  try {
    const reference = await generateReference();
    const procedure = await prisma.importProcedure.create({
      data: {
        reference,
        description: data.description,
        fournisseur: data.fournisseur,
        pays: data.pays || null,
        dateCommande: data.dateCommande ? new Date(data.dateCommande) : null,
        dateExpedition: data.dateExpedition ? new Date(data.dateExpedition) : null,
        dateArrivee: data.dateArrivee ? new Date(data.dateArrivee) : null,
        statut: data.statut || "EN_COURS",
        montant: data.montant || null,
        devise: data.devise || "EUR",
        documents: data.documents || null,
        notes: data.notes || null,
      },
    });
    revalidatePath("/importation");
    return { success: true, data: procedure };
  } catch (error) {
    console.error("Error creating import procedure:", error);
    return { success: false, error: "Échec de la création de la procédure" };
  }
}

export async function updateImportProcedure(id: string, data: ImportProcedureFormData) {
  try {
    const procedure = await prisma.importProcedure.update({
      where: { id },
      data: {
        description: data.description,
        fournisseur: data.fournisseur,
        pays: data.pays || null,
        dateCommande: data.dateCommande ? new Date(data.dateCommande) : null,
        dateExpedition: data.dateExpedition ? new Date(data.dateExpedition) : null,
        dateArrivee: data.dateArrivee ? new Date(data.dateArrivee) : null,
        statut: data.statut || "EN_COURS",
        montant: data.montant || null,
        devise: data.devise || "EUR",
        documents: data.documents || null,
        notes: data.notes || null,
      },
    });
    revalidatePath("/importation");
    return { success: true, data: procedure };
  } catch (error) {
    console.error("Error updating import procedure:", error);
    return { success: false, error: "Échec de la mise à jour de la procédure" };
  }
}

export async function deleteImportProcedure(id: string) {
  try {
    await prisma.importProcedure.delete({ where: { id } });
    revalidatePath("/importation");
    return { success: true };
  } catch (error) {
    console.error("Error deleting import procedure:", error);
    return { success: false, error: "Échec de la suppression de la procédure" };
  }
}

export async function updateImportProcedureStatus(id: string, statut: ImportStatus) {
  try {
    const procedure = await prisma.importProcedure.update({
      where: { id },
      data: { statut },
    });
    revalidatePath("/importation");
    return { success: true, data: procedure };
  } catch (error) {
    console.error("Error updating procedure status:", error);
    return { success: false, error: "Échec de la mise à jour du statut" };
  }
}

export async function getImportStats() {
  try {
    const [totalContacts, totalProcedures, enCours, expedie, enDouane, livre] = await Promise.all([
      prisma.importContact.count(),
      prisma.importProcedure.count(),
      prisma.importProcedure.count({ where: { statut: "EN_COURS" } }),
      prisma.importProcedure.count({ where: { statut: "EXPEDIE" } }),
      prisma.importProcedure.count({ where: { statut: "EN_DOUANE" } }),
      prisma.importProcedure.count({ where: { statut: "LIVRE" } }),
    ]);

    return {
      success: true,
      data: {
        totalContacts,
        totalProcedures,
        enCours,
        expedie,
        enDouane,
        livre,
      },
    };
  } catch (error) {
    console.error("Error fetching import stats:", error);
    return { success: false, error: "Échec de la récupération des statistiques" };
  }
}

