"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Percent,
  Package
} from "lucide-react";
import Image from "next/image";
import { OrderForm } from "./order-form";
import { OrderTable } from "./order-table";
import { OrderWithCalculations } from "@/lib/actions/orders";
import { KpiCard } from "./kpi-card";

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

    // Generate sparkline data from last 7 orders (or less)
    const recentOrders = orders.slice(0, 7).reverse();
    const ventesData = recentOrders.map(o => o.prixVente);
    const achatsData = recentOrders.map(o => o.prixAchat);
    const margesData = recentOrders.map(o => o.marge);

    return {
      totalOrders: orders.length,
      totalVente,
      totalAchat,
      totalMarge,
      pourcentageMarge,
      ventesData,
      achatsData,
      margesData,
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
            <Image
              src="/Microsoft_Office_Excel.svg"
              alt="Excel"
              width={18}
              height={18}
              className="mr-2"
            />
            Exporter Excel
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle commande
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Total Commandes"
          value={stats?.totalOrders || 0}
          icon={<Package className="h-5 w-5" style={{ color: "#84cc16" }} />}
          chartColor="#84cc16"
        />
        <KpiCard
          title="Total Ventes"
          value={`${formatNumber(stats?.totalVente || 0)} TND`}
          icon={<ShoppingCart className="h-5 w-5" style={{ color: "#84cc16" }} />}
          chartData={stats?.ventesData}
          chartColor="#84cc16"
        />
        <KpiCard
          title="Total Achats"
          value={`${formatNumber(stats?.totalAchat || 0)} TND`}
          icon={<DollarSign className="h-5 w-5" style={{ color: "#84cc16" }} />}
          chartData={stats?.achatsData}
          chartColor="#84cc16"
        />
        <KpiCard
          title="Marge Totale"
          value={`${formatNumber(stats?.totalMarge || 0)} TND`}
          icon={<TrendingUp className="h-5 w-5" style={{ color: "#84cc16" }} />}
          chartData={stats?.margesData}
          chartColor="#84cc16"
        />
        <KpiCard
          title="% Marge Moyenne"
          value={`${stats?.pourcentageMarge || 0}%`}
          icon={<Percent className="h-5 w-5" style={{ color: "#84cc16" }} />}
          chartColor="#84cc16"
        />
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

