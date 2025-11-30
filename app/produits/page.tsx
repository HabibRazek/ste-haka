import { getProducts } from "@/lib/actions/products";
import { ProductList } from "@/components/product-list";

export default async function ProduitsPage() {
  const result = await getProducts();
  const products = result.success ? result.data || [] : [];

  return <ProductList products={products} />;
}

