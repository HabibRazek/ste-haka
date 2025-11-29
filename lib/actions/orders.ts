"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type OrderFormData = {
  date: string;
  designation: string;
  client: string;
  adresse: string;
  telephone: string;
  prixVente: number;
  prixAchat: number;
};

export type OrderWithCalculations = {
  id: string;
  date: Date;
  designation: string;
  client: string;
  adresse: string;
  telephone: string;
  prixVente: number;
  prixAchat: number;
  marge: number;
  pourcentageMarge: number;
  createdAt: Date;
  updatedAt: Date;
};

// Get all orders with calculated fields
export async function getOrders() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { date: "desc" },
    });

    const ordersWithCalculations: OrderWithCalculations[] = orders.map((order) => ({
      ...order,
      marge: order.prixVente - order.prixAchat,
      pourcentageMarge: order.prixVente > 0 
        ? Math.round(((order.prixVente - order.prixAchat) / order.prixVente) * 100) 
        : 0,
    }));

    return { success: true, data: ordersWithCalculations };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { success: false, error: "Erreur lors de la récupération des commandes" };
  }
}

// Get single order
export async function getOrder(id: string) {
  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return { success: false, error: "Commande non trouvée" };
    }
    const orderWithCalc: OrderWithCalculations = {
      ...order,
      marge: order.prixVente - order.prixAchat,
      pourcentageMarge: order.prixVente > 0 
        ? Math.round(((order.prixVente - order.prixAchat) / order.prixVente) * 100) 
        : 0,
    };
    return { success: true, data: orderWithCalc };
  } catch (error) {
    console.error("Error fetching order:", error);
    return { success: false, error: "Erreur lors de la récupération de la commande" };
  }
}

// Create order
export async function createOrder(data: OrderFormData) {
  try {
    const order = await prisma.order.create({
      data: {
        date: new Date(data.date),
        designation: data.designation,
        client: data.client,
        adresse: data.adresse,
        telephone: data.telephone,
        prixVente: data.prixVente,
        prixAchat: data.prixAchat,
      },
    });
    revalidatePath("/commandes");
    return { success: true, data: order };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, error: "Erreur lors de la création de la commande" };
  }
}

// Update order
export async function updateOrder(id: string, data: OrderFormData) {
  try {
    const order = await prisma.order.update({
      where: { id },
      data: {
        date: new Date(data.date),
        designation: data.designation,
        client: data.client,
        adresse: data.adresse,
        telephone: data.telephone,
        prixVente: data.prixVente,
        prixAchat: data.prixAchat,
      },
    });
    revalidatePath("/commandes");
    return { success: true, data: order };
  } catch (error) {
    console.error("Error updating order:", error);
    return { success: false, error: "Erreur lors de la mise à jour de la commande" };
  }
}

// Delete order
export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({ where: { id } });
    revalidatePath("/commandes");
    return { success: true };
  } catch (error) {
    console.error("Error deleting order:", error);
    return { success: false, error: "Erreur lors de la suppression de la commande" };
  }
}

// Get order statistics
export async function getOrderStats() {
  try {
    const orders = await prisma.order.findMany();
    
    const totalVente = orders.reduce((sum, o) => sum + o.prixVente, 0);
    const totalAchat = orders.reduce((sum, o) => sum + o.prixAchat, 0);
    const totalMarge = totalVente - totalAchat;
    const pourcentageMarge = totalVente > 0 ? Math.round((totalMarge / totalVente) * 100) : 0;
    
    return {
      success: true,
      data: {
        totalOrders: orders.length,
        totalVente,
        totalAchat,
        totalMarge,
        pourcentageMarge,
      },
    };
  } catch (error) {
    console.error("Error fetching order stats:", error);
    return { success: false, error: "Erreur lors de la récupération des statistiques" };
  }
}

