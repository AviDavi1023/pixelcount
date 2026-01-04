import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST() {
  try {
    const now = new Date();

    // Daily countdown - starts at beginning of day (12:00am UTC) and ends at midnight UTC
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    // Monthly countdown - starts at beginning of month (UTC) and ends at end of current month (UTC)
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

    // Yearly countdown - starts at Jan 1 12:00am UTC and ends at end of current year (UTC)
    const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0));
    const endOfYear = new Date(Date.UTC(now.getUTCFullYear(), 11, 31, 23, 59, 59, 999));

    // Update example timers
    await Promise.all([
      prisma.timer.updateMany({
        where: { shareToken: "daily-countdown-example" },
        data: {
          startTime: startOfDay,
          endTime: endOfDay,
        },
      }),
      prisma.timer.updateMany({
        where: { shareToken: "monthly-countdown-example" },
        data: {
          startTime: startOfMonth,
          endTime: endOfMonth,
          title: "Monthly Countdown",
          description: `Countdown to the end of ${now.toLocaleString("default", { month: "long" })} - resets every month`,
        },
      }),
      prisma.timer.updateMany({
        where: { shareToken: "yearly-countdown-example" },
        data: {
          startTime: startOfYear,
          endTime: endOfYear,
          title: `${now.getFullYear()} Countdown`,
          description: `Countdown to the end of ${now.getFullYear()} - resets every year`,
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Example timers regenerated" });
  } catch (error: any) {
    console.error("Error regenerating example timers:", error);
    return NextResponse.json(
      { error: "Failed to regenerate timers" },
      { status: 500 }
    );
  }
}
