import { PrintJobList } from "@/components/print-job-list";
import { getPrintJobs, getPrintJobStats } from "@/lib/actions/print-jobs";

export default async function ImpressionPage() {
  const [jobsResult, statsResult] = await Promise.all([
    getPrintJobs(),
    getPrintJobStats(),
  ]);

  const jobs = jobsResult.success ? jobsResult.data : [];
  const stats = statsResult.success && statsResult.data ? statsResult.data : null;

  return <PrintJobList initialJobs={jobs || []} initialStats={stats} />;
}

