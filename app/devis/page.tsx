import { InvoiceList } from "@/components/invoice-list";
import { getInvoices, getInvoiceStats } from "@/lib/actions/invoices";
import { getProducts } from "@/lib/actions/products";

export default async function DevisPage() {
  const [invoicesResult, statsResult, productsResult] = await Promise.all([
    getInvoices(),
    getInvoiceStats(),
    getProducts(),
  ]);

  const invoices = invoicesResult.success ? invoicesResult.data : [];
  const stats = statsResult.success && statsResult.data ? statsResult.data : null;
  const products = productsResult.success && productsResult.data ? productsResult.data : [];

  return <InvoiceList initialInvoices={invoices || []} initialStats={stats} products={products} />;
}

