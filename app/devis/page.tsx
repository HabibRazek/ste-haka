import { InvoiceList } from "@/components/invoice-list";
import { getInvoices, getInvoiceStats } from "@/lib/actions/invoices";
import { getProducts } from "@/lib/actions/products";
import { getPrintJobs } from "@/lib/actions/print-jobs";

export default async function DevisPage() {
  const [invoicesResult, statsResult, productsResult, printJobsResult] = await Promise.all([
    getInvoices(),
    getInvoiceStats(),
    getProducts(),
    getPrintJobs(),
  ]);

  const invoices = invoicesResult.success ? invoicesResult.data : [];
  const stats = statsResult.success && statsResult.data ? statsResult.data : null;
  const products = productsResult.success && productsResult.data ? productsResult.data : [];
  const printJobs = printJobsResult.success && printJobsResult.data ? printJobsResult.data : [];

  return <InvoiceList initialInvoices={invoices || []} initialStats={stats} products={products} printJobs={printJobs} />;
}

