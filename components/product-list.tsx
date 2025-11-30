"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Package,
  TrendingUp,
  Boxes,
  DollarSign,
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { ProductForm } from "./product-form";
import { ProductWithMargin, deleteProduct } from "@/lib/actions/products";
import { KpiCard } from "./kpi-card";

interface ProductListProps {
  products: ProductWithMargin[];
}

export function ProductList({ products: initialProducts }: ProductListProps) {
  const [products, setProducts] = React.useState(initialProducts);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<ProductWithMargin | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Calculate stats from local state
  const stats = React.useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const totalValeurStock = products.reduce((sum, p) => sum + (p.prixVente * p.stock), 0);
    const totalMarge = products.reduce((sum, p) => sum + ((p.prixVente - p.prixAchat) * p.stock), 0);

    // Generate sparkline data from products (stock values)
    const stockData = products.slice(0, 7).map(p => p.stock);
    const valeurData = products.slice(0, 7).map(p => p.prixVente * p.stock);
    const margeData = products.slice(0, 7).map(p => (p.prixVente - p.prixAchat) * p.stock);

    return { totalProducts, totalStock, totalValeurStock, totalMarge, stockData, valeurData, margeData };
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleProductSaved = (savedProduct: ProductWithMargin, isUpdate: boolean) => {
    if (isUpdate) {
      setProducts((prev) => prev.map((p) => (p.id === savedProduct.id ? savedProduct : p)));
    } else {
      setProducts((prev) => [savedProduct, ...prev]);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit?")) return;
    setDeletingId(id);
    try {
      const result = await deleteProduct(id);
      if (result.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (product: ProductWithMargin) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleCloseForm = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) setEditingProduct(null);
  };

  const exportToExcel = () => {
    // Create CSV content
    const headers = ["Nom", "Description", "Contenance", "Prix Achat", "Prix Vente", "Marge", "% Marge", "Stock", "Valeur Stock"];
    const rows = filteredProducts.map((product) => [
      product.name.replace(/,/g, ";"),
      (product.description || "").replace(/,/g, ";"),
      (product.contenance || "").replace(/,/g, ";"),
      product.prixAchat.toString(),
      product.prixVente.toString(),
      product.marge.toString(),
      product.pourcentageMarge.toString() + "%",
      product.stock.toString(),
      (product.prixVente * product.stock).toString()
    ]);

    // Add totals row
    const totalStock = filteredProducts.reduce((sum, p) => sum + p.stock, 0);
    const totalValeur = filteredProducts.reduce((sum, p) => sum + (p.prixVente * p.stock), 0);
    const totalMargeExport = filteredProducts.reduce((sum, p) => sum + ((p.prixVente - p.prixAchat) * p.stock), 0);
    rows.push(["TOTAL", "", "", "", "", totalMargeExport.toString(), "", totalStock.toString(), totalValeur.toString()]);

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");

    // Add BOM for Excel UTF-8 compatibility
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `produits_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatNumber = (num: number) => {
    const str = Math.round(num).toString();
    if (str.length <= 6) {
      return str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } else {
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
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Produits</h1>
          <p className="text-muted-foreground mt-1">
            Gérez votre catalogue de produits et votre inventaire.
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
            Nouveau produit
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Produits"
          value={stats.totalProducts}
          icon={<Package className="h-5 w-5" style={{ color: "#84cc16" }} />}
          chartColor="#84cc16"
        />
        <KpiCard
          title="Stock Total"
          value={formatNumber(stats.totalStock)}
          icon={<Boxes className="h-5 w-5" style={{ color: "#84cc16" }} />}
          chartData={stats.stockData}
          chartColor="#84cc16"
        />
        <KpiCard
          title="Valeur du Stock"
          value={`${formatNumber(stats.totalValeurStock)} TND`}
          icon={<DollarSign className="h-5 w-5" style={{ color: "#84cc16" }} />}
          chartData={stats.valeurData}
          chartColor="#84cc16"
        />
        <KpiCard
          title="Marge Potentielle"
          value={`${formatNumber(stats.totalMarge)} TND`}
          icon={<TrendingUp className="h-5 w-5" style={{ color: "#84cc16" }} />}
          chartData={stats.margeData}
          chartColor="#84cc16"
        />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un produit..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-medium mb-2">Aucun produit trouvé</h3>
          <p className="text-sm text-muted-foreground">Ajoutez votre premier produit pour commencer.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Produit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contenance</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Prix Achat</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Prix Vente</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Marge</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-50">
                        {product.images?.length > 0 ? (
                          <Image src={product.images[0]} alt={product.name} fill className="object-contain" />
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{product.name}</span>
                        {product.description && (
                          <span className="text-xs text-muted-foreground line-clamp-1">{product.description}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {product.contenance || "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {formatNumber(product.prixAchat)} TND
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {formatNumber(product.prixVente)} TND
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <span className="text-green-600 font-medium">{formatNumber(product.marge)} TND</span>
                      <span className="text-xs text-muted-foreground ml-1">({product.pourcentageMarge}%)</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {product.stock}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                          {deletingId === product.id ? (
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
                {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} sur {filteredProducts.length} produits
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
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 text-sm">
                Page {currentPage} / {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Product Form Dialog */}
      <ProductForm
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        product={editingProduct}
        onProductSaved={handleProductSaved}
      />
    </div>
  );
}

