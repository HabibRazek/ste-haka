"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type ProductFormData = {
  name: string;
  description?: string;
  contenance?: string;
  images?: string[];
  prixAchat: number;
  prixVente: number;
  stock?: number;
};

export interface Product {
  id: string;
  name: string;
  description: string | null;
  contenance: string | null;
  images: string[];
  prixAchat: number;
  prixVente: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithMargin extends Product {
  marge: number;
  pourcentageMarge: number;
}

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    
    const productsWithMargin: ProductWithMargin[] = products.map((product) => ({
      ...product,
      marge: product.prixVente - product.prixAchat,
      pourcentageMarge: product.prixVente > 0 
        ? Math.round(((product.prixVente - product.prixAchat) / product.prixVente) * 100) 
        : 0,
    }));
    
    return { success: true, data: productsWithMargin };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { success: false, error: "Échec de la récupération des produits" };
  }
}

export async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      return { success: false, error: "Produit non trouvé" };
    }
    return { success: true, data: product };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { success: false, error: "Échec de la récupération du produit" };
  }
}

export async function createProduct(data: ProductFormData) {
  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description || null,
        contenance: data.contenance || null,
        images: data.images || [],
        prixAchat: data.prixAchat,
        prixVente: data.prixVente,
        stock: data.stock || 0,
      },
    });
    revalidatePath("/produits");
    return { success: true, data: product };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: "Échec de la création du produit" };
  }
}

export async function updateProduct(id: string, data: ProductFormData) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        contenance: data.contenance || null,
        images: data.images || [],
        prixAchat: data.prixAchat,
        prixVente: data.prixVente,
        stock: data.stock || 0,
      },
    });
    revalidatePath("/produits");
    return { success: true, data: product };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: "Échec de la mise à jour du produit" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });
    revalidatePath("/produits");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "Échec de la suppression du produit" };
  }
}

export async function getProductStats() {
  try {
    const products = await prisma.product.findMany();
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const totalValeurStock = products.reduce((sum, p) => sum + (p.prixVente * p.stock), 0);
    const totalMarge = products.reduce((sum, p) => sum + ((p.prixVente - p.prixAchat) * p.stock), 0);
    
    return { 
      success: true, 
      data: { totalProducts, totalStock, totalValeurStock, totalMarge } 
    };
  } catch (error) {
    console.error("Error fetching product stats:", error);
    return { success: false, error: "Échec de la récupération des statistiques" };
  }
}

