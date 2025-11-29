"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Priority } from "@prisma/client";

export type TaskFormData = {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  memberId?: string;
};

export async function getTasks() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
      include: {
        member: true,
      },
    });
    return { success: true, data: tasks };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return { success: false, error: "Échec de la récupération des tâches" };
  }
}

export async function getTaskStats() {
  try {
    const [total, completed, pending, highPriority] = await Promise.all([
      prisma.task.count(),
      prisma.task.count({ where: { completed: true } }),
      prisma.task.count({ where: { completed: false } }),
      prisma.task.count({
        where: { priority: "HIGH", completed: false },
      }),
    ]);

    // Get tasks due today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueToday = await prisma.task.count({
      where: {
        dueDate: {
          gte: today,
          lt: tomorrow,
        },
        completed: false,
      },
    });

    // Get overdue tasks
    const overdue = await prisma.task.count({
      where: {
        dueDate: {
          lt: today,
        },
        completed: false,
      },
    });

    return {
      success: true,
      data: {
        total,
        completed,
        pending,
        highPriority,
        dueToday,
        overdue,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      },
    };
  } catch (error) {
    console.error("Error fetching task stats:", error);
    return { success: false, error: "Failed to fetch task statistics" };
  }
}

export async function createTask(formData: TaskFormData) {
  try {
    const task = await prisma.task.create({
      data: {
        title: formData.title,
        description: formData.description || null,
        priority: formData.priority,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        memberId: formData.memberId || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/tasks");
    revalidatePath("/equipe");

    return { success: true, data: task };
  } catch (error) {
    console.error("Error creating task:", error);
    return { success: false, error: "Échec de la création de la tâche" };
  }
}

export async function updateTask(
  id: string,
  formData: Partial<TaskFormData> & { completed?: boolean }
) {
  try {
    const updateData: {
      title?: string;
      description?: string | null;
      priority?: Priority;
      dueDate?: Date | null;
      completed?: boolean;
      memberId?: string | null;
    } = {};

    if (formData.title !== undefined) updateData.title = formData.title;
    if (formData.description !== undefined)
      updateData.description = formData.description || null;
    if (formData.priority !== undefined) updateData.priority = formData.priority;
    if (formData.dueDate !== undefined)
      updateData.dueDate = formData.dueDate ? new Date(formData.dueDate) : null;
    if (formData.completed !== undefined)
      updateData.completed = formData.completed;
    if (formData.memberId !== undefined)
      updateData.memberId = formData.memberId || null;

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/");
    revalidatePath("/tasks");
    revalidatePath("/equipe");

    return { success: true, data: task };
  } catch (error) {
    console.error("Error updating task:", error);
    return { success: false, error: "Échec de la mise à jour de la tâche" };
  }
}

export async function deleteTask(id: string) {
  try {
    await prisma.task.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/tasks");
    revalidatePath("/equipe");

    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    return { success: false, error: "Échec de la suppression de la tâche" };
  }
}

export async function toggleTaskComplete(id: string, completed: boolean) {
  return updateTask(id, { completed });
}

