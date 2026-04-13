import { PrismaClient, FishingType } from "../src/generated/client";
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Get first user
  const user = await prisma.user.findFirst();
  
  if (!user) {
    console.error("No user found. Please register a user first.");
    return;
  }

  console.log(`Adding seed data for user: ${user.email}`);

  // Default Species
  const defaultSpecies = [
    "Carp", "Pike", "Zander", "Perch", "Bream", "Roach", "Crucian Carp", "Catfish", "Trout", "Tench"
  ];

  for (const name of defaultSpecies) {
    const exists = await prisma.fishSpecies.findFirst({
      where: { name, userId: null }
    });
    
    if (!exists) {
      await prisma.fishSpecies.create({
        data: { name, userId: null }
      });
    }
  }

  const sessions = [
    // FLOAT
    {
      userId: user.id,
      date: new Date("2024-05-10"),
      locationName: "Dniprovska Zatoka",
      fishingType: FishingType.FLOAT,
      fishType: "Crucian Carp",
      bait: "Corn",
      depth: 1.5,
      catchesCount: 12,
      totalWeight: 2.4,
      notes: "Early morning was great. High activity.",
    },
    {
      userId: user.id,
      date: new Date("2024-05-15"),
      locationName: "Lake Telbin",
      fishingType: FishingType.FLOAT,
      fishType: "Roach",
      bait: "Worms",
      depth: 2.0,
      catchesCount: 8,
      totalWeight: 1.2,
      notes: "Windy day, but roach were biting.",
    },
    // SPINNING
    {
      userId: user.id,
      date: new Date("2024-06-02"),
      locationName: "Desna River",
      fishingType: FishingType.SPINNING,
      fishType: "Pike",
      bait: "Wobbler 110mm",
      catchesCount: 3,
      totalWeight: 4.5,
      notes: "Caught a 2.5kg pike near the reeds.",
    },
    {
      userId: user.id,
      date: new Date("2024-06-10"),
      locationName: "Kyiv Reservoir",
      fishingType: FishingType.SPINNING,
      fishType: "Zander",
      bait: "Silicone 4 inch",
      catchesCount: 2,
      totalWeight: 3.1,
      notes: "Deep jigging at 8 meters.",
    },
    // FEEDER
    {
      userId: user.id,
      date: new Date("2024-07-05"),
      locationName: "Kaniv Reservoir",
      fishingType: FishingType.FEEDER,
      fishType: "Bream",
      bait: "Maggots + Pellets",
      depth: 6.5,
      catchesCount: 15,
      totalWeight: 8.2,
      notes: "Best feeder session this year. Peak at 7 AM.",
      peakStartTime: new Date("2024-07-05T06:00:00"),
      peakEndTime: new Date("2024-07-05T08:30:00"),
    },
    {
      userId: user.id,
      date: new Date("2024-07-12"),
      locationName: "Ros River",
      fishingType: FishingType.FEEDER,
      fishType: "Carp",
      bait: "Method feeder, Pineapple boilies",
      depth: 3.5,
      catchesCount: 4,
      totalWeight: 6.8,
      notes: "Slow day, but big fish.",
    },
    // HERABUNA
    {
      userId: user.id,
      date: new Date("2024-08-01"),
      locationName: "Private Pond 'Golden Fish'",
      fishingType: FishingType.HERABUNA,
      fishType: "Crucian",
      bait: "Marukyu dough",
      depth: 1.2,
      catchesCount: 25,
      totalWeight: 5.5,
      notes: "Classic Herabuna style. Very sensitive float.",
    },
    {
      userId: user.id,
      date: new Date("2024-08-14"),
      locationName: "Countryside Lake",
      fishingType: FishingType.HERABUNA,
      fishType: "Carp",
      bait: "Potatoes + Mix",
      depth: 0.8,
      catchesCount: 6,
      totalWeight: 4.2,
      notes: "Shallow water fishing.",
    },
    // OTHER
    {
      userId: user.id,
      date: new Date("2024-09-05"),
      locationName: "Mountain Stream",
      fishingType: FishingType.OTHER,
      fishType: "Trout",
      bait: "Fly",
      catchesCount: 5,
      totalWeight: 1.5,
      notes: "Fly fishing debut. Amazing nature.",
    },
    {
      userId: user.id,
      date: new Date("2024-09-20"),
      locationName: "Sea Coast",
      fishingType: FishingType.OTHER,
      fishType: "Goby",
      bait: "Shrimp",
      depth: 4.0,
      catchesCount: 40,
      totalWeight: 3.0,
      notes: "Relaxed sea fishing from the pier.",
    },
  ];

  for (const session of sessions) {
    await prisma.fishingSession.create({
      data: session
    });
  }

  console.log("Seed data added successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
