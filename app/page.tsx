import { getDashboardStats } from "@/lib/actions/dashboard";
import { DashboardWrapper } from "@/components/dashboard-wrapper";

export default async function Dashboard() {
  const stats = await getDashboardStats();

  return <DashboardWrapper stats={stats} />;
}
