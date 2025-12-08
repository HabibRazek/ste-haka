"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UploadButton } from "@/lib/uploadthing-components";
import {
  Plus, Search, FileText, Calculator, Calendar, TrendingUp,
  Download, Pencil, Trash2, MoreHorizontal, FolderOpen, AlertTriangle,
  CheckCircle, Clock, Eye, Upload, Building2, Receipt, Wallet, BarChart3
} from "lucide-react";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { 
  createDocument, updateDocument, deleteDocument,
  createDeclaration, updateDeclaration, deleteDeclaration, updateDeclarationStatut,
  createCharge, updateCharge, deleteCharge,
  createExercice, updateExercice
} from "@/lib/actions/comptabilite";

// Types
type Document = {
  id: string;
  nom: string;
  description: string | null;
  categorie: string;
  type: string;
  fichierUrl: string;
  fichierNom: string;
  taille: number | null;
  annee: number;
  mois: number | null;
  trimestre: number | null;
  montant: number | null;
  notes: string | null;
  createdAt: Date;
};

type Declaration = {
  id: string;
  reference: string;
  type: string;
  periode: string;
  annee: number;
  mois: number | null;
  trimestre: number | null;
  dateEcheance: Date;
  dateDepot: Date | null;
  montantDu: number;
  montantPaye: number | null;
  statut: string;
  penalites: number | null;
  notes: string | null;
  documentId: string | null;
};

type Charge = {
  id: string;
  reference: string;
  designation: string;
  categorie: string;
  montantHT: number;
  tva: number;
  montantTTC: number;
  date: Date;
  fournisseur: string | null;
  facture: string | null;
  documentUrl: string | null;
  notes: string | null;
};

type Exercice = {
  id: string;
  annee: number;
  dateDebut: Date;
  dateFin: Date;
  statut: string;
  chiffreAffaires: number | null;
  charges: number | null;
  resultat: number | null;
  notes: string | null;
};

type Stats = {
  totalDocuments: number;
  documentsThisYear: number;
  totalDeclarations: number;
  declarationsEnAttente: number;
  declarationsEnRetard: number;
  totalCharges: number;
  chiffreAffaires: number;
  tvaCollectee: number;
  tvaDeductible: number;
  tvaDue: number;
  currentYear: number;
};

type Props = {
  documents: Document[];
  declarations: Declaration[];
  charges: Charge[];
  exercices: Exercice[];
  stats: Stats;
};

// Constants
const DOCUMENT_CATEGORIES = [
  { value: "JURIDIQUE", label: "📜 Juridique" },
  { value: "FISCAL", label: "🏛️ Fiscal" },
  { value: "SOCIAL", label: "👥 Social" },
  { value: "BANCAIRE", label: "🏦 Bancaire" },
  { value: "FACTURES_FOURNISSEURS", label: "📥 Factures Fournisseurs" },
  { value: "FACTURES_CLIENTS", label: "📤 Factures Clients" },
  { value: "CONTRATS", label: "📝 Contrats" },
  { value: "AUTRES", label: "📁 Autres" },
];

const DOCUMENT_TYPES: Record<string, { value: string; label: string }[]> = {
  JURIDIQUE: [
    { value: "STATUTS", label: "Statuts" },
    { value: "REGISTRE_COMMERCE", label: "Registre de Commerce" },
    { value: "CARTE_IDENTIFICATION_FISCALE", label: "Carte d'Identification Fiscale" },
    { value: "PATENTE", label: "Patente" },
    { value: "PROCES_VERBAL", label: "Procès-Verbal" },
  ],
  FISCAL: [
    { value: "DECLARATION_TVA", label: "Déclaration TVA" },
    { value: "DECLARATION_IS", label: "Déclaration IS" },
    { value: "DECLARATION_IRPP", label: "Déclaration IRPP" },
    { value: "DECLARATION_ACOMPTE", label: "Déclaration Acompte" },
    { value: "ATTESTATION_FISCALE", label: "Attestation Fiscale" },
    { value: "QUITUS_FISCAL", label: "Quitus Fiscal" },
  ],
  SOCIAL: [
    { value: "DECLARATION_CNSS", label: "Déclaration CNSS" },
    { value: "ATTESTATION_CNSS", label: "Attestation CNSS" },
    { value: "CONTRAT_ASSURANCE", label: "Contrat Assurance" },
  ],
  BANCAIRE: [
    { value: "RELEVE_BANCAIRE", label: "Relevé Bancaire" },
    { value: "RIB", label: "RIB" },
    { value: "ATTESTATION_BANCAIRE", label: "Attestation Bancaire" },
  ],
  FACTURES_FOURNISSEURS: [{ value: "FACTURE_FOURNISSEUR", label: "Facture Fournisseur" }],
  FACTURES_CLIENTS: [{ value: "FACTURE_CLIENT", label: "Facture Client" }],
  CONTRATS: [{ value: "CONTRAT", label: "Contrat" }],
  AUTRES: [
    { value: "BON_COMMANDE", label: "Bon de Commande" },
    { value: "BON_LIVRAISON", label: "Bon de Livraison" },
    { value: "BILAN", label: "Bilan" },
    { value: "COMPTE_RESULTAT", label: "Compte de Résultat" },
    { value: "BALANCE", label: "Balance" },
    { value: "GRAND_LIVRE", label: "Grand Livre" },
    { value: "JOURNAL", label: "Journal" },
    { value: "AUTRE", label: "Autre" },
  ],
};

const DECLARATION_TYPES = [
  { value: "TVA", label: "TVA" },
  { value: "ACOMPTE_IS", label: "Acompte IS" },
  { value: "IS_ANNUEL", label: "IS Annuel" },
  { value: "IRPP", label: "IRPP" },
  { value: "RETENUE_SOURCE", label: "Retenue à la Source" },
  { value: "TCL", label: "TCL" },
  { value: "DROIT_TIMBRE", label: "Droit de Timbre" },
  { value: "CNSS", label: "CNSS" },
  { value: "DECLARATION_EMPLOYEUR", label: "Déclaration Employeur" },
];

const DECLARATION_PERIODES = [
  { value: "MENSUELLE", label: "Mensuelle" },
  { value: "TRIMESTRIELLE", label: "Trimestrielle" },
  { value: "ANNUELLE", label: "Annuelle" },
];

const DECLARATION_STATUTS = [
  { value: "A_DECLARER", label: "À Déclarer", color: "bg-gray-100 text-gray-800" },
  { value: "EN_COURS", label: "En Cours", color: "bg-blue-100 text-blue-800" },
  { value: "DECLAREE", label: "Déclarée", color: "bg-yellow-100 text-yellow-800" },
  { value: "PAYEE", label: "Payée", color: "bg-green-100 text-green-800" },
  { value: "EN_RETARD", label: "En Retard", color: "bg-red-100 text-red-800" },
  { value: "ANNULEE", label: "Annulée", color: "bg-gray-100 text-gray-500" },
];

const CHARGE_CATEGORIES = [
  { value: "ACHATS_MARCHANDISES", label: "Achats Marchandises" },
  { value: "SERVICES_EXTERIEURS", label: "Services Extérieurs" },
  { value: "LOYER", label: "Loyer" },
  { value: "ELECTRICITE_EAU", label: "Électricité & Eau" },
  { value: "TELEPHONE_INTERNET", label: "Téléphone & Internet" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "ASSURANCES", label: "Assurances" },
  { value: "ENTRETIEN_REPARATIONS", label: "Entretien & Réparations" },
  { value: "FOURNITURES_BUREAU", label: "Fournitures Bureau" },
  { value: "PUBLICITE", label: "Publicité" },
  { value: "FRAIS_BANCAIRES", label: "Frais Bancaires" },
  { value: "IMPOTS_TAXES", label: "Impôts & Taxes" },
  { value: "SALAIRES", label: "Salaires" },
  { value: "CHARGES_SOCIALES", label: "Charges Sociales" },
  { value: "AMORTISSEMENTS", label: "Amortissements" },
  { value: "AUTRES", label: "Autres" },
];

const MONTHS = [
  { value: 1, label: "Janvier" }, { value: 2, label: "Février" },
  { value: 3, label: "Mars" }, { value: 4, label: "Avril" },
  { value: 5, label: "Mai" }, { value: 6, label: "Juin" },
  { value: 7, label: "Juillet" }, { value: 8, label: "Août" },
  { value: 9, label: "Septembre" }, { value: 10, label: "Octobre" },
  { value: 11, label: "Novembre" }, { value: 12, label: "Décembre" },
];

// Helper functions
const formatNumber = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const formatDate = (d: Date) => new Date(d).toLocaleDateString("fr-FR");
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

export function ComptabiliteList({ documents, declarations, charges, exercices, stats }: Props) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "documents" | "declarations" | "charges" | "exercices">("dashboard");
  const [searchTerm, setSearchTerm] = useState("");

  // Document form state
  const [isDocFormOpen, setIsDocFormOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [docForm, setDocForm] = useState({
    nom: "", description: "", categorie: "JURIDIQUE", type: "STATUTS",
    fichierUrl: "", fichierNom: "", taille: 0, annee: new Date().getFullYear(),
    mois: undefined as number | undefined, trimestre: undefined as number | undefined,
    montant: undefined as number | undefined, notes: ""
  });

  // Declaration form state
  const [isDeclFormOpen, setIsDeclFormOpen] = useState(false);
  const [editingDecl, setEditingDecl] = useState<Declaration | null>(null);
  const [declForm, setDeclForm] = useState({
    type: "TVA", periode: "MENSUELLE", annee: new Date().getFullYear(),
    mois: new Date().getMonth() + 1 as number | undefined, trimestre: undefined as number | undefined,
    dateEcheance: "", montantDu: 0, montantPaye: undefined as number | undefined,
    statut: "A_DECLARER", notes: ""
  });

  // Charge form state
  const [isChargeFormOpen, setIsChargeFormOpen] = useState(false);
  const [editingCharge, setEditingCharge] = useState<Charge | null>(null);
  const [chargeForm, setChargeForm] = useState({
    reference: "", designation: "", categorie: "ACHATS_MARCHANDISES",
    montantHT: 0, tva: 0, montantTTC: 0, date: new Date().toISOString().split("T")[0],
    fournisseur: "", facture: "", documentUrl: "", notes: ""
  });

  // Delete confirmation state
  const [deleteDocDialogOpen, setDeleteDocDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [deleteDeclDialogOpen, setDeleteDeclDialogOpen] = useState(false);
  const [declToDelete, setDeclToDelete] = useState<Declaration | null>(null);
  const [deleteChargeDialogOpen, setDeleteChargeDialogOpen] = useState(false);
  const [chargeToDelete, setChargeToDelete] = useState<Charge | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handlers
  const resetDocForm = () => {
    setDocForm({
      nom: "", description: "", categorie: "JURIDIQUE", type: "STATUTS",
      fichierUrl: "", fichierNom: "", taille: 0, annee: new Date().getFullYear(),
      mois: undefined, trimestre: undefined, montant: undefined, notes: ""
    });
    setEditingDoc(null);
  };

  const openEditDocForm = (doc: Document) => {
    setEditingDoc(doc);
    setDocForm({
      nom: doc.nom, description: doc.description || "", categorie: doc.categorie,
      type: doc.type, fichierUrl: doc.fichierUrl, fichierNom: doc.fichierNom,
      taille: doc.taille || 0, annee: doc.annee, mois: doc.mois || undefined,
      trimestre: doc.trimestre || undefined, montant: doc.montant || undefined,
      notes: doc.notes || ""
    });
    setIsDocFormOpen(true);
  };

  const handleDocSubmit = async () => {
    if (!docForm.nom || !docForm.fichierUrl) return;
    if (editingDoc) {
      await updateDocument(editingDoc.id, docForm);
    } else {
      await createDocument(docForm);
    }
    setIsDocFormOpen(false);
    resetDocForm();
  };

  const openDeleteDocDialog = (doc: Document) => {
    setDocToDelete(doc);
    setDeleteDocDialogOpen(true);
  };

  const handleDeleteDoc = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDocument(docToDelete.id);
    } finally {
      setIsDeleting(false);
      setDocToDelete(null);
    }
  };

  // Declaration handlers
  const resetDeclForm = () => {
    setDeclForm({
      type: "TVA", periode: "MENSUELLE", annee: new Date().getFullYear(),
      mois: new Date().getMonth() + 1, trimestre: undefined,
      dateEcheance: "", montantDu: 0, montantPaye: undefined, statut: "A_DECLARER", notes: ""
    });
    setEditingDecl(null);
  };

  const openEditDeclForm = (decl: Declaration) => {
    setEditingDecl(decl);
    setDeclForm({
      type: decl.type, periode: decl.periode, annee: decl.annee,
      mois: decl.mois || undefined, trimestre: decl.trimestre || undefined,
      dateEcheance: new Date(decl.dateEcheance).toISOString().split("T")[0],
      montantDu: decl.montantDu, montantPaye: decl.montantPaye || undefined,
      statut: decl.statut, notes: decl.notes || ""
    });
    setIsDeclFormOpen(true);
  };

  const handleDeclSubmit = async () => {
    if (!declForm.dateEcheance) return;
    const data = {
      ...declForm,
      dateEcheance: new Date(declForm.dateEcheance),
    };
    if (editingDecl) {
      await updateDeclaration(editingDecl.id, data);
    } else {
      await createDeclaration(data);
    }
    setIsDeclFormOpen(false);
    resetDeclForm();
  };

  const openDeleteDeclDialog = (decl: Declaration) => {
    setDeclToDelete(decl);
    setDeleteDeclDialogOpen(true);
  };

  const handleDeleteDecl = async () => {
    if (!declToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDeclaration(declToDelete.id);
    } finally {
      setIsDeleting(false);
      setDeclToDelete(null);
    }
  };

  // Charge handlers
  const resetChargeForm = () => {
    setChargeForm({
      reference: "", designation: "", categorie: "ACHATS_MARCHANDISES",
      montantHT: 0, tva: 0, montantTTC: 0, date: new Date().toISOString().split("T")[0],
      fournisseur: "", facture: "", documentUrl: "", notes: ""
    });
    setEditingCharge(null);
  };

  const openEditChargeForm = (charge: Charge) => {
    setEditingCharge(charge);
    setChargeForm({
      reference: charge.reference, designation: charge.designation,
      categorie: charge.categorie, montantHT: charge.montantHT,
      tva: charge.tva, montantTTC: charge.montantTTC,
      date: new Date(charge.date).toISOString().split("T")[0],
      fournisseur: charge.fournisseur || "", facture: charge.facture || "",
      documentUrl: charge.documentUrl || "", notes: charge.notes || ""
    });
    setIsChargeFormOpen(true);
  };

  const handleChargeSubmit = async () => {
    if (!chargeForm.designation || !chargeForm.reference) return;
    const data = {
      ...chargeForm,
      date: new Date(chargeForm.date),
    };
    if (editingCharge) {
      await updateCharge(editingCharge.id, data);
    } else {
      await createCharge(data);
    }
    setIsChargeFormOpen(false);
    resetChargeForm();
  };

  const openDeleteChargeDialog = (charge: Charge) => {
    setChargeToDelete(charge);
    setDeleteChargeDialogOpen(true);
  };

  const handleDeleteCharge = async () => {
    if (!chargeToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCharge(chargeToDelete.id);
    } finally {
      setIsDeleting(false);
      setChargeToDelete(null);
    }
  };

  // Calculate montant TTC when HT or TVA changes
  const updateChargeAmounts = (ht: number, tvaRate: number = 19) => {
    const tva = ht * tvaRate / 100;
    const ttc = ht + tva;
    setChargeForm(prev => ({ ...prev, montantHT: ht, tva, montantTTC: ttc }));
  };

  // Filter data
  const filteredDocuments = documents.filter(d =>
    d.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.categorie.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDeclarations = declarations.filter(d =>
    d.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCharges = charges.filter(c =>
    c.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get status badge
  const getStatutBadge = (statut: string) => {
    const s = DECLARATION_STATUTS.find(st => st.value === statut);
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${s?.color || "bg-gray-100"}`}>{s?.label || statut}</span>;
  };

  const getCategoryLabel = (cat: string) => {
    const c = DOCUMENT_CATEGORIES.find(c => c.value === cat);
    return c?.label || cat;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Comptabilité</h1>
          <p className="text-muted-foreground">Gestion des documents, déclarations fiscales et charges</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Documents</p>
              <p className="text-2xl font-bold">{stats.totalDocuments}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-green-50 text-green-700"><FileText className="h-5 w-5" /></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Décl. En Attente</p>
              <p className="text-2xl font-bold">{stats.declarationsEnAttente}</p>
              {stats.declarationsEnRetard > 0 && (
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  {stats.declarationsEnRetard} en retard
                </span>
              )}
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700"><AlertTriangle className="h-5 w-5" /></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Chiffre d&apos;Affaires {stats.currentYear}</p>
              <p className="text-2xl font-bold">{formatNumber(stats.chiffreAffaires)} TND</p>
            </div>
            <div className="p-2.5 rounded-xl bg-green-50 text-green-700"><TrendingUp className="h-5 w-5" /></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">TVA à Payer</p>
              <p className="text-2xl font-bold">{formatNumber(stats.tvaDue)} TND</p>
            </div>
            <div className="p-2.5 rounded-xl bg-green-50 text-green-700"><Wallet className="h-5 w-5" /></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b overflow-x-auto">
        {[
          { id: "dashboard", label: "Tableau de Bord", icon: BarChart3 },
          { id: "documents", label: "Documents", icon: FolderOpen },
          { id: "declarations", label: "Déclarations", icon: Calendar },
          { id: "charges", label: "Charges", icon: Receipt },
          { id: "exercices", label: "Exercices", icon: Calculator },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id ? "border-b-2 border-green-600 text-gray-900" : "text-muted-foreground hover:text-gray-700"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Add */}
      {activeTab !== "dashboard" && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          {activeTab === "documents" && (
            <Button onClick={() => { resetDocForm(); setIsDocFormOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Nouveau Document
            </Button>
          )}
          {activeTab === "declarations" && (
            <Button onClick={() => { resetDeclForm(); setIsDeclFormOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Nouvelle Déclaration
            </Button>
          )}
          {activeTab === "charges" && (
            <Button onClick={() => { resetChargeForm(); setIsChargeFormOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Nouvelle Charge
            </Button>
          )}
        </div>
      )}

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TVA Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5" /> Situation TVA {stats.currentYear}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-muted-foreground">TVA Collectée (19%)</span>
                <span className="font-medium text-green-600">+{formatNumber(stats.tvaCollectee)} TND</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-muted-foreground">TVA Déductible</span>
                <span className="font-medium text-red-600">-{formatNumber(stats.tvaDeductible)} TND</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-lg">
                <span>TVA à Payer</span>
                <span className="text-gray-900">{formatNumber(stats.tvaDue)} TND</span>
              </div>
            </div>
          </div>

          {/* Résultat Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> Résultat {stats.currentYear}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-muted-foreground">Chiffre d&apos;Affaires</span>
                <span className="font-medium text-green-600">+{formatNumber(stats.chiffreAffaires)} TND</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-muted-foreground">Total Charges</span>
                <span className="font-medium text-red-600">-{formatNumber(stats.totalCharges)} TND</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-lg">
                <span>Résultat Net</span>
                <span className={stats.chiffreAffaires - stats.totalCharges >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatNumber(stats.chiffreAffaires - stats.totalCharges)} TND
                </span>
              </div>
            </div>
          </div>

          {/* Upcoming Declarations */}
          <div className="bg-white rounded-lg border p-6 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" /> Prochaines Échéances
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium">Référence</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Type</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Échéance</th>
                    <th className="px-4 py-2 text-right text-sm font-medium">Montant</th>
                    <th className="px-4 py-2 text-center text-sm font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {declarations
                    .filter(d => d.statut !== "PAYEE" && d.statut !== "ANNULEE")
                    .slice(0, 5)
                    .map(decl => (
                      <tr key={decl.id} className="border-t hover:bg-muted/50">
                        <td className="px-4 py-2 text-sm font-medium">{decl.reference}</td>
                        <td className="px-4 py-2 text-sm">{DECLARATION_TYPES.find(t => t.value === decl.type)?.label}</td>
                        <td className="px-4 py-2 text-sm">{formatDate(decl.dateEcheance)}</td>
                        <td className="px-4 py-2 text-sm text-right">{formatNumber(decl.montantDu)} TND</td>
                        <td className="px-4 py-2 text-center">{getStatutBadge(decl.statut)}</td>
                      </tr>
                    ))}
                  {declarations.filter(d => d.statut !== "PAYEE" && d.statut !== "ANNULEE").length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Aucune échéance en attente</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === "documents" && (
        <div className="rounded-md border bg-white">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Document</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Catégorie</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Année</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Taille</th>
                <th className="px-4 py-3 text-center text-sm font-medium"><MoreHorizontal className="h-4 w-4 inline" /></th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{doc.nom}</p>
                        {doc.description && <p className="text-xs text-muted-foreground">{doc.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{getCategoryLabel(doc.categorie)}</td>
                  <td className="px-4 py-3 text-sm">{DOCUMENT_TYPES[doc.categorie]?.find(t => t.value === doc.type)?.label || doc.type}</td>
                  <td className="px-4 py-3 text-sm text-center">{doc.annee}</td>
                  <td className="px-4 py-3 text-sm text-right">{doc.taille ? formatFileSize(doc.taille) : "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <a href={doc.fichierUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-blue-600 inline-block" title="Voir">
                      <Eye className="h-4 w-4" />
                    </a>
                    <a href={doc.fichierUrl} download className="p-1.5 text-gray-400 hover:text-green-600 inline-block" title="Télécharger">
                      <Download className="h-4 w-4" />
                    </a>
                    <button onClick={() => openEditDocForm(doc)} className="p-1.5 text-gray-400 hover:text-gray-600" title="Modifier">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => openDeleteDocDialog(doc)} className="p-1.5 text-gray-400 hover:text-red-500" title="Supprimer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredDocuments.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Aucun document trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Declarations Tab */}
      {activeTab === "declarations" && (
        <div className="rounded-md border bg-white">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Référence</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Période</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Échéance</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Montant</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Statut</th>
                <th className="px-4 py-3 text-center text-sm font-medium"><MoreHorizontal className="h-4 w-4 inline" /></th>
              </tr>
            </thead>
            <tbody>
              {filteredDeclarations.map((decl) => (
                <tr key={decl.id} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm font-medium">{decl.reference}</td>
                  <td className="px-4 py-3 text-sm">{DECLARATION_TYPES.find(t => t.value === decl.type)?.label}</td>
                  <td className="px-4 py-3 text-sm">
                    {decl.periode === "MENSUELLE" && decl.mois ? `${MONTHS[decl.mois - 1]?.label} ${decl.annee}` :
                     decl.periode === "TRIMESTRIELLE" && decl.trimestre ? `T${decl.trimestre} ${decl.annee}` :
                     decl.annee}
                  </td>
                  <td className="px-4 py-3 text-sm">{formatDate(decl.dateEcheance)}</td>
                  <td className="px-4 py-3 text-sm text-right">{formatNumber(decl.montantDu)} TND</td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={decl.statut}
                      onChange={(e) => updateDeclarationStatut(decl.id, e.target.value)}
                      className="text-xs border rounded px-2 py-1"
                    >
                      {DECLARATION_STATUTS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => openEditDeclForm(decl)} className="p-1.5 text-gray-400 hover:text-gray-600" title="Modifier">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => openDeleteDeclDialog(decl)} className="p-1.5 text-gray-400 hover:text-red-500" title="Supprimer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredDeclarations.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Aucune déclaration trouvée</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Charges Tab */}
      {activeTab === "charges" && (
        <div className="rounded-md border bg-white">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Référence</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Désignation</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Catégorie</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Montant HT</th>
                <th className="px-4 py-3 text-right text-sm font-medium">TVA</th>
                <th className="px-4 py-3 text-right text-sm font-medium">TTC</th>
                <th className="px-4 py-3 text-center text-sm font-medium"><MoreHorizontal className="h-4 w-4 inline" /></th>
              </tr>
            </thead>
            <tbody>
              {filteredCharges.map((charge) => (
                <tr key={charge.id} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm font-medium">{charge.reference}</td>
                  <td className="px-4 py-3 text-sm">{charge.designation}</td>
                  <td className="px-4 py-3 text-sm">{CHARGE_CATEGORIES.find(c => c.value === charge.categorie)?.label}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(charge.date)}</td>
                  <td className="px-4 py-3 text-sm text-right">{formatNumber(charge.montantHT)}</td>
                  <td className="px-4 py-3 text-sm text-right">{formatNumber(charge.tva)}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{formatNumber(charge.montantTTC)} TND</td>
                  <td className="px-4 py-3 text-center">
                    {charge.documentUrl && (
                      <a href={charge.documentUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-blue-600 inline-block" title="Voir justificatif">
                        <Eye className="h-4 w-4" />
                      </a>
                    )}
                    <button onClick={() => openEditChargeForm(charge)} className="p-1.5 text-gray-400 hover:text-gray-600" title="Modifier">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => openDeleteChargeDialog(charge)} className="p-1.5 text-gray-400 hover:text-red-500" title="Supprimer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCharges.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Aucune charge trouvée</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Exercices Tab */}
      {activeTab === "exercices" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercices.map((ex) => (
            <div key={ex.id} className="bg-white rounded-lg border p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Exercice {ex.annee}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  ex.statut === "EN_COURS" ? "bg-blue-100 text-blue-800" :
                  ex.statut === "CLOTURE" ? "bg-green-100 text-green-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {ex.statut === "EN_COURS" ? "En Cours" : ex.statut === "CLOTURE" ? "Clôturé" : "Archivé"}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Période</span>
                  <span>{formatDate(ex.dateDebut)} - {formatDate(ex.dateFin)}</span>
                </div>
                {ex.chiffreAffaires && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CA</span>
                    <span className="text-green-600">+{formatNumber(ex.chiffreAffaires)} TND</span>
                  </div>
                )}
                {ex.charges && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Charges</span>
                    <span className="text-red-600">-{formatNumber(ex.charges)} TND</span>
                  </div>
                )}
                {ex.resultat !== null && (
                  <div className="flex justify-between font-medium">
                    <span>Résultat</span>
                    <span className={ex.resultat >= 0 ? "text-green-600" : "text-red-600"}>
                      {formatNumber(ex.resultat)} TND
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {exercices.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              Aucun exercice comptable
            </div>
          )}
        </div>
      )}

      {/* Document Form Dialog */}
      <Dialog open={isDocFormOpen} onOpenChange={setIsDocFormOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDoc ? "Modifier Document" : "Nouveau Document"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom du document *</Label>
              <Input value={docForm.nom} onChange={(e) => setDocForm({ ...docForm, nom: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={docForm.description} onChange={(e) => setDocForm({ ...docForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Catégorie *</Label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={docForm.categorie}
                  onChange={(e) => setDocForm({ ...docForm, categorie: e.target.value, type: DOCUMENT_TYPES[e.target.value]?.[0]?.value || "AUTRE" })}
                >
                  {DOCUMENT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <Label>Type *</Label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={docForm.type}
                  onChange={(e) => setDocForm({ ...docForm, type: e.target.value })}
                >
                  {DOCUMENT_TYPES[docForm.categorie]?.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Année *</Label>
                <Input type="number" value={docForm.annee} onChange={(e) => setDocForm({ ...docForm, annee: parseInt(e.target.value) })} />
              </div>
              <div>
                <Label>Mois</Label>
                <select className="w-full border rounded-md px-3 py-2" value={docForm.mois || ""} onChange={(e) => setDocForm({ ...docForm, mois: e.target.value ? parseInt(e.target.value) : undefined })}>
                  <option value="">-</option>
                  {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <Label>Trimestre</Label>
                <select className="w-full border rounded-md px-3 py-2" value={docForm.trimestre || ""} onChange={(e) => setDocForm({ ...docForm, trimestre: e.target.value ? parseInt(e.target.value) : undefined })}>
                  <option value="">-</option>
                  <option value="1">T1</option>
                  <option value="2">T2</option>
                  <option value="3">T3</option>
                  <option value="4">T4</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Montant associé (TND)</Label>
              <Input type="number" step="0.001" value={docForm.montant || ""} onChange={(e) => setDocForm({ ...docForm, montant: e.target.value ? parseFloat(e.target.value) : undefined })} />
            </div>
            <div>
              <Label>Fichier *</Label>
              {docForm.fichierUrl ? (
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm flex-1">{docForm.fichierNom}</span>
                  <Button variant="ghost" size="sm" onClick={() => setDocForm({ ...docForm, fichierUrl: "", fichierNom: "", taille: 0 })}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <UploadButton
                  endpoint="documentUploader"
                  onClientUploadComplete={(res) => {
                    if (res?.[0]) {
                      setDocForm({ ...docForm, fichierUrl: res[0].ufsUrl, fichierNom: res[0].name, taille: res[0].size });
                    }
                  }}
                  onUploadError={(error) => alert(`Erreur: ${error.message}`)}
                />
              )}
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={docForm.notes} onChange={(e) => setDocForm({ ...docForm, notes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDocFormOpen(false)}>Annuler</Button>
              <Button onClick={handleDocSubmit} disabled={!docForm.nom || !docForm.fichierUrl}>
                {editingDoc ? "Modifier" : "Créer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Declaration Form Dialog */}
      <Dialog open={isDeclFormOpen} onOpenChange={setIsDeclFormOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDecl ? "Modifier Déclaration" : "Nouvelle Déclaration"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type *</Label>
                <select className="w-full border rounded-md px-3 py-2" value={declForm.type} onChange={(e) => setDeclForm({ ...declForm, type: e.target.value })}>
                  {DECLARATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <Label>Période *</Label>
                <select className="w-full border rounded-md px-3 py-2" value={declForm.periode} onChange={(e) => setDeclForm({ ...declForm, periode: e.target.value })}>
                  {DECLARATION_PERIODES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Année *</Label>
                <Input type="number" value={declForm.annee} onChange={(e) => setDeclForm({ ...declForm, annee: parseInt(e.target.value) })} />
              </div>
              {declForm.periode === "MENSUELLE" && (
                <div>
                  <Label>Mois *</Label>
                  <select className="w-full border rounded-md px-3 py-2" value={declForm.mois || ""} onChange={(e) => setDeclForm({ ...declForm, mois: parseInt(e.target.value) })}>
                    {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              )}
              {declForm.periode === "TRIMESTRIELLE" && (
                <div>
                  <Label>Trimestre *</Label>
                  <select className="w-full border rounded-md px-3 py-2" value={declForm.trimestre || ""} onChange={(e) => setDeclForm({ ...declForm, trimestre: parseInt(e.target.value) })}>
                    <option value="1">T1</option>
                    <option value="2">T2</option>
                    <option value="3">T3</option>
                    <option value="4">T4</option>
                  </select>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date d&apos;échéance *</Label>
                <Input type="date" value={declForm.dateEcheance} onChange={(e) => setDeclForm({ ...declForm, dateEcheance: e.target.value })} />
              </div>
              <div>
                <Label>Statut</Label>
                <select className="w-full border rounded-md px-3 py-2" value={declForm.statut} onChange={(e) => setDeclForm({ ...declForm, statut: e.target.value })}>
                  {DECLARATION_STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Montant dû (TND) *</Label>
                <Input type="number" step="0.001" value={declForm.montantDu} onChange={(e) => setDeclForm({ ...declForm, montantDu: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Montant payé (TND)</Label>
                <Input type="number" step="0.001" value={declForm.montantPaye || ""} onChange={(e) => setDeclForm({ ...declForm, montantPaye: e.target.value ? parseFloat(e.target.value) : undefined })} />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={declForm.notes} onChange={(e) => setDeclForm({ ...declForm, notes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeclFormOpen(false)}>Annuler</Button>
              <Button onClick={handleDeclSubmit} disabled={!declForm.dateEcheance}>
                {editingDecl ? "Modifier" : "Créer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Charge Form Dialog */}
      <Dialog open={isChargeFormOpen} onOpenChange={setIsChargeFormOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCharge ? "Modifier Charge" : "Nouvelle Charge"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Référence *</Label>
                <Input value={chargeForm.reference} onChange={(e) => setChargeForm({ ...chargeForm, reference: e.target.value })} />
              </div>
              <div>
                <Label>Date *</Label>
                <Input type="date" value={chargeForm.date} onChange={(e) => setChargeForm({ ...chargeForm, date: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Désignation *</Label>
              <Input value={chargeForm.designation} onChange={(e) => setChargeForm({ ...chargeForm, designation: e.target.value })} />
            </div>
            <div>
              <Label>Catégorie *</Label>
              <select className="w-full border rounded-md px-3 py-2" value={chargeForm.categorie} onChange={(e) => setChargeForm({ ...chargeForm, categorie: e.target.value })}>
                {CHARGE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Montant HT *</Label>
                <Input type="number" step="0.001" value={chargeForm.montantHT} onChange={(e) => updateChargeAmounts(parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label>TVA (19%)</Label>
                <Input type="number" step="0.001" value={chargeForm.tva} readOnly className="bg-muted" />
              </div>
              <div>
                <Label>Montant TTC</Label>
                <Input type="number" step="0.001" value={chargeForm.montantTTC} readOnly className="bg-muted" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fournisseur</Label>
                <Input value={chargeForm.fournisseur} onChange={(e) => setChargeForm({ ...chargeForm, fournisseur: e.target.value })} />
              </div>
              <div>
                <Label>N° Facture</Label>
                <Input value={chargeForm.facture} onChange={(e) => setChargeForm({ ...chargeForm, facture: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Justificatif</Label>
              {chargeForm.documentUrl ? (
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm flex-1">Document uploadé</span>
                  <Button variant="ghost" size="sm" onClick={() => setChargeForm({ ...chargeForm, documentUrl: "" })}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <UploadButton
                  endpoint="documentUploader"
                  onClientUploadComplete={(res) => {
                    if (res?.[0]) {
                      setChargeForm({ ...chargeForm, documentUrl: res[0].ufsUrl });
                    }
                  }}
                  onUploadError={(error) => alert(`Erreur: ${error.message}`)}
                />
              )}
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={chargeForm.notes} onChange={(e) => setChargeForm({ ...chargeForm, notes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsChargeFormOpen(false)}>Annuler</Button>
              <Button onClick={handleChargeSubmit} disabled={!chargeForm.reference || !chargeForm.designation}>
                {editingCharge ? "Modifier" : "Créer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Document Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDocDialogOpen}
        onOpenChange={setDeleteDocDialogOpen}
        onConfirm={handleDeleteDoc}
        title="Supprimer le document"
        itemName={docToDelete?.nom}
        isLoading={isDeleting}
      />

      {/* Delete Declaration Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDeclDialogOpen}
        onOpenChange={setDeleteDeclDialogOpen}
        onConfirm={handleDeleteDecl}
        title="Supprimer la déclaration"
        itemName={declToDelete?.reference}
        isLoading={isDeleting}
      />

      {/* Delete Charge Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteChargeDialogOpen}
        onOpenChange={setDeleteChargeDialogOpen}
        onConfirm={handleDeleteCharge}
        title="Supprimer la charge"
        itemName={chargeToDelete?.designation}
        isLoading={isDeleting}
      />
    </div>
  );
}

