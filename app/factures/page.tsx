import { FactureList } from "@/components/facture-list";
import { getFactures, getFactureStats } from "@/lib/actions/factures";
import { getProducts } from "@/lib/actions/products";
import { getPrintJobs } from "@/lib/actions/print-jobs";

export default async function FacturesPage() {
  const [facturesResult, statsResult, productsResult, printJobsResult] = await Promise.all([
    getFactures(),
    getFactureStats(),
    getProducts(),
    getPrintJobs(),
  ]);

  const factures = facturesResult.success ? facturesResult.data : [];
  const stats = statsResult.success && statsResult.data ? statsResult.data : null;
  const products = productsResult.success && productsResult.data ? productsResult.data : [];
  const printJobs = printJobsResult.success && printJobsResult.data ? printJobsResult.data : [];

  return <FactureList initialFactures={factures || []} initialStats={stats} products={products} printJobs={printJobs} />;
}

