import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Most viewed this week
    const mostViewedWeek = await prisma.timer.findMany({
      where: {
        isPublic: true,
        createdAt: { gte: oneWeekAgo },
      },
      orderBy: { viewCount: "desc" },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    // Most liked this month
    const mostLikedMonth = await prisma.timer.findMany({
      where: {
        isPublic: true,
        createdAt: { gte: oneMonthAgo },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: {
        likes: {
          _count: "desc",
        },
      },
      take: 10,
    });

    // All-time most viewed
    const allTimeViewed = await prisma.timer.findMany({
      where: {
        isPublic: true,
      },
      orderBy: { viewCount: "desc" },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    return NextResponse.json({
      mostViewedWeek,
      mostLikedMonth,
      allTimeViewed,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
