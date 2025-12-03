"use client";

import * as React from "react";
import { Plus, Search, FileText, DollarSign, Clock, CheckCircle, Pencil, Trash2, Download, Eye, X } from "lucide-react";
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
import { InvoicePDF } from "@/components/invoice-pdf";
import {
  createInvoice,
  updateInvoice,
  deleteInvoice,
  InvoiceFormData,
  InvoiceItemInput,
} from "@/lib/actions/invoices";
import Image from "next/image";

type InvoiceItem = {
  id: string;
  designation: string;
  quantite: number;
  prixUnit: number;
  total: number;
};

type Invoice = {
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
  items: InvoiceItem[];
  createdAt: Date;
  updatedAt: Date;
};

type Stats = {
  totalInvoices: number;
  totalRevenue: number;
  pendingAmount: number;
  paidCount: number;
} | null;

interface InvoiceListProps {
  initialInvoices: Invoice[];
  initialStats: Stats;
}

export function InvoiceList({ initialInvoices, initialStats }: InvoiceListProps) {
  const [invoices, setInvoices] = React.useState<Invoice[]>(initialInvoices);
  const [stats, setStats] = React.useState<Stats>(initialStats);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingInvoice, setEditingInvoice] = React.useState<Invoice | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state
  const [clientName, setClientName] = React.useState("");
  const [clientTel, setClientTel] = React.useState("");
  const [clientEmail, setClientEmail] = React.useState("");
  const [timbre, setTimbre] = React.useState(0);
  const [items, setItems] = React.useState<InvoiceItemInput[]>([
    { designation: "", quantite: 0, prixUnit: 0 },
  ]);

  const formatNumber = (num: number) => {
    return num.toLocaleString("fr-FR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR");
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.numero.includes(searchQuery)
  );

  const calculateTotals = () => {
    const sousTotal = items.reduce((sum, item) => sum + item.quantite * item.prixUnit, 0);
    return { sousTotal, total: sousTotal + timbre };
  };

  const resetForm = () => {
    setClientName("");
    setClientTel("");
    setClientEmail("");
    setTimbre(0);
    setItems([{ designation: "", quantite: 0, prixUnit: 0 }]);
    setEditingInvoice(null);
  };

  const openNewForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setClientName(invoice.clientName);
    setClientTel(invoice.clientTel || "");
    setClientEmail(invoice.clientEmail || "");
    setTimbre(invoice.timbre);
    setItems(
      invoice.items.map((item) => ({
        designation: item.designation,
        quantite: item.quantite,
        prixUnit: item.prixUnit,
      }))
    );
    setIsFormOpen(true);
  };

  const addItem = () => {
    setItems([...items, { designation: "", quantite: 0, prixUnit: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItemInput, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data: InvoiceFormData = {
      clientName,
      clientTel: clientTel || undefined,
      clientEmail: clientEmail || undefined,
      items: items.filter((item) => item.designation && item.quantite > 0),
      timbre,
    };

    try {
      if (editingInvoice) {
        const result = await updateInvoice(editingInvoice.id, data);
        if (result.success) window.location.reload();
      } else {
        const result = await createInvoice(data);
        if (result.success) window.location.reload();
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce devis ?")) return;
    const result = await deleteInvoice(id);
    if (result.success) {
      setInvoices(invoices.filter((inv) => inv.id !== id));
      window.location.reload();
    }
  };

  const downloadPDF = async (invoice: Invoice) => {
    const blob = await pdf(<InvoicePDF invoice={invoice} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devis_${invoice.numero}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    const headers = ["N° Devis", "Date", "Client", "Téléphone", "Email", "Sous-Total", "Timbre", "Total", "Statut"];
    const rows = filteredInvoices.map((inv) => [
      inv.numero,
      formatDate(inv.date),
      inv.clientName.replace(/,/g, ";"),
      inv.clientTel || "",
      inv.clientEmail || "",
      inv.sousTotal.toString(),
      inv.timbre.toString(),
      inv.total.toString(),
      inv.status,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devis_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PAID: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      PENDING: "En attente",
      PAID: "Payé",
      CANCELLED: "Annulé",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Gestion des Devis</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Créez et gérez vos devis avec génération PDF automatique.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={exportToExcel} size="sm" className="text-xs sm:text-sm">
            <Image src="/Microsoft_Office_Excel.svg" alt="Excel" width={16} height={16} className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Exporter</span> Excel
          </Button>
          <Button onClick={openNewForm} size="sm" className="text-xs sm:text-sm">
            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Nouveau</span> Devis
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Devis" value={stats?.totalInvoices || 0} icon={<FileText className="h-5 w-5" />} />
        <KpiCard title="Devis Payés" value={stats?.paidCount || 0} icon={<CheckCircle className="h-5 w-5" />} />
        <KpiCard title="En Attente" value={`${formatNumber(stats?.pendingAmount || 0)} TND`} icon={<Clock className="h-5 w-5" />} />
        <KpiCard title="Chiffre d'Affaires" value={`${formatNumber(stats?.totalRevenue || 0)} TND`} icon={<DollarSign className="h-5 w-5" />} />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher un devis..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
      </div>

      {/* Table */}
      {filteredInvoices.length === 0 ? (
        <div className="text-center py-16 border border-border/50 rounded-xl bg-white">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-medium mb-2">Aucun devis trouvé</h3>
          <p className="text-sm text-muted-foreground">Créez votre premier devis.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">N° Devis</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Client</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Statut</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium">{invoice.numero}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(invoice.date)}</td>
                    <td className="px-4 py-3 font-medium">{invoice.clientName}</td>
                    <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">{formatNumber(invoice.total)} TND</td>
                    <td className="px-4 py-3 text-center">{getStatusBadge(invoice.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => downloadPDF(invoice)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="Télécharger PDF">
                          <Download className="h-4 w-4" />
                        </button>
                        <button onClick={() => openEditForm(invoice)} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors" title="Modifier">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(invoice.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Supprimer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingInvoice ? "Modifier le devis" : "Nouveau devis"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Client Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="clientName">Entreprise *</Label>
                <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="clientTel">Téléphone</Label>
                <Input id="clientTel" value={clientTel} onChange={(e) => setClientTel(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="clientEmail">Email</Label>
                <Input id="clientEmail" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
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
                      <Input value={item.designation} onChange={(e) => updateItem(index, "designation", e.target.value)} placeholder="Description" />
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

            {/* Timbre */}
            <div className="w-32">
              <Label htmlFor="timbre">Timbre (TND)</Label>
              <Input id="timbre" type="number" step="0.001" value={timbre || ""} onChange={(e) => setTimbre(parseFloat(e.target.value) || 0)} />
            </div>

            {/* Preview totals */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total:</span>
                <span className="font-medium">{formatNumber(totals.sousTotal)} TND</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Timbre:</span>
                <span className="font-medium">{formatNumber(timbre)} TND</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>{formatNumber(totals.total)} TND</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "..." : editingInvoice ? "Modifier" : "Créer"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

