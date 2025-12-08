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
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Payé
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            En attente
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Annulé
          </span>
        );
      default:
        return null;
    }
  };

  const sousTotal = items.reduce((sum, item) => sum + item.quantite * item.prixUnit, 0);
  const total = sousTotal + timbre;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
          <p className="text-muted-foreground text-sm">Gérez vos factures clients</p>
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
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher par client ou numéro..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 h-11 rounded-xl border-gray-200 bg-white focus:border-green-500 focus:ring-green-500/20"
        />
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredFactures.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
            Aucune facture trouvée
          </div>
        ) : (
          filteredFactures.map((facture) => (
            <div key={facture.id} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 shadow-sm">
              {/* Header: Numero + Status */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">{facture.numero}</span>
                {getStatusBadge(facture.status)}
              </div>

              {/* Client & Date */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">{facture.clientName}</p>
                <p className="text-xs text-gray-500">{formatDate(facture.date)}</p>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-500">Total</span>
                <span className="font-bold text-gray-900">{formatNumber(facture.total)} TND</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1 pt-2 border-t">
                {facture.clientEmail && (
                  <a href={`mailto:${facture.clientEmail}`} title={facture.clientEmail} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
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
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">N° Facture</th>
              <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
              <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
              <th className="text-right px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
              <th className="text-center px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
              <th className="text-center px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredFactures.map((facture) => (
              <tr key={facture.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4 text-sm font-semibold text-gray-900">{facture.numero}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{formatDate(facture.date)}</td>
                <td className="px-5 py-4 text-sm text-gray-900">{facture.clientName}</td>
                <td className="px-5 py-4 text-sm font-medium text-gray-900 text-right">{formatNumber(facture.total)} TND</td>
                <td className="px-5 py-4 text-center">{getStatusBadge(facture.status)}</td>
                <td className="px-5 py-4 text-center">
                  <div className="flex justify-center gap-0.5">
                    {facture.clientEmail && (
                      <a href={`mailto:${facture.clientEmail}`} title={facture.clientEmail} className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-all">
                        <Mail className="h-4 w-4" />
                      </a>
                    )}
                    <button onClick={() => downloadPDF(facture)} title="Télécharger PDF" className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-all">
                      <Download className="h-4 w-4" />
                    </button>
                    <button onClick={() => openEditForm(facture)} title="Modifier" className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => openDeleteDialog(facture)} title="Supprimer" className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredFactures.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
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

