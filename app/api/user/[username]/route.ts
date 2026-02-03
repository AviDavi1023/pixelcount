import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        createdAt: true,
        timers: {
          where: { isPublic: true },
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            shareToken: true,
            viewCount: true,
            remixCount: true,
            createdAt: true,
            _count: {
              select: { likes: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            timers: { where: { isPublic: true } },
            likes: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...user,
      timerCount: user._count.timers,
      likeCount: user._count.likes,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
