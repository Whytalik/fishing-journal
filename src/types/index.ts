import { FishingType, Prisma } from "../generated/client";

export interface Catch {
  id: string;
  species: string;
  weight?: number;
  length?: number;
  bait?: string;
  sessionId: string;
}

export interface WeatherData {
  temperature?: number;
  windSpeed?: number;
  windDirection?: string;
  pressure?: number;
  humidity?: number;
  description?: string;
}

export interface FishingSession {
  id: string;
  date: Date;
  locationName: string;
  latitude?: number;
  longitude?: number;
  spotName?: string;
  startTime?: Date;
  endTime?: Date;
  fishingType: FishingType;
  fishType?: string;
  bait?: string;
  depth?: number;
  catchesCount: number;
  totalWeight?: number;
  notes?: string;
  weatherJson?: Prisma.JsonValue | WeatherData;
  catches?: Catch[];
  createdAt: Date;
  updatedAt: Date;
}
