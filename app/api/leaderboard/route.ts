import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const sortBy = searchParams.get("sort") || "trending"; // trending, new, popular
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    let orderBy: any = { createdAt: "desc" };
    
    if (sortBy === "trending") {
      orderBy = [{ createdAt: "desc" }];
    } else if (sortBy === "popular") {
      orderBy = [{ viewCount: "desc" }, { createdAt: "desc" }];
    }

    const where: any = { isPublic: true };

    if (category && category !== "all") {
      where.category = category;
    }

    const [timers, total] = await Promise.all([
      prisma.timer.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          shareToken: true,
          viewCount: true,
          remixCount: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          _count: {
            select: { likes: true },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.timer.count({ where }),
    ]);

    // Calculate trending score
    const now = Date.now();
    const timerData = timers.map((timer: any) => {
      const hoursAgo = (now - timer.createdAt.getTime()) / (1000 * 60 * 60);
      const trendingScore =
        (timer._count.likes * 2 + timer.viewCount) / (hoursAgo + 1);

      return {
        ...timer,
        likeCount: timer._count.likes,
        trendingScore,
        _count: undefined,
      };
    });

    // Sort by trending score if trending is selected
    if (sortBy === "trending") {
      timerData.sort((a: any, b: any) => b.trendingScore - a.trendingScore);
    }

    return NextResponse.json({
      timers: timerData,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
