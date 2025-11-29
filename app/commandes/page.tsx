import { getOrders } from "@/lib/actions/orders";
import { OrderList } from "@/components/order-list";

export default async function CommandesPage() {
  const result = await getOrders();
  const orders = result.success ? result.data || [] : [];

  return <OrderList orders={orders} />;
}

