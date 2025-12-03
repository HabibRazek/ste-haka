import { InvoiceList } from "@/components/invoice-list";
import { getInvoices, getInvoiceStats } from "@/lib/actions/invoices";

export default async function DevisPage() {
  const [invoicesResult, statsResult] = await Promise.all([
    getInvoices(),
    getInvoiceStats(),
  ]);

  const invoices = invoicesResult.success ? invoicesResult.data : [];
  const stats = statsResult.success && statsResult.data ? statsResult.data : null;

  return <InvoiceList initialInvoices={invoices || []} initialStats={stats} />;
}

