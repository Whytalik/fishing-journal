"use server";

import prisma from "@/db/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getSpecies() {
  const session = await auth();
  if (!session?.user?.id) return [];

  // Get global defaults (userId is null) + user specific ones
  return prisma.fishSpecies.findMany({
    where: {
      OR: [
        { userId: null },
        { userId: session.user.id }
      ]
    },
    orderBy: { name: 'asc' }
  });
}

export async function addSpecies(name: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Ви повинні увійти в систему" };
  }

  if (!name || name.trim().length < 2) {
    return { error: "Назва виду повинна містити принаймні 2 символи" };
  }

  try {
    const trimmedName = name.trim();
    
    // Check if it already exists for this user or globally
    const existing = await prisma.fishSpecies.findFirst({
      where: {
        name: trimmedName,
        OR: [{ userId: null }, { userId: session.user.id }]
      }
    });

    if (existing) {
      return { error: "Цей вид вже є у вашому списку" };
    }

    await prisma.fishSpecies.create({
      data: {
        name: trimmedName,
        userId: session.user.id
      }
    });

    revalidatePath("/species");
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to add species:", error);
    return { error: "Не вдалося додати вид" };
  }
}

export async function deleteSpecies(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Не авторизовано" };

  try {
    // Only allow deleting user's own species
    const species = await prisma.fishSpecies.findUnique({ where: { id } });
    
    if (!species || species.userId !== session.user.id) {
      return { error: "Ви можете видаляти лише власні види" };
    }

    await prisma.fishSpecies.delete({ where: { id } });
    revalidatePath("/species");
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return { error: "Не вдалося видалити" };
  }
}
