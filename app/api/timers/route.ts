import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { ensureCoreSchema } from "@/app/lib/ensure-schema";
import { getServerSession } from "next-auth";

// GET /api/timers - Get all public timers or user's timers
export async function GET(request: NextRequest) {
  try {
    await ensureCoreSchema();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const category = searchParams.get("category");
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    let where: any = {};

    if (userId) {
      where.userId = userId;
    } else {
      where.isPublic = true;
    }

    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (category && category !== "all") {
      where.category = category;
    }

    const [timers, totalCount] = await Promise.all([
      prisma.timer.findMany({
        where,
        orderBy:
          sortBy === "title"
            ? { title: "asc" }
            : sortBy === "views"
            ? { viewCount: "desc" }
            : { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              image: true,
            },
          },
          _count: {
            select: {
              likes: true,
            },
          },
        },
        skip,
        take: limit,
      }),
      prisma.timer.count({ where }),
    ]);

    // Filter out timers completed for more than 1 hour
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const filteredTimers = timers.filter(timer => {
      const endTime = new Date(timer.endTime);
      return endTime > oneHourAgo;
    });

    // Sort: pin example timers to top
    const sortedTimers = filteredTimers.sort((a, b) => {
      const aIsExample = a.shareToken.includes('example') || a.shareToken.includes('countdown');
      const bIsExample = b.shareToken.includes('example') || b.shareToken.includes('countdown');
      
      if (aIsExample && !bIsExample) return -1;
      if (!aIsExample && bIsExample) return 1;
      return 0;
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      timers: sortedTimers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error: any) {
    console.error("Error fetching timers:", error);
    return NextResponse.json({
      timers: [],
      pagination: { page: 1, limit: 50, totalCount: 0, totalPages: 0, hasMore: false },
    }, { status: 200 });
  }
}

// POST /api/timers - Create a new timer
export async function POST(request: NextRequest) {
  try {
    await ensureCoreSchema();
    const session = await getServerSession();
    const body = await request.json();

    const {
      title,
      description,
      timerMode,
      duration,
      startTime,
      endTime,
      fillMode,
      startColor,
      endColor,
      category,
      isPublic,
      isRecurring,
      recurrenceType,
    } = body;

    // Validation
    if (!title || !endTime || !fillMode || !startColor || !endColor) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create timer
    const timer = await prisma.timer.create({
      data: {
        title,
        description: description || null,
        timerMode: timerMode || "countdown",
        duration: duration || null,
        startTime: startTime ? new Date(startTime) : null,
        endTime: new Date(endTime),
        fillMode,
        startColor,
        endColor,
        category: category || "productivity",
        isRecurring: isRecurring || false,
        recurrenceType: recurrenceType || null,
        isPublic: session?.user ? isPublic || false : false,
        userId: session?.user?.email
          ? (
              await prisma.user.findUnique({
                where: { email: session.user.email },
              })
            )?.id
          : null,
      },
    });

    return NextResponse.json(timer, { status: 201 });
  } catch (error: any) {
    console.error("Error creating timer:", error);
    return NextResponse.json({ error: "Failed to create timer" }, { status: 500 });
  }
}
