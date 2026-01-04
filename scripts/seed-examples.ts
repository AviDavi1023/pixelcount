import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "@/src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Load environment variables from .env
config({ path: resolve(__dirname, "../.env") });

// Create a direct connection for seeding (not pooled)
const pool = new pg.Pool({
  connectionString: process.env.DIRECT_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
} as any);

async function main() {
  console.log("Seeding example timers...");

  // Get current date/time
  const now = new Date();

  // Daily countdown - ends at midnight tonight
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  // Monthly countdown - ends at end of current month
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Yearly countdown - ends at end of current year
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

  const exampleTimers = [
    {
      title: "Daily Countdown",
      description: "Countdown to midnight - resets every day",
      timerMode: "countdown",
      startTime: now,
      endTime: endOfDay,
      fillMode: "random",
      startColor: "#1e293b",
      endColor: "#8b5cf6",
      isPublic: true,
      shareToken: "daily-countdown-example",
    },
    {
      title: "Monthly Countdown",
      description: `Countdown to the end of ${now.toLocaleString("default", { month: "long" })} - resets every month`,
      timerMode: "countdown",
      startTime: now,
      endTime: endOfMonth,
      fillMode: "linear",
      startColor: "#1e293b",
      endColor: "#ec4899",
      isPublic: true,
      shareToken: "monthly-countdown-example",
    },
    {
      title: `${now.getFullYear() + 1} Countdown`,
      description: `Countdown to ${now.getFullYear() + 1} - resets every year`,
      timerMode: "countdown",
      startTime: now,
      endTime: endOfYear,
      fillMode: "solid",
      startColor: "#1e293b",
      endColor: "#06b6d4",
      isPublic: true,
      shareToken: "yearly-countdown-example",
    },
  ];

  for (const timer of exampleTimers) {
    const existing = await prisma.timer.findUnique({
      where: { shareToken: timer.shareToken },
    });

    if (existing) {
      // Update existing timer with new end times
      await prisma.timer.update({
        where: { shareToken: timer.shareToken },
        data: {
          startTime: timer.startTime,
          endTime: timer.endTime,
          title: timer.title,
          description: timer.description,
        },
      });
      console.log(`Updated ${timer.title}`);
    } else {
      // Create new timer
      await prisma.timer.create({
        data: timer,
      });
      console.log(`Created ${timer.title}`);
    }
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
