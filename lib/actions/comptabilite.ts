"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ========================
// DOCUMENTS
// ========================

export async function getDocuments() {
  return await prisma.document.findMany({
    orderBy: [{ annee: "desc" }, { createdAt: "desc" }],
  });
}

export async function getDocument(id: string) {
  return await prisma.document.findUnique({
    where: { id },
  });
}

export async function createDocument(data: {
  nom: string;
  description?: string;
  categorie: string;
  type: string;
  fichierUrl: string;
  fichierNom: string;
  taille?: number;
  annee: number;
  mois?: number;
  trimestre?: number;
  montant?: number;
  notes?: string;
}) {
  const document = await prisma.document.create({
    data: {
      nom: data.nom,
      description: data.description,
      categorie: data.categorie as any,
      type: data.type as any,
      fichierUrl: data.fichierUrl,
      fichierNom: data.fichierNom,
      taille: data.taille,
      annee: data.annee,
      mois: data.mois,
      trimestre: data.trimestre,
      montant: data.montant,
      notes: data.notes,
    },
  });
  revalidatePath("/comptabilite");
  return document;
}

export async function updateDocument(id: string, data: {
  nom?: string;
  description?: string;
  categorie?: string;
  type?: string;
  fichierUrl?: string;
  fichierNom?: string;
  taille?: number;
  annee?: number;
  mois?: number;
  trimestre?: number;
  montant?: number;
  notes?: string;
}) {
  const document = await prisma.document.update({
    where: { id },
    data: {
      nom: data.nom,
      description: data.description,
      categorie: data.categorie as any,
      type: data.type as any,
      fichierUrl: data.fichierUrl,
      fichierNom: data.fichierNom,
      taille: data.taille,
      annee: data.annee,
      mois: data.mois,
      trimestre: data.trimestre,
      montant: data.montant,
      notes: data.notes,
    },
  });
  revalidatePath("/comptabilite");
  return document;
}

export async function deleteDocument(id: string) {
  await prisma.document.delete({
    where: { id },
  });
  revalidatePath("/comptabilite");
}

// ========================
// DECLARATIONS FISCALES
// ========================

export async function getDeclarations() {
  return await prisma.declarationFiscale.findMany({
    orderBy: [{ annee: "desc" }, { dateEcheance: "asc" }],
  });
}

export async function getDeclaration(id: string) {
  return await prisma.declarationFiscale.findUnique({
    where: { id },
  });
}

async function generateDeclarationReference(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.declarationFiscale.count({
    where: {
      reference: { startsWith: `DEC-` },
      annee: year,
    },
  });
  const nextNumber = (count + 1).toString().padStart(4, "0");
  return `DEC-${nextNumber}-${year}`;
}

export async function createDeclaration(data: {
  type: string;
  periode: string;
  annee: number;
  mois?: number;
  trimestre?: number;
  dateEcheance: Date;
  dateDepot?: Date;
  montantDu: number;
  montantPaye?: number;
  statut?: string;
  penalites?: number;
  notes?: string;
  documentId?: string;
}) {
  const reference = await generateDeclarationReference();
  const declaration = await prisma.declarationFiscale.create({
    data: {
      reference,
      type: data.type as any,
      periode: data.periode as any,
      annee: data.annee,
      mois: data.mois,
      trimestre: data.trimestre,
      dateEcheance: data.dateEcheance,
      dateDepot: data.dateDepot,
      montantDu: data.montantDu,
      montantPaye: data.montantPaye,
      statut: (data.statut as any) || "A_DECLARER",
      penalites: data.penalites,
      notes: data.notes,
      documentId: data.documentId,
    },
  });
  revalidatePath("/comptabilite");
  return declaration;
}

export async function updateDeclaration(id: string, data: {
  type?: string;
  periode?: string;
  annee?: number;
  mois?: number;
  trimestre?: number;
  dateEcheance?: Date;
  dateDepot?: Date;
  montantDu?: number;
  montantPaye?: number;
  statut?: string;
  penalites?: number;
  notes?: string;
  documentId?: string;
}) {
  const declaration = await prisma.declarationFiscale.update({
    where: { id },
    data: {
      type: data.type as any,
      periode: data.periode as any,
      annee: data.annee,
      mois: data.mois,
      trimestre: data.trimestre,
      dateEcheance: data.dateEcheance,
      dateDepot: data.dateDepot,
      montantDu: data.montantDu,
      montantPaye: data.montantPaye,
      statut: data.statut as any,
      penalites: data.penalites,
      notes: data.notes,
      documentId: data.documentId,
    },
  });
  revalidatePath("/comptabilite");
  return declaration;
}

export async function updateDeclarationStatut(id: string, statut: string) {
  const declaration = await prisma.declarationFiscale.update({
    where: { id },
    data: { statut: statut as any },
  });
  revalidatePath("/comptabilite");
  return declaration;
}

export async function deleteDeclaration(id: string) {
  await prisma.declarationFiscale.delete({
    where: { id },
  });
  revalidatePath("/comptabilite");
}

// ========================
// CHARGES (EXPENSES)
// ========================

export async function getCharges() {
  return await prisma.charge.findMany({
    orderBy: [{ date: "desc" }],
  });
}

export async function createCharge(data: {
  reference: string;
  designation: string;
  categorie: string;
  montantHT: number;
  tva?: number;
  montantTTC: number;
  date: Date;
  fournisseur?: string;
  facture?: string;
  documentUrl?: string;
  notes?: string;
}) {
  const charge = await prisma.charge.create({
    data: {
      reference: data.reference,
      designation: data.designation,
      categorie: data.categorie as any,
      montantHT: data.montantHT,
      tva: data.tva || 0,
      montantTTC: data.montantTTC,
      date: data.date,
      fournisseur: data.fournisseur,
      facture: data.facture,
      documentUrl: data.documentUrl,
      notes: data.notes,
    },
  });
  revalidatePath("/comptabilite");
  return charge;
}

export async function updateCharge(id: string, data: {
  reference?: string;
  designation?: string;
  categorie?: string;
  montantHT?: number;
  tva?: number;
  montantTTC?: number;
  date?: Date;
  fournisseur?: string;
  facture?: string;
  documentUrl?: string;
  notes?: string;
}) {
  const charge = await prisma.charge.update({
    where: { id },
    data: {
      reference: data.reference,
      designation: data.designation,
      categorie: data.categorie as any,
      montantHT: data.montantHT,
      tva: data.tva,
      montantTTC: data.montantTTC,
      date: data.date,
      fournisseur: data.fournisseur,
      facture: data.facture,
      documentUrl: data.documentUrl,
      notes: data.notes,
    },
  });
  revalidatePath("/comptabilite");
  return charge;
}

export async function deleteCharge(id: string) {
  await prisma.charge.delete({
    where: { id },
  });
  revalidatePath("/comptabilite");
}

// ========================
// EXERCICES COMPTABLES
// ========================

export async function getExercices() {
  return await prisma.exerciceComptable.findMany({
    orderBy: { annee: "desc" },
  });
}

export async function createExercice(data: {
  annee: number;
  dateDebut: Date;
  dateFin: Date;
  statut?: string;
  notes?: string;
}) {
  const exercice = await prisma.exerciceComptable.create({
    data: {
      annee: data.annee,
      dateDebut: data.dateDebut,
      dateFin: data.dateFin,
      statut: (data.statut as any) || "EN_COURS",
      notes: data.notes,
    },
  });
  revalidatePath("/comptabilite");
  return exercice;
}

export async function updateExercice(id: string, data: {
  statut?: string;
  chiffreAffaires?: number;
  charges?: number;
  resultat?: number;
  notes?: string;
}) {
  const exercice = await prisma.exerciceComptable.update({
    where: { id },
    data: {
      statut: data.statut as any,
      chiffreAffaires: data.chiffreAffaires,
      charges: data.charges,
      resultat: data.resultat,
      notes: data.notes,
    },
  });
  revalidatePath("/comptabilite");
  return exercice;
}

// ========================
// STATISTICS
// ========================

export async function getComptabiliteStats() {
  const currentYear = new Date().getFullYear();
  const now = new Date();

  // Documents count
  const totalDocuments = await prisma.document.count();
  const documentsThisYear = await prisma.document.count({
    where: { annee: currentYear },
  });

  // Declarations stats
  const totalDeclarations = await prisma.declarationFiscale.count();
  const declarationsEnAttente = await prisma.declarationFiscale.count({
    where: { statut: { in: ["A_DECLARER", "EN_COURS"] } },
  });
  const declarationsEnRetard = await prisma.declarationFiscale.count({
    where: {
      statut: { in: ["A_DECLARER", "EN_COURS"] },
      dateEcheance: { lt: now },
    },
  });

  // Charges stats
  const chargesThisYear = await prisma.charge.aggregate({
    _sum: { montantTTC: true },
    where: {
      date: {
        gte: new Date(currentYear, 0, 1),
        lte: new Date(currentYear, 11, 31),
      },
    },
  });

  // Chiffre d'affaires from factures
  const caThisYear = await prisma.facture.aggregate({
    _sum: { total: true },
    where: {
      status: "PAID",
      date: {
        gte: new Date(currentYear, 0, 1),
        lte: new Date(currentYear, 11, 31),
      },
    },
  });

  // TVA calculations
  const tvaCollectee = (caThisYear._sum.total || 0) * 0.19; // 19% TVA
  const tvaDeductible = (chargesThisYear._sum.montantTTC || 0) * 0.19 / 1.19;
  const tvaDue = tvaCollectee - tvaDeductible;

  return {
    totalDocuments,
    documentsThisYear,
    totalDeclarations,
    declarationsEnAttente,
    declarationsEnRetard,
    totalCharges: chargesThisYear._sum.montantTTC || 0,
    chiffreAffaires: caThisYear._sum.total || 0,
    tvaCollectee,
    tvaDeductible,
    tvaDue: tvaDue > 0 ? tvaDue : 0,
    currentYear,
  };
}

