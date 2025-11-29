"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface MemberFormData {
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

export async function getMembers() {
  try {
    const members = await prisma.member.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });
    return { success: true, data: members };
  } catch (error) {
    console.error("Error fetching members:", error);
    return { success: false, error: "Échec de la récupération des membres" };
  }
}

export async function getMember(id: string) {
  try {
    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        tasks: true,
        _count: {
          select: { tasks: true },
        },
      },
    });
    return { success: true, data: member };
  } catch (error) {
    console.error("Error fetching member:", error);
    return { success: false, error: "Échec de la récupération du membre" };
  }
}

export async function createMember(data: MemberFormData) {
  try {
    const member = await prisma.member.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role || null,
        avatar: data.avatar || null,
      },
    });
    revalidatePath("/equipe");
    revalidatePath("/tasks");
    return { success: true, data: member };
  } catch (error: unknown) {
    console.error("Error creating member:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return { success: false, error: "Cet email est déjà utilisé" };
    }
    return { success: false, error: "Échec de la création du membre" };
  }
}

export async function updateMember(id: string, data: MemberFormData) {
  try {
    const member = await prisma.member.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        role: data.role || null,
        avatar: data.avatar || null,
      },
    });
    revalidatePath("/equipe");
    revalidatePath("/tasks");
    return { success: true, data: member };
  } catch (error: unknown) {
    console.error("Error updating member:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return { success: false, error: "Cet email est déjà utilisé" };
    }
    return { success: false, error: "Échec de la mise à jour du membre" };
  }
}

export async function deleteMember(id: string) {
  try {
    // First, unassign all tasks from this member
    await prisma.task.updateMany({
      where: { memberId: id },
      data: { memberId: null },
    });
    
    await prisma.member.delete({
      where: { id },
    });
    revalidatePath("/equipe");
    revalidatePath("/tasks");
    return { success: true };
  } catch (error) {
    console.error("Error deleting member:", error);
    return { success: false, error: "Échec de la suppression du membre" };
  }
}

export async function getMemberStats() {
  try {
    const totalMembers = await prisma.member.count();
    const membersWithTasks = await prisma.member.count({
      where: {
        tasks: {
          some: {},
        },
      },
    });
    return {
      success: true,
      data: {
        total: totalMembers,
        withTasks: membersWithTasks,
      },
    };
  } catch (error) {
    console.error("Error fetching member stats:", error);
    return { success: false, error: "Échec de la récupération des statistiques" };
  }
}

