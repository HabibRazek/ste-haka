"use client";

import * as React from "react";
import { Plus, Search, Printer, Ruler, DollarSign, Layers, Package, Pencil, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  createPrintJob,
  updatePrintJob,
  deletePrintJob,
  PrintJobFormData,
} from "@/lib/actions/print-jobs";
import Image from "next/image";

type PrintJob = {
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

type Stats = {
  totalJobs: number;
  totalSurfaceM2: number;
  totalRevenue: number;
  totalEtiquettes: number;
} | null;

interface PrintJobListProps {
  initialJobs: PrintJob[];
  initialStats: Stats;
}

const PRIX_PAR_M2 = 24;

export function PrintJobList({ initialJobs, initialStats }: PrintJobListProps) {
  const [jobs, setJobs] = React.useState<PrintJob[]>(initialJobs);
  const [stats, setStats] = React.useState<Stats>(initialStats);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingJob, setEditingJob] = React.useState<PrintJob | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Calculator state
  const [calcLargeur, setCalcLargeur] = React.useState<string>("");
  const [calcHauteur, setCalcHauteur] = React.useState<string>("");
  const [calcQuantite, setCalcQuantite] = React.useState<string>("1");

  // Form state
  const [formData, setFormData] = React.useState<PrintJobFormData>({
    client: "",
    description: "",
    largeur: 0,
    hauteur: 0,
    quantite: 1,
  });

  // Live calculation
  const liveCalc = React.useMemo(() => {
    const l = parseFloat(calcLargeur) || 0;
    const h = parseFloat(calcHauteur) || 0;
    const q = parseInt(calcQuantite) || 1;
    const surfaceUnit = (l / 100) * (h / 100);
    const surfaceTotal = surfaceUnit * q;
    const prix = surfaceTotal * PRIX_PAR_M2;
    return {
      surfaceUnit: Math.round(surfaceUnit * 10000) / 10000,
      surfaceTotal: Math.round(surfaceTotal * 10000) / 10000,
      prix: Math.round(prix * 100) / 100,
    };
  }, [calcLargeur, calcHauteur, calcQuantite]);

  const formatNumber = (num: number) => {
    return num.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const openNewForm = () => {
    setEditingJob(null);
    setFormData({ client: "", description: "", largeur: 0, hauteur: 0, quantite: 1 });
    setIsFormOpen(true);
  };

  const openEditForm = (job: PrintJob) => {
    setEditingJob(job);
    setFormData({
      client: job.client,
      description: job.description || "",
      largeur: job.largeur,
      hauteur: job.hauteur,
      quantite: job.quantite,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingJob) {
        const result = await updatePrintJob(editingJob.id, formData);
        if (result.success && result.data) {
          setJobs(jobs.map((j) => (j.id === editingJob.id ? result.data : j)));
        }
      } else {
        const result = await createPrintJob(formData);
        if (result.success && result.data) {
          setJobs([result.data, ...jobs]);
        }
      }
      setIsFormOpen(false);
      // Refresh stats
      window.location.reload();
    } catch (error) {
      console.error("Error saving print job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce travail ?")) return;
    const result = await deletePrintJob(id);
    if (result.success) {
      setJobs(jobs.filter((j) => j.id !== id));
      window.location.reload();
    }
  };

  const exportToExcel = () => {
    const headers = ["Client", "Description", "Largeur (cm)", "Hauteur (cm)", "Quantité", "Surface Unit (m²)", "Surface Total (m²)", "Prix/m²", "Prix Total"];
    const rows = filteredJobs.map((job) => [
      job.client.replace(/,/g, ";"),
      (job.description || "").replace(/,/g, ";"),
      job.largeur.toString(),
      job.hauteur.toString(),
      job.quantite.toString(),
      job.surfaceUnitM2.toString(),
      job.surfaceTotalM2.toString(),
      job.prixUnitaire.toString(),
      job.prixTotal.toString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `impression_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Service d&apos;Impression</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Calculez le coût d&apos;impression d&apos;étiquettes en vinyle.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={exportToExcel} size="sm" className="text-xs sm:text-sm">
            <Image src="/Microsoft_Office_Excel.svg" alt="Excel" width={16} height={16} className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Exporter</span> Excel
          </Button>
          <Button onClick={openNewForm} size="sm" className="text-xs sm:text-sm">
            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Nouveau</span> Travail
          </Button>
        </div>
      </div>

      {/* Calculator Card */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Ruler className="h-5 w-5 text-gray-600" />
          Calculateur Rapide
        </h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <Label className="text-xs text-muted-foreground">Largeur (cm)</Label>
            <Input
              type="number"
              placeholder="10"
              value={calcLargeur}
              onChange={(e) => setCalcLargeur(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Hauteur (cm)</Label>
            <Input
              type="number"
              placeholder="5"
              value={calcHauteur}
              onChange={(e) => setCalcHauteur(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Quantité</Label>
            <Input
              type="number"
              placeholder="1"
              value={calcQuantite}
              onChange={(e) => setCalcQuantite(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="bg-gray-50 rounded-lg p-3 flex flex-col justify-center">
            <p className="text-xs text-muted-foreground">Résultat ({PRIX_PAR_M2} TND/m²)</p>
            <p className="text-sm">Surface: <span className="font-semibold">{formatNumber(liveCalc.surfaceTotal)} m²</span></p>
            <p className="text-lg font-bold text-gray-900">{formatNumber(liveCalc.prix)} TND</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Travaux"
          value={stats?.totalJobs || 0}
          icon={<Printer className="h-5 w-5" />}
        />
        <KpiCard
          title="Total Étiquettes"
          value={stats?.totalEtiquettes || 0}
          icon={<Layers className="h-5 w-5" />}
        />
        <KpiCard
          title="Surface Totale"
          value={`${formatNumber(stats?.totalSurfaceM2 || 0)} m²`}
          icon={<Ruler className="h-5 w-5" />}
        />
        <KpiCard
          title="Chiffre d'Affaires"
          value={`${formatNumber(stats?.totalRevenue || 0)} TND`}
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un travail..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-16 border border-border/50 rounded-xl bg-white">
          <Printer className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-medium mb-2">Aucun travail trouvé</h3>
          <p className="text-sm text-muted-foreground">Créez votre premier travail d&apos;impression.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Dimensions</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Qté</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Surface (m²)</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Prix Total</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{job.client}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{job.description || "-"}</td>
                    <td className="px-4 py-3 text-right text-gray-600 whitespace-nowrap">{job.largeur} × {job.hauteur} cm</td>
                    <td className="px-4 py-3 text-right text-gray-600">{job.quantite}</td>
                    <td className="px-4 py-3 text-right text-gray-600 whitespace-nowrap">{formatNumber(job.surfaceTotalM2)}</td>
                    <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">{formatNumber(job.prixTotal)} TND</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEditForm(job)} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(job.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingJob ? "Modifier le travail" : "Nouveau travail d'impression"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="client">Client *</Label>
              <Input id="client" value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="largeur">Largeur (cm) *</Label>
                <Input id="largeur" type="number" step="0.1" value={formData.largeur || ""} onChange={(e) => setFormData({ ...formData, largeur: parseFloat(e.target.value) || 0 })} required />
              </div>
              <div>
                <Label htmlFor="hauteur">Hauteur (cm) *</Label>
                <Input id="hauteur" type="number" step="0.1" value={formData.hauteur || ""} onChange={(e) => setFormData({ ...formData, hauteur: parseFloat(e.target.value) || 0 })} required />
              </div>
              <div>
                <Label htmlFor="quantite">Quantité *</Label>
                <Input id="quantite" type="number" value={formData.quantite || ""} onChange={(e) => setFormData({ ...formData, quantite: parseInt(e.target.value) || 1 })} required />
              </div>
            </div>
            {formData.largeur > 0 && formData.hauteur > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Aperçu du calcul ({PRIX_PAR_M2} TND/m²)</p>
                <p className="text-sm">Surface totale: <span className="font-semibold">{formatNumber(((formData.largeur / 100) * (formData.hauteur / 100)) * formData.quantite)} m²</span></p>
                <p className="text-lg font-bold text-gray-900">{formatNumber(((formData.largeur / 100) * (formData.hauteur / 100)) * formData.quantite * PRIX_PAR_M2)} TND</p>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "..." : editingJob ? "Modifier" : "Créer"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

