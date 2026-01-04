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

  // Daily countdown - starts at beginning of day (12:00am) and ends at midnight
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  // Calculate progress for dynamic fill mode
  const dayProgress = (now.getTime() - startOfDay.getTime()) / (endOfDay.getTime() - startOfDay.getTime());
  const dayFillMode = dayProgress > 0.25 ? "solid" : dayProgress > 0.05 ? "linear" : "random";

  // Monthly countdown - starts at beginning of month and ends at end of current month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const monthProgress = (now.getTime() - startOfMonth.getTime()) / (endOfMonth.getTime() - startOfMonth.getTime());
  const monthFillMode = monthProgress > 0.25 ? "solid" : monthProgress > 0.05 ? "linear" : "random";

  // Yearly countdown - starts at Jan 1 12:00am and ends at end of current year
  const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

  const yearProgress = (now.getTime() - startOfYear.getTime()) / (endOfYear.getTime() - startOfYear.getTime());
  const yearFillMode = yearProgress > 0.25 ? "solid" : yearProgress > 0.05 ? "linear" : "random";

  const exampleTimers = [
    {
      title: "Daily Countdown",
      description: "Countdown to midnight - resets every day",
      timerMode: "countdown",
      startTime: startOfDay,
      endTime: endOfDay,
      fillMode: dayFillMode,
      startColor: "#1e293b",
      endColor: "#8b5cf6",
      isPublic: true,
      shareToken: "daily-countdown-example",
    },
    {
      title: "Monthly Countdown",
      description: `Countdown to the end of ${now.toLocaleString("default", { month: "long" })} - resets every month`,
      timerMode: "countdown",
      startTime: startOfMonth,
      endTime: endOfMonth,
      fillMode: monthFillMode,
      startColor: "#1e293b",
      endColor: "#ec4899",
      isPublic: true,
      shareToken: "monthly-countdown-example",
    },
    {
      title: `${now.getFullYear() + 1} Countdown`,
      description: `Countdown to ${now.getFullYear() + 1} - resets every year`,
      timerMode: "countdown",
      startTime: startOfYear,
      endTime: endOfYear,
      fillMode: yearFillMode,
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
      // Update existing timer with new times and fill mode
      await prisma.timer.update({
        where: { shareToken: timer.shareToken },
        data: {
          startTime: timer.startTime,
          endTime: timer.endTime,
          fillMode: timer.fillMode,
          title: timer.title,
          description: timer.description,
        },
      });
      console.log(`Updated ${timer.title} (fillMode: ${timer.fillMode})`);
    } else {
      // Create new timer
      await prisma.timer.create({
        data: timer,
      });
      console.log(`Created ${timer.title} (fillMode: ${timer.fillMode})`);
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
