"use client";

import * as React from "react";
import { Plus, Search, Users, FileText, Truck, CheckCircle, Pencil, Trash2, Mail, MoreHorizontal, Phone, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { KpiCard } from "@/components/kpi-card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  createImportContact,
  updateImportContact,
  deleteImportContact,
  createImportProcedure,
  updateImportProcedure,
  deleteImportProcedure,
  updateImportProcedureStatus,
  ImportContactFormData,
  ImportProcedureFormData,
} from "@/lib/actions/imports";
import { ImportStatus } from "@prisma/client";

type ImportContact = {
  id: string;
  nom: string;
  entreprise: string | null;
  pays: string | null;
  telephone: string | null;
  email: string | null;
  adresse: string | null;
  notes: string | null;
  createdAt: Date;
};

type ImportProcedure = {
  id: string;
  reference: string;
  description: string;
  fournisseur: string;
  pays: string | null;
  dateCommande: Date | null;
  dateExpedition: Date | null;
  dateArrivee: Date | null;
  statut: ImportStatus;
  montant: number | null;
  devise: string | null;
  documents: string | null;
  notes: string | null;
  createdAt: Date;
};

type Stats = {
  totalContacts: number;
  totalProcedures: number;
  enCours: number;
  expedie: number;
  enDouane: number;
  livre: number;
} | null;

interface ImportListProps {
  initialContacts: ImportContact[];
  initialProcedures: ImportProcedure[];
  initialStats: Stats;
}

export function ImportList({ initialContacts, initialProcedures, initialStats }: ImportListProps) {
  const [activeTab, setActiveTab] = React.useState<"contacts" | "procedures">("procedures");
  const [contacts, setContacts] = React.useState<ImportContact[]>(initialContacts);
  const [procedures, setProcedures] = React.useState<ImportProcedure[]>(initialProcedures);
  const [stats] = React.useState<Stats>(initialStats);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Contact form state
  const [isContactFormOpen, setIsContactFormOpen] = React.useState(false);
  const [editingContact, setEditingContact] = React.useState<ImportContact | null>(null);
  const [contactNom, setContactNom] = React.useState("");
  const [contactEntreprise, setContactEntreprise] = React.useState("");
  const [contactPays, setContactPays] = React.useState("");
  const [contactTelephone, setContactTelephone] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState("");
  const [contactAdresse, setContactAdresse] = React.useState("");
  const [contactNotes, setContactNotes] = React.useState("");

  // Procedure form state
  const [isProcedureFormOpen, setIsProcedureFormOpen] = React.useState(false);
  const [editingProcedure, setEditingProcedure] = React.useState<ImportProcedure | null>(null);
  const [procDescription, setProcDescription] = React.useState("");
  const [procFournisseur, setProcFournisseur] = React.useState("");
  const [procPays, setProcPays] = React.useState("");
  const [procDateCommande, setProcDateCommande] = React.useState("");
  const [procDateExpedition, setProcDateExpedition] = React.useState("");
  const [procDateArrivee, setProcDateArrivee] = React.useState("");
  const [procStatut, setProcStatut] = React.useState<ImportStatus>("EN_COURS");
  const [procMontant, setProcMontant] = React.useState(0);
  const [procDevise, setProcDevise] = React.useState("EUR");
  const [procDocuments, setProcDocuments] = React.useState("");
  const [procNotes, setProcNotes] = React.useState("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fr-FR");
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getStatusBadge = (status: ImportStatus) => {
    const statusConfig = {
      EN_COURS: { label: "En cours", variant: "outline" as const },
      EXPEDIE: { label: "Expédié", variant: "default" as const },
      EN_DOUANE: { label: "En douane", variant: "secondary" as const },
      LIVRE: { label: "Livré", variant: "success" as const },
      ANNULE: { label: "Annulé", variant: "destructive" as const },
    };
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.entreprise?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.pays?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProcedures = procedures.filter(
    (p) =>
      p.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.fournisseur.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Contact handlers
  const resetContactForm = () => {
    setContactNom("");
    setContactEntreprise("");
    setContactPays("");
    setContactTelephone("");
    setContactEmail("");
    setContactAdresse("");
    setContactNotes("");
    setEditingContact(null);
  };

  const openEditContactForm = (contact: ImportContact) => {
    setEditingContact(contact);
    setContactNom(contact.nom);
    setContactEntreprise(contact.entreprise || "");
    setContactPays(contact.pays || "");
    setContactTelephone(contact.telephone || "");
    setContactEmail(contact.email || "");
    setContactAdresse(contact.adresse || "");
    setContactNotes(contact.notes || "");
    setIsContactFormOpen(true);
  };

  const handleContactSubmit = async () => {
    setIsSubmitting(true);
    const data: ImportContactFormData = {
      nom: contactNom,
      entreprise: contactEntreprise,
      pays: contactPays,
      telephone: contactTelephone,
      email: contactEmail,
      adresse: contactAdresse,
      notes: contactNotes,
    };

    const result = editingContact
      ? await updateImportContact(editingContact.id, data)
      : await createImportContact(data);

    if (result.success && result.data) {
      if (editingContact) {
        setContacts(contacts.map((c) => (c.id === editingContact.id ? result.data : c)));
      } else {
        setContacts([result.data, ...contacts]);
      }
      setIsContactFormOpen(false);
      resetContactForm();
    }
    setIsSubmitting(false);
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce contact ?")) return;
    const result = await deleteImportContact(id);
    if (result.success) {
      setContacts(contacts.filter((c) => c.id !== id));
    }
  };

  // Procedure handlers
  const resetProcedureForm = () => {
    setProcDescription("");
    setProcFournisseur("");
    setProcPays("");
    setProcDateCommande("");
    setProcDateExpedition("");
    setProcDateArrivee("");
    setProcStatut("EN_COURS");
    setProcMontant(0);
    setProcDevise("EUR");
    setProcDocuments("");
    setProcNotes("");
    setEditingProcedure(null);
  };

  const openEditProcedureForm = (proc: ImportProcedure) => {
    setEditingProcedure(proc);
    setProcDescription(proc.description);
    setProcFournisseur(proc.fournisseur);
    setProcPays(proc.pays || "");
    setProcDateCommande(proc.dateCommande ? new Date(proc.dateCommande).toISOString().split("T")[0] : "");
    setProcDateExpedition(proc.dateExpedition ? new Date(proc.dateExpedition).toISOString().split("T")[0] : "");
    setProcDateArrivee(proc.dateArrivee ? new Date(proc.dateArrivee).toISOString().split("T")[0] : "");
    setProcStatut(proc.statut);
    setProcMontant(proc.montant || 0);
    setProcDevise(proc.devise || "EUR");
    setProcDocuments(proc.documents || "");
    setProcNotes(proc.notes || "");
    setIsProcedureFormOpen(true);
  };

  const handleProcedureSubmit = async () => {
    setIsSubmitting(true);
    const data: ImportProcedureFormData = {
      description: procDescription,
      fournisseur: procFournisseur,
      pays: procPays,
      dateCommande: procDateCommande,
      dateExpedition: procDateExpedition,
      dateArrivee: procDateArrivee,
      statut: procStatut,
      montant: procMontant,
      devise: procDevise,
      documents: procDocuments,
      notes: procNotes,
    };

    const result = editingProcedure
      ? await updateImportProcedure(editingProcedure.id, data)
      : await createImportProcedure(data);

    if (result.success && result.data) {
      if (editingProcedure) {
        setProcedures(procedures.map((p) => (p.id === editingProcedure.id ? result.data : p)));
      } else {
        setProcedures([result.data, ...procedures]);
      }
      setIsProcedureFormOpen(false);
      resetProcedureForm();
    }
    setIsSubmitting(false);
  };

  const handleDeleteProcedure = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette procédure ?")) return;
    const result = await deleteImportProcedure(id);
    if (result.success) {
      setProcedures(procedures.filter((p) => p.id !== id));
    }
  };

  const handleStatusChange = async (id: string, status: ImportStatus) => {
    const result = await updateImportProcedureStatus(id, status);
    if (result.success && result.data) {
      setProcedures(procedures.map((p) => (p.id === id ? result.data : p)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Importation</h1>
          <p className="text-muted-foreground">Gérez vos contacts et procédures d&apos;importation</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Contacts" value={stats?.totalContacts || 0} icon={<Users className="h-5 w-5" />} />
        <KpiCard title="Procédures" value={stats?.totalProcedures || 0} icon={<FileText className="h-5 w-5" />} />
        <KpiCard title="En cours" value={stats?.enCours || 0} icon={<Truck className="h-5 w-5" />} />
        <KpiCard title="Livrées" value={stats?.livre || 0} icon={<CheckCircle className="h-5 w-5" />} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("procedures")}
          className={`px-4 py-2 font-medium ${activeTab === "procedures" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
        >
          <Package className="inline-block w-4 h-4 mr-2" />
          Procédures d&apos;importation
        </button>
        <button
          onClick={() => setActiveTab("contacts")}
          className={`px-4 py-2 font-medium ${activeTab === "contacts" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
        >
          <Users className="inline-block w-4 h-4 mr-2" />
          Contacts
        </button>
      </div>

      {/* Search and Add */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => {
            if (activeTab === "contacts") {
              resetContactForm();
              setIsContactFormOpen(true);
            } else {
              resetProcedureForm();
              setIsProcedureFormOpen(true);
            }
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          {activeTab === "contacts" ? "Nouveau contact" : "Nouvelle procédure"}
        </Button>
      </div>

      {/* Procedures Table */}
      {activeTab === "procedures" && (
        <div className="rounded-md border">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Référence</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Fournisseur</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Pays</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date arrivée</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Montant</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
                <th className="px-4 py-3 text-center text-sm font-medium"><MoreHorizontal className="h-4 w-4 inline" /></th>
              </tr>
            </thead>
            <tbody>
              {filteredProcedures.map((proc) => (
                <tr key={proc.id} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm font-medium">{proc.reference}</td>
                  <td className="px-4 py-3 text-sm">{proc.description}</td>
                  <td className="px-4 py-3 text-sm">{proc.fournisseur}</td>
                  <td className="px-4 py-3 text-sm">{proc.pays || "-"}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(proc.dateArrivee)}</td>
                  <td className="px-4 py-3 text-sm">{proc.montant ? `${formatNumber(proc.montant)} ${proc.devise}` : "-"}</td>
                  <td className="px-4 py-3 text-sm">
                    <select
                      value={proc.statut}
                      onChange={(e) => handleStatusChange(proc.id, e.target.value as ImportStatus)}
                      className="text-xs border rounded px-2 py-1"
                    >
                      <option value="EN_COURS">En cours</option>
                      <option value="EXPEDIE">Expédié</option>
                      <option value="EN_DOUANE">En douane</option>
                      <option value="LIVRE">Livré</option>
                      <option value="ANNULE">Annulé</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button variant="ghost" size="icon" onClick={() => openEditProcedureForm(proc)} title="Modifier">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteProcedure(proc.id)} title="Supprimer">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredProcedures.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    Aucune procédure trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Contacts Table */}
      {activeTab === "contacts" && (
        <div className="rounded-md border">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Nom</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Entreprise</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Pays</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Téléphone</th>
                <th className="px-4 py-3 text-center text-sm font-medium"><MoreHorizontal className="h-4 w-4 inline" /></th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm font-medium">{contact.nom}</td>
                  <td className="px-4 py-3 text-sm">{contact.entreprise || "-"}</td>
                  <td className="px-4 py-3 text-sm">{contact.pays || "-"}</td>
                  <td className="px-4 py-3 text-sm">{contact.telephone || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} title={contact.email} className="text-blue-600 hover:text-blue-800 inline-block">
                        <Mail className="h-4 w-4" />
                      </a>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => openEditContactForm(contact)} title="Modifier">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteContact(contact.id)} title="Supprimer">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredContacts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Aucun contact trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Contact Form Dialog */}
      <Dialog open={isContactFormOpen} onOpenChange={setIsContactFormOpen}>
        <DialogContent onClose={() => setIsContactFormOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editingContact ? "Modifier le contact" : "Nouveau contact"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactNom">Nom *</Label>
                <Input id="contactNom" value={contactNom} onChange={(e) => setContactNom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEntreprise">Entreprise</Label>
                <Input id="contactEntreprise" value={contactEntreprise} onChange={(e) => setContactEntreprise(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPays">Pays</Label>
                <Input id="contactPays" value={contactPays} onChange={(e) => setContactPays(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactTelephone">Téléphone</Label>
                <Input id="contactTelephone" value={contactTelephone} onChange={(e) => setContactTelephone(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email</Label>
              <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactAdresse">Adresse</Label>
              <Textarea id="contactAdresse" value={contactAdresse} onChange={(e) => setContactAdresse(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactNotes">Notes</Label>
              <Textarea id="contactNotes" value={contactNotes} onChange={(e) => setContactNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContactFormOpen(false)}>Annuler</Button>
            <Button onClick={handleContactSubmit} disabled={isSubmitting || !contactNom}>
              {isSubmitting ? "..." : editingContact ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Procedure Form Dialog */}
      <Dialog open={isProcedureFormOpen} onOpenChange={setIsProcedureFormOpen}>
        <DialogContent onClose={() => setIsProcedureFormOpen(false)} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProcedure ? "Modifier la procédure" : "Nouvelle procédure"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="procFournisseur">Fournisseur *</Label>
                <Input id="procFournisseur" value={procFournisseur} onChange={(e) => setProcFournisseur(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="procPays">Pays d&apos;origine</Label>
                <Input id="procPays" value={procPays} onChange={(e) => setProcPays(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="procDescription">Description *</Label>
              <Textarea id="procDescription" value={procDescription} onChange={(e) => setProcDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="procDateCommande">Date commande</Label>
                <Input id="procDateCommande" type="date" value={procDateCommande} onChange={(e) => setProcDateCommande(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="procDateExpedition">Date expédition</Label>
                <Input id="procDateExpedition" type="date" value={procDateExpedition} onChange={(e) => setProcDateExpedition(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="procDateArrivee">Date arrivée</Label>
                <Input id="procDateArrivee" type="date" value={procDateArrivee} onChange={(e) => setProcDateArrivee(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="procMontant">Montant</Label>
                <Input id="procMontant" type="number" step="0.01" value={procMontant} onChange={(e) => setProcMontant(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="procDevise">Devise</Label>
                <select id="procDevise" value={procDevise} onChange={(e) => setProcDevise(e.target.value)} className="w-full h-10 border rounded-md px-3">
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="TND">TND</option>
                  <option value="CNY">CNY</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="procStatut">Statut</Label>
                <select id="procStatut" value={procStatut} onChange={(e) => setProcStatut(e.target.value as ImportStatus)} className="w-full h-10 border rounded-md px-3">
                  <option value="EN_COURS">En cours</option>
                  <option value="EXPEDIE">Expédié</option>
                  <option value="EN_DOUANE">En douane</option>
                  <option value="LIVRE">Livré</option>
                  <option value="ANNULE">Annulé</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="procDocuments">Documents (références)</Label>
              <Input id="procDocuments" value={procDocuments} onChange={(e) => setProcDocuments(e.target.value)} placeholder="Ex: BL-123, Facture-456" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="procNotes">Notes</Label>
              <Textarea id="procNotes" value={procNotes} onChange={(e) => setProcNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProcedureFormOpen(false)}>Annuler</Button>
            <Button onClick={handleProcedureSubmit} disabled={isSubmitting || !procDescription || !procFournisseur}>
              {isSubmitting ? "..." : editingProcedure ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}