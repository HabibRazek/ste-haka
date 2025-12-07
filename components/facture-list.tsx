"use client";

import * as React from "react";
import { Plus, Search, FileText, DollarSign, Clock, CheckCircle, Pencil, Trash2, Download, X, Mail, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KpiCard } from "@/components/kpi-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { pdf } from "@react-pdf/renderer";
import { FacturePDF } from "@/components/facture-pdf";
import {
  createFacture,
  updateFacture,
  deleteFacture,
  FactureFormData,
  FactureItemInput,
} from "@/lib/actions/factures";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";

type FactureItem = {
  id: string;
  designation: string;
  quantite: number;
  prixUnit: number;
  total: number;
};

type Facture = {
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
  items: FactureItem[];
  createdAt: Date;
  updatedAt: Date;
};

type Stats = {
  totalFactures: number;
  totalRevenue: number;
  pendingAmount: number;
  paidCount: number;
} | null;

type Product = {
  id: string;
  name: string;
  contenance: string | null;
  prixVente: number;
};

type PrintJob = {
  id: string;
  client: string;
  description: string | null;
  largeur: number;
  hauteur: number;
  quantite: number;
  prixTotal: number;
};

interface FactureListProps {
  initialFactures: Facture[];
  initialStats: Stats;
  products: Product[];
  printJobs: PrintJob[];
}

export function FactureList({ initialFactures, initialStats, products, printJobs }: FactureListProps) {
  const [factures, setFactures] = React.useState<Facture[]>(initialFactures);
  const [stats, setStats] = React.useState<Stats>(initialStats);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingFacture, setEditingFacture] = React.useState<Facture | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [factureToDelete, setFactureToDelete] = React.useState<Facture | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Form state
  const [clientName, setClientName] = React.useState("");
  const [clientTel, setClientTel] = React.useState("");
  const [clientEmail, setClientEmail] = React.useState("");
  const [clientMatriculeFiscale, setClientMatriculeFiscale] = React.useState("");
  const [timbre, setTimbre] = React.useState(0);
  const [items, setItems] = React.useState<FactureItemInput[]>([
    { designation: "", quantite: 1, prixUnit: 0 },
  ]);

  const formatNumber = (num: number) => {
    return num.toLocaleString("fr-FR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR");
  };

  const filteredFactures = factures.filter(
    (f) =>
      f.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.numero.includes(searchQuery)
  );

  const resetForm = () => {
    setClientName("");
    setClientTel("");
    setClientEmail("");
    setClientMatriculeFiscale("");
    setTimbre(0);
    setItems([{ designation: "", quantite: 1, prixUnit: 0 }]);
    setEditingFacture(null);
  };

  const openNewForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (facture: Facture) => {
    setEditingFacture(facture);
    setClientName(facture.clientName);
    setClientTel(facture.clientTel || "");
    setClientEmail(facture.clientEmail || "");
    setClientMatriculeFiscale(facture.clientMatriculeFiscale || "");
    setTimbre(facture.timbre);
    setItems(
      facture.items.map((item) => ({
        designation: item.designation,
        quantite: item.quantite,
        prixUnit: item.prixUnit,
      }))
    );
    setIsFormOpen(true);
  };

  const addItem = () => {
    setItems([...items, { designation: "", quantite: 1, prixUnit: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof FactureItemInput, value: string | number) => {
    setItems((prevItems) => {
      const newItems = [...prevItems];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  const selectDesignation = (index: number, designation: string, price: number, qty?: number) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      newItems[index] = {
        ...newItems[index],
        designation,
        prixUnit: price,
        quantite: qty || newItems[index].quantite || 1,
      };
      return newItems;
    });
  };

  const handleDesignationChange = (index: number, value: string) => {
    const selectedProduct = products.find(
      (p) => `${p.name}${p.contenance ? ` - ${p.contenance}` : ""}` === value
    );
    if (selectedProduct) {
      selectDesignation(index, value, selectedProduct.prixVente);
      return;
    }

    const selectedPrintJob = printJobs.find(
      (pj) => `Impression: ${pj.client}${pj.description ? ` - ${pj.description}` : ""} (${pj.largeur}x${pj.hauteur}cm)` === value
    );
    if (selectedPrintJob) {
      selectDesignation(index, value, selectedPrintJob.prixTotal, 1);
      return;
    }

    setItems(prevItems => {
      const newItems = [...prevItems];
      newItems[index] = { ...newItems[index], designation: value };
      return newItems;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data: FactureFormData = {
      clientName,
      clientTel: clientTel || undefined,
      clientEmail: clientEmail || undefined,
      clientMatriculeFiscale: clientMatriculeFiscale || undefined,
      items: items.filter((item) => item.designation && item.quantite > 0),
      timbre,
    };

    try {
      if (editingFacture) {
        const result = await updateFacture(editingFacture.id, data);
        if (result.success) window.location.reload();
      } else {
        const result = await createFacture(data);
        if (result.success) window.location.reload();
      }
    } catch (error) {
      console.error("Error saving facture:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteDialog = (facture: Facture) => {
    setFactureToDelete(facture);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!factureToDelete) return;
    setIsDeleting(true);
    try {
      const result = await deleteFacture(factureToDelete.id);
      if (result.success) {
        setFactures(factures.filter((f) => f.id !== factureToDelete.id));
        window.location.reload();
      }
    } finally {
      setIsDeleting(false);
      setFactureToDelete(null);
    }
  };

  const downloadPDF = async (facture: Facture) => {
    const blob = await pdf(<FacturePDF facture={facture} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `facture_${facture.numero}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    const headers = ["N° Facture", "Date", "Client", "Téléphone", "Email", "Sous-Total", "Timbre", "Total", "Statut"];
    const rows = filteredFactures.map((f) => [
      f.numero,
      formatDate(f.date),
      f.clientName,
      f.clientTel || "",
      f.clientEmail || "",
      formatNumber(f.sousTotal),
      formatNumber(f.timbre),
      formatNumber(f.total),
      f.status === "PAID" ? "Payé" : f.status === "PENDING" ? "En attente" : "Annulé",
    ]);
    const csvContent = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "factures.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Payé</span>;
      case "PENDING":
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">En attente</span>;
      case "CANCELLED":
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Annulé</span>;
      default:
        return null;
    }
  };

  const sousTotal = items.reduce((sum, item) => sum + item.quantite * item.prixUnit, 0);
  const total = sousTotal + timbre;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
          <p className="text-gray-500">Gérez vos factures clients</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            Exporter Excel
          </Button>
          <Button onClick={openNewForm}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Facture
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Total Factures"
          value={stats?.totalFactures || 0}
          icon={<FileText className="h-5 w-5" />}
        />
        <KpiCard
          title="Factures Payées"
          value={stats?.paidCount || 0}
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <KpiCard
          title="En Attente"
          value={`${formatNumber(stats?.pendingAmount || 0)} TND`}
          icon={<Clock className="h-5 w-5" />}
        />
        <KpiCard
          title="Chiffre d'Affaires"
          value={`${formatNumber(stats?.totalRevenue || 0)} TND`}
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par client ou numéro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">N° Facture</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase"><MoreHorizontal className="h-4 w-4 inline" /></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredFactures.map((facture) => (
              <tr key={facture.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{facture.numero}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatDate(facture.date)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{facture.clientName}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatNumber(facture.total)} TND</td>
                <td className="px-4 py-3 text-center">{getStatusBadge(facture.status)}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-1">
                    {facture.clientEmail && (
                      <a href={`mailto:${facture.clientEmail}`} title={facture.clientEmail} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
                        <Mail className="h-4 w-4" />
                      </a>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => downloadPDF(facture)} title="Télécharger PDF">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEditForm(facture)} title="Modifier">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(facture)} title="Supprimer">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredFactures.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Aucune facture trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFacture ? "Modifier la Facture" : "Nouvelle Facture"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Client Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nom du Client *</Label>
                <Input value={clientName} onChange={(e) => setClientName(e.target.value)} required />
              </div>
              <div>
                <Label>Matricule Fiscale</Label>
                <Input value={clientMatriculeFiscale} onChange={(e) => setClientMatriculeFiscale(e.target.value)} placeholder="Ex: 1234567/A/B/C/000" />
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input value={clientTel} onChange={(e) => setClientTel(e.target.value)} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Articles</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" /> Ajouter
                </Button>
              </div>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      {index === 0 && <Label className="text-xs text-muted-foreground">Désignation</Label>}
                      <select
                        value={item.designation}
                        onChange={(e) => handleDesignationChange(index, e.target.value)}
                        className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        <option value="">Sélectionner...</option>
                        <optgroup label="📦 Produits">
                          {products.map((product) => (
                            <option key={product.id} value={`${product.name}${product.contenance ? ` - ${product.contenance}` : ""}`}>
                              {product.name}{product.contenance ? ` - ${product.contenance}` : ""} ({formatNumber(product.prixVente)} TND)
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="🖨️ Travaux d'Impression">
                          {printJobs.map((pj) => (
                            <option key={pj.id} value={`Impression: ${pj.client}${pj.description ? ` - ${pj.description}` : ""} (${pj.largeur}x${pj.hauteur}cm)`}>
                              {pj.client}{pj.description ? ` - ${pj.description}` : ""} ({pj.largeur}x{pj.hauteur}cm) - {formatNumber(pj.prixTotal)} TND
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                    <div className="w-24">
                      {index === 0 && <Label className="text-xs text-muted-foreground">Quantité</Label>}
                      <Input type="number" step="0.001" value={item.quantite || ""} onChange={(e) => updateItem(index, "quantite", parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="w-24">
                      {index === 0 && <Label className="text-xs text-muted-foreground">Prix Unit.</Label>}
                      <Input type="number" step="0.001" value={item.prixUnit || ""} onChange={(e) => updateItem(index, "prixUnit", parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="w-24">
                      {index === 0 && <Label className="text-xs text-muted-foreground">Total</Label>}
                      <Input value={formatNumber(item.quantite * item.prixUnit)} disabled className="bg-gray-50" />
                    </div>
                    <button type="button" onClick={() => removeItem(index)} className="p-2 text-gray-400 hover:text-red-500" disabled={items.length === 1}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Timbre & Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sous-total:</span>
                  <span>{formatNumber(sousTotal)} TND</span>
                </div>
                <div className="flex justify-between items-center">
                  <Label>Timbre:</Label>
                  <Input type="number" step="0.001" value={timbre || ""} onChange={(e) => setTimbre(parseFloat(e.target.value) || 0)} className="w-32 text-right" />
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatNumber(total)} TND</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : editingFacture ? "Modifier" : "Créer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Supprimer la facture"
        itemName={factureToDelete ? `Facture N° ${factureToDelete.numero}` : undefined}
        isLoading={isDeleting}
      />
    </div>
  );
}

