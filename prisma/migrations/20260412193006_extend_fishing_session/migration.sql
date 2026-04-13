-- CreateEnum
CREATE TYPE "FishingType" AS ENUM ('HERABUNA', 'FLOAT', 'SPINNING', 'FEEDER', 'OTHER');

-- CreateTable
CREATE TABLE "FishingSession" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locationName" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "spotName" TEXT,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "fishingType" "FishingType" NOT NULL DEFAULT 'FLOAT',
    "fishType" TEXT,
    "bait" TEXT,
    "depth" DOUBLE PRECISION,
    "catchesCount" INTEGER NOT NULL DEFAULT 0,
    "totalWeight" DOUBLE PRECISION,
    "notes" TEXT,
    "weatherJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FishingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Catch" (
    "id" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "weight" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "bait" TEXT,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Catch_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Catch" ADD CONSTRAINT "Catch_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "FishingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
