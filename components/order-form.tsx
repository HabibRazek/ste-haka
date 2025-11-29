"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createOrder, updateOrder, OrderFormData } from "@/lib/actions/orders";

// Format number with comma for thousands (e.g., 180000 -> "180,000")
const formatNumberInput = (num: number): string => {
  if (num === 0) return "";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Parse formatted string back to number (e.g., "180,000" -> 180000)
const parseNumberInput = (str: string): number => {
  const cleaned = str.replace(/,/g, "");
  return parseFloat(cleaned) || 0;
};

interface Order {
  id: string;
  date: Date;
  designation: string;
  client: string;
  adresse: string;
  telephone: string;
  prixVente: number;
  prixAchat: number;
}

interface OrderWithCalculations extends Order {
  marge: number;
  pourcentageMarge: number;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: Order | null;
  onOrderSaved?: (savedOrder: OrderWithCalculations, isUpdate: boolean) => void;
}

export function OrderForm({ open, onOpenChange, order, onOrderSaved }: OrderFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<OrderFormData>({
    date: new Date().toISOString().split("T")[0],
    designation: "",
    client: "",
    adresse: "",
    telephone: "",
    prixVente: 0,
    prixAchat: 0,
  });

  React.useEffect(() => {
    if (order) {
      setFormData({
        date: new Date(order.date).toISOString().split("T")[0],
        designation: order.designation,
        client: order.client,
        adresse: order.adresse,
        telephone: order.telephone,
        prixVente: order.prixVente,
        prixAchat: order.prixAchat,
      });
    } else {
      setFormData({
        date: new Date().toISOString().split("T")[0],
        designation: "",
        client: "",
        adresse: "",
        telephone: "",
        prixVente: 0,
        prixAchat: 0,
      });
    }
    setError(null);
  }, [order, open]);

  const marge = formData.prixVente - formData.prixAchat;
  const pourcentageMarge = formData.prixVente > 0 
    ? Math.round((marge / formData.prixVente) * 100) 
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.designation.trim() || !formData.client.trim()) {
      setError("La désignation et le client sont obligatoires");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = order
        ? await updateOrder(order.id, formData)
        : await createOrder(formData);
      if (result.success && result.data) {
        // Calculate marge and percentage for the saved order
        const savedOrder: OrderWithCalculations = {
          ...result.data,
          marge: result.data.prixVente - result.data.prixAchat,
          pourcentageMarge: result.data.prixVente > 0
            ? Math.round(((result.data.prixVente - result.data.prixAchat) / result.data.prixVente) * 100)
            : 0,
        };
        onOrderSaved?.(savedOrder, !!order);
        onOpenChange(false);
      } else if (result.success) {
        // Fallback if data is not returned
        router.refresh();
        onOpenChange(false);
      } else {
        setError(result.error || "Une erreur est survenue");
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {order ? "Modifier la commande" : "Nouvelle commande"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-foreground bg-accent border border-border rounded-lg">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date *</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Téléphone</label>
              <Input
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                placeholder="Numéro de téléphone"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Désignation *</label>
            <Textarea
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              placeholder="Description du produit"
              disabled={isLoading}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Client *</label>
              <Input
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                placeholder="Nom du client"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Adresse</label>
              <Input
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                placeholder="Adresse de livraison"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Prix de Vente (TND) *</label>
              <Input
                type="text"
                inputMode="numeric"
                value={formatNumberInput(formData.prixVente)}
                onChange={(e) => setFormData({ ...formData, prixVente: parseNumberInput(e.target.value) })}
                placeholder="0"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Prix d&apos;Achat (TND) *</label>
              <Input
                type="text"
                inputMode="numeric"
                value={formatNumberInput(formData.prixAchat)}
                onChange={(e) => setFormData({ ...formData, prixAchat: parseNumberInput(e.target.value) })}
                placeholder="0"
                disabled={isLoading}
              />
            </div>
          </div>
          {/* Live calculation preview */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-accent/50 rounded-lg border border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Marge</p>
              <p className={`text-xl font-bold ${marge >= 0 ? "text-primary" : "text-red-500"}`}>
                {formatNumberInput(marge)} TND
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">% Marge</p>
              <p className={`text-xl font-bold ${pourcentageMarge >= 0 ? "text-primary" : "text-red-500"}`}>
                {pourcentageMarge}%
              </p>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {order ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

