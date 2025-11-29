"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  Download, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Percent,
  Package
} from "lucide-react";
import { OrderForm } from "./order-form";
import { OrderTable } from "./order-table";
import { OrderWithCalculations } from "@/lib/actions/orders";

interface OrderListProps {
  orders: OrderWithCalculations[];
}

export function OrderList({ orders: initialOrders }: OrderListProps) {
  const [orders, setOrders] = React.useState(initialOrders);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingOrder, setEditingOrder] = React.useState<OrderWithCalculations | null>(null);

  // Calculate stats from local orders state
  const stats = React.useMemo(() => {
    const totalVente = orders.reduce((sum, o) => sum + o.prixVente, 0);
    const totalAchat = orders.reduce((sum, o) => sum + o.prixAchat, 0);
    const totalMarge = totalVente - totalAchat;
    const pourcentageMarge = totalVente > 0 ? Math.round((totalMarge / totalVente) * 100) : 0;
    return {
      totalOrders: orders.length,
      totalVente,
      totalAchat,
      totalMarge,
      pourcentageMarge,
    };
  }, [orders]);

  // Handler for when an order is created or updated
  const handleOrderSaved = (savedOrder: OrderWithCalculations, isUpdate: boolean) => {
    if (isUpdate) {
      setOrders((prev) => prev.map((o) => (o.id === savedOrder.id ? savedOrder : o)));
    } else {
      setOrders((prev) => [savedOrder, ...prev]);
    }
  };

  // Handler for when an order is deleted
  const handleOrderDeleted = (deletedId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== deletedId));
  };

  const filteredOrders = React.useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const query = searchQuery.toLowerCase();
    return orders.filter(
      (order) =>
        order.designation.toLowerCase().includes(query) ||
        order.client.toLowerCase().includes(query) ||
        order.adresse.toLowerCase().includes(query) ||
        order.telephone.includes(query)
    );
  }, [orders, searchQuery]);

  const handleEdit = (order: OrderWithCalculations) => {
    setEditingOrder(order);
    setIsFormOpen(true);
  };

  const handleCloseForm = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) setEditingOrder(null);
  };

  const exportToExcel = () => {
    // Create CSV content
    const headers = ["Date", "Désignation", "Client", "Adresse", "Téléphone", "Prix Vente", "Prix Achat", "Marge", "% Marge"];
    const rows = filteredOrders.map((order) => [
      new Date(order.date).toLocaleDateString("fr-FR"),
      order.designation.replace(/,/g, ";"),
      order.client.replace(/,/g, ";"),
      order.adresse.replace(/,/g, ";"),
      order.telephone,
      order.prixVente.toString(),
      order.prixAchat.toString(),
      order.marge.toString(),
      order.pourcentageMarge.toString() + "%"
    ]);
    
    // Add totals row
    const totals = filteredOrders.reduce((acc, order) => ({
      prixVente: acc.prixVente + order.prixVente,
      prixAchat: acc.prixAchat + order.prixAchat,
      marge: acc.marge + order.marge,
    }), { prixVente: 0, prixAchat: 0, marge: 0 });
    
    const avgMarge = totals.prixVente > 0 ? Math.round((totals.marge / totals.prixVente) * 100) : 0;
    rows.push(["TOTAL", "", "", "", "", totals.prixVente.toString(), totals.prixAchat.toString(), totals.marge.toString(), avgMarge + "%"]);
    
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    
    // Add BOM for Excel UTF-8 compatibility
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `commandes_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion & Suivi des Colis</h1>
          <p className="text-muted-foreground mt-1">
            Suivez vos commandes et analysez vos marges.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="h-4 w-4 mr-2" />
            Exporter Excel
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle commande
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Commandes</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalOrders || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Ventes</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatNumber(stats?.totalVente || 0)} TND</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Achats</CardTitle>
            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatNumber(stats?.totalAchat || 0)} TND</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Marge Totale</CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatNumber(stats?.totalMarge || 0)} TND</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">% Marge Moyenne</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Percent className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats?.pourcentageMarge || 0}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une commande..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Orders Table */}
      <OrderTable orders={filteredOrders} onEdit={handleEdit} onDelete={handleOrderDeleted} />

      {/* Order Form Dialog */}
      <OrderForm
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        order={editingOrder}
        onOrderSaved={handleOrderSaved}
      />
    </div>
  );
}

