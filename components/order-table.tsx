"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2, Package } from "lucide-react";
import { deleteOrder, OrderWithCalculations } from "@/lib/actions/orders";

interface OrderTableProps {
  orders: OrderWithCalculations[];
  onEdit: (order: OrderWithCalculations) => void;
  onDelete?: (deletedId: string) => void;
}

export function OrderTable({ orders, onEdit, onDelete }: OrderTableProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette commande?")) return;
    setDeletingId(id);
    try {
      const result = await deleteOrder(id);
      if (result.success) {
        onDelete?.(id);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatNumber = (num: number) => {
    const str = num.toString();
    if (str.length <= 6) {
      // For 6 digits or less: 341,000
      return str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } else {
      // For millions: 2 123,250 (space for millions, comma for thousands)
      const millions = str.slice(0, -6);
      const thousands = str.slice(-6, -3);
      const units = str.slice(-3);
      return `${millions} ${thousands},${units}`;
    }
  };

  // Calculate totals
  const totals = orders.reduce((acc, order) => ({
    prixVente: acc.prixVente + order.prixVente,
    prixAchat: acc.prixAchat + order.prixAchat,
    marge: acc.marge + order.marge,
  }), { prixVente: 0, prixAchat: 0, marge: 0 });
  
  const avgMarge = totals.prixVente > 0 ? Math.round((totals.marge / totals.prixVente) * 100) : 0;

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 border border-border/50 rounded-xl bg-white">
        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
        <h3 className="text-lg font-medium mb-2">Aucune commande trouvée</h3>
        <p className="text-sm text-muted-foreground">
          Créez votre première commande pour commencer le suivi.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-black text-white">
              <th className="px-4 py-3 text-left font-semibold">DATE</th>
              <th className="px-4 py-3 text-left font-semibold">DÉSIGNATION</th>
              <th className="px-4 py-3 text-left font-semibold">CLIENT</th>
              <th className="px-4 py-3 text-left font-semibold">ADRESSE</th>
              <th className="px-4 py-3 text-left font-semibold">TÉLÉPHONE</th>
              <th className="px-4 py-3 text-right font-semibold">PRIX/VENTE</th>
              <th className="px-4 py-3 text-right font-semibold">PRIX/ACHAT</th>
              <th className="px-4 py-3 text-right font-semibold">MARGE</th>
              <th className="px-4 py-3 text-right font-semibold">% MARGE</th>
              <th className="px-4 py-3 text-center font-semibold">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order, index) => (
              <tr 
                key={order.id} 
                className={`hover:bg-accent/30 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
              >
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(order.date)}</td>
                <td className="px-4 py-3 max-w-[200px]">
                  <span className="line-clamp-2">{order.designation}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-medium">{order.client}</td>
                <td className="px-4 py-3 max-w-[150px]">
                  <span className="line-clamp-2 text-muted-foreground">{order.adresse}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{order.telephone}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap font-medium">
                  {formatNumber(order.prixVente)}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap text-muted-foreground">
                  {formatNumber(order.prixAchat)}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap font-semibold text-green-600">
                  {formatNumber(order.marge)}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    order.pourcentageMarge >= 30 
                      ? "bg-green-100 text-green-700" 
                      : order.pourcentageMarge >= 15 
                      ? "bg-yellow-100 text-yellow-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    {order.pourcentageMarge}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(order)}
                      className="h-8 w-8 hover:bg-accent"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(order.id)}
                      disabled={deletingId === order.id}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                      {deletingId === order.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          {/* Totals Footer */}
          <tfoot>
            <tr className="bg-black text-white font-bold">
              <td colSpan={5} className="px-4 py-3 text-center text-lg">TOTAL</td>
              <td className="px-4 py-3 text-right text-lg">{formatNumber(totals.prixVente)}</td>
              <td className="px-4 py-3 text-right text-lg">{formatNumber(totals.prixAchat)}</td>
              <td className="px-4 py-3 text-right text-lg">{formatNumber(totals.marge)}</td>
              <td className="px-4 py-3 text-right text-lg">{avgMarge}%</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

