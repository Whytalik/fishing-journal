"use server";

import prisma from "@/db/prisma";
import { FishingType, Prisma } from "@/generated/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSessionWeather } from "@/lib/weather";
import { auth } from "@/auth";

const sessionSchema = z.object({
  date: z.string().transform((val) => new Date(val)),
  locationName: z.string().min(1, "Назва локації обов'язкова"),
  spotName: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  peakStartTime: z.string().optional(),
  peakEndTime:   z.string().optional(),
  fishingType:  z.nativeEnum(FishingType),
  fishType:     z.string().optional(),
  bait:         z.string().optional(),
  depth:        z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
  catchesCount: z.string().transform((val) => parseInt(val) || 0),
  notes:        z.string().optional(),
});

export async function createSession(data?: any) {
  const sessionUser = await auth();
  if (!sessionUser?.user?.id) return { error: "Не авторизовано" };

  try {
    const newSession = await prisma.fishingSession.create({
      data: {
        userId: sessionUser.user.id,
        locationName: data?.locationName || "Нова точка",
        date: data?.date ? new Date(data.date) : new Date(),
        fishingType: data?.fishingType || "FLOAT",
        status: "COMPLETED", // Manual logs are completed by default unless started via Go Live
      }
    });

    revalidatePath("/sessions");
    return { success: true, sessionId: newSession.id };
  } catch (error) {
    return { error: "Не вдалося створити сесію" };
  }
}

export async function updateSession(sessionId: string, data: any) {
  const sessionUser = await auth();
  if (!sessionUser?.user?.id) return { error: "Не авторизовано" };

  try {
    const updateData: any = {};
    const d = data.date ? new Date(data.date) : new Date();
    const datePrefix = d.toISOString().split('T')[0];

    // Helper to safely handle time strings
    const parseTime = (timeStr: string | undefined) => {
      if (!timeStr || !timeStr.includes(':')) return undefined;
      const date = new Date(`${datePrefix}T${timeStr}:00`);
      return isNaN(date.getTime()) ? undefined : date;
    };

    if (data.locationName !== undefined) updateData.locationName = data.locationName;
    if (data.spotName !== undefined) updateData.spotName = data.spotName;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.fishingType !== undefined) updateData.fishingType = data.fishingType;
    if (data.fishType !== undefined) updateData.fishType = data.fishType;
    if (data.bait !== undefined) updateData.bait = data.bait;
    if (data.notes !== undefined) updateData.notes = data.notes;
    
    if (data.startTime !== undefined) updateData.startTime = parseTime(data.startTime);
    if (data.endTime !== undefined) updateData.endTime = parseTime(data.endTime);
    if (data.peakStartTime !== undefined) updateData.peakStartTime = parseTime(data.peakStartTime);
    if (data.peakEndTime !== undefined) updateData.peakEndTime = parseTime(data.peakEndTime);

    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;

    if (data.depth !== undefined) {
      const val = parseFloat(data.depth);
      updateData.depth = isNaN(val) ? null : val;
    }
    
    if (data.totalWeight !== undefined) {
      const val = parseFloat(data.totalWeight);
      updateData.totalWeight = isNaN(val) ? null : val;
    }

    await prisma.fishingSession.update({
      where: { id: sessionId, userId: sessionUser.user.id },
      data: updateData
    });

    revalidatePath(`/sessions/${sessionId}`);
    return { success: true };
  } catch (error) {
    console.error("Autosave error:", error);
    return { error: "Автозбереження не вдалося" };
  }
}

export async function startLiveSession(data: { latitude: number; longitude: number; locationName: string }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Не авторизовано" };

  try {
    const newSession = await prisma.fishingSession.create({
      data: {
        userId: session.user.id,
        status: "ACTIVE",
        date: new Date(),
        startTime: new Date(),
        locationName: data.locationName,
        latitude: data.latitude,
        longitude: data.longitude,
      }
    });

    revalidatePath("/");
    revalidatePath("/sessions");
    return { success: true, sessionId: newSession.id };
  } catch (error) {
    console.error("Failed to start live session:", error);
    return { error: "Не вдалося розпочати сесію" };
  }
}

export async function endSession(sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Не авторизовано" };

  try {
    const fishingSession = await prisma.fishingSession.findUnique({
      where: { id: sessionId },
      include: { catches: true }
    });

    if (!fishingSession || fishingSession.userId !== session.user.id) {
      return { error: "Сесію не знайдено" };
    }

    // Auto-calculate peak bite time if catches exist
    let peakStartTime = fishingSession.peakStartTime;
    let peakEndTime = fishingSession.peakEndTime;

    if (fishingSession.catches.length > 0) {
      // Sort catches by time
      const sortedCatches = [...fishingSession.catches].sort(
        (a, b) => a.caughtAt.getTime() - b.caughtAt.getTime()
      );
      
      // Simple logic: Peak starts at first catch and ends at last catch
      // In advanced version we could cluster them.
      peakStartTime = sortedCatches[0].caughtAt;
      peakEndTime = sortedCatches[sortedCatches.length - 1].caughtAt;
    }

    await prisma.fishingSession.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        endTime: new Date(),
        peakStartTime,
        peakEndTime,
      }
    });

    revalidatePath(`/sessions/${sessionId}`);
    revalidatePath("/sessions");
    return { success: true };
  } catch (error) {
    console.error("Failed to end session:", error);
    return { error: "Не вдалося завершити сесію" };
  }
}

export async function deleteSession(sessionId: string) {
  const sessionUser = await auth();
  if (!sessionUser?.user?.id) return { error: "Не авторизовано" };

  try {
    const fishingSession = await prisma.fishingSession.findUnique({
      where: { id: sessionId },
    });

    if (!fishingSession || fishingSession.userId !== sessionUser.user.id) {
      return { error: "Сесію не знайдено" };
    }

    await prisma.fishingSession.delete({
      where: { id: sessionId }
    });

    revalidatePath("/sessions");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete session:", error);
    return { error: "Не вдалося видалити сесію" };
  }
}

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function logCatch(data: { 
  sessionId: string; 
  species: string; 
  weight?: number; 
  length?: number;
  caughtAt?: Date;
  latitude?: number;
  longitude?: number;
  photo?: FormData;
}) {
  const sessionUser = await auth();
  if (!sessionUser?.user?.id) return { error: "Не авторизовано" };

  try {
    const fishingSession = await prisma.fishingSession.findUnique({
      where: { id: data.sessionId }
    });

    if (!fishingSession || fishingSession.userId !== sessionUser.user.id) {
      return { error: "Сесію не знайдено" };
    }

    const catchTime = data.caughtAt || new Date();
    const lat = data.latitude || fishingSession.latitude;
    const lng = data.longitude || fishingSession.longitude;

    let weatherSnapshot: Prisma.InputJsonValue | undefined = undefined;
    let photoUrl: string | undefined = undefined;

    // Handle Photo Upload
    const photoFile = data.photo?.get("file") as File;
    if (photoFile && photoFile.size > 0) {
      const bytes = await photoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uploadDir = join(process.cwd(), "public", "uploads");
      try { await mkdir(uploadDir, { recursive: true }); } catch (e) {}
      
      const fileName = `${Date.now()}-${photoFile.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const path = join(uploadDir, fileName);
      await writeFile(path, buffer);
      photoUrl = `/uploads/${fileName}`;
    }

    // Fetch Weather Snapshot for the specific catch time
    if (lat !== null && lng !== null) {
      const weather = await getSessionWeather(
        lat,
        lng,
        catchTime,
        catchTime, // Start and end are same for a point snapshot
        catchTime
      );
      if (weather) {
        weatherSnapshot = weather as unknown as Prisma.InputJsonValue;
      }
    }

    await prisma.catch.create({
      data: {
        sessionId: data.sessionId,
        species: data.species,
        weight: data.weight,
        length: data.length,
        caughtAt: catchTime,
        weatherSnapshot,
        photoUrl,
      }
    });

    // Update session aggregates
    await prisma.fishingSession.update({
      where: { id: data.sessionId },
      data: {
        catchesCount: { increment: 1 },
        totalWeight: data.weight ? { increment: data.weight } : undefined,
      }
    });

    revalidatePath(`/sessions/${data.sessionId}`);
    return { success: true, photoUrl };
  } catch (error) {
    console.error("Failed to log catch:", error);
    return { error: "Не вдалося записати улов" };
  }
}
