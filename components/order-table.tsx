"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2, Package, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { deleteOrder, OrderWithCalculations } from "@/lib/actions/orders";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";

interface OrderTableProps {
  orders: OrderWithCalculations[];
  onEdit: (order: OrderWithCalculations) => void;
  onDelete?: (deletedId: string) => void;
}

export function OrderTable({ orders, onEdit, onDelete }: OrderTableProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [orderToDelete, setOrderToDelete] = React.useState<OrderWithCalculations | null>(null);

  // Reset to page 1 when orders change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [orders.length]);

  // Pagination calculations
  const totalPages = Math.ceil(orders.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedOrders = orders.slice(startIndex, endIndex);

  const openDeleteDialog = (order: OrderWithCalculations) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!orderToDelete) return;
    setDeletingId(orderToDelete.id);
    try {
      const result = await deleteOrder(orderToDelete.id);
      if (result.success) {
        onDelete?.(orderToDelete.id);
      }
    } finally {
      setDeletingId(null);
      setOrderToDelete(null);
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
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Désignation</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Adresse</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Téléphone</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Prix Vente</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Prix Achat</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Marge</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-4 py-3 text-gray-600">{formatDate(order.date)}</td>
                <td className="px-4 py-3 max-w-[200px]">
                  <span className="line-clamp-2 text-gray-900">{order.designation}</span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{order.client}</td>
                <td className="px-4 py-3 max-w-[150px]">
                  <span className="line-clamp-2 text-gray-500">{order.adresse}</span>
                </td>
                <td className="px-4 py-3 text-gray-500">{order.telephone}</td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {formatNumber(order.prixVente)}
                </td>
                <td className="px-4 py-3 text-right text-gray-500">
                  {formatNumber(order.prixAchat)}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <span className="text-green-600 font-medium">{formatNumber(order.marge)}</span>
                  <span className="text-xs text-muted-foreground ml-1">({order.pourcentageMarge}%)</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(order)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openDeleteDialog(order)}
                      disabled={deletingId === order.id}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      {deletingId === order.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          {/* Totals Footer */}
          <tfoot>
            <tr className="border-t-2 border-gray-200 bg-gray-50/50">
              <td colSpan={5} className="px-4 py-3 text-right font-semibold text-gray-700">Total</td>
              <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatNumber(totals.prixVente)}</td>
              <td className="px-4 py-3 text-right font-semibold text-gray-500">{formatNumber(totals.prixAchat)}</td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <span className="font-semibold text-green-600">{formatNumber(totals.marge)}</span>
                <span className="text-xs text-muted-foreground ml-1">({avgMarge}%)</span>
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-t border-border bg-gray-50/50">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="whitespace-nowrap">Afficher</span>
          <select
            value={pageSize.toString()}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-8 px-2 rounded-md border border-input bg-background text-sm"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span className="whitespace-nowrap">par page</span>
          <span className="ml-2 whitespace-nowrap">
            {startIndex + 1}-{Math.min(endIndex, orders.length)} sur {orders.length} commandes
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-3 text-sm text-muted-foreground">
            Page {currentPage} / {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage >= totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Supprimer la commande"
        itemName={orderToDelete?.designation}
        isLoading={deletingId !== null}
      />
    </div>
  );
}

