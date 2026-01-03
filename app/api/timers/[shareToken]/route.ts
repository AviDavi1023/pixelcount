import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { shareToken: string } }
) {
  try {
    const timer = await prisma.timer.findUnique({
      where: { shareToken: params.shareToken },
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

    if (!timer) {
      return NextResponse.json({ error: "Timer not found" }, { status: 404 });
    }

    // Increment view count
    await prisma.timer.update({
      where: { id: timer.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(timer);
  } catch (error) {
    console.error("Error fetching timer:", error);
    return NextResponse.json({ error: "Failed to fetch timer" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { shareToken: string } }
) {
  try {
    await prisma.timer.delete({
      where: { shareToken: params.shareToken },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting timer:", error);
    return NextResponse.json({ error: "Failed to delete timer" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { shareToken: string } }
) {
  try {
    const body = await request.json();
    const { title, description, isPublic } = body;

    const timer = await prisma.timer.update({
      where: { shareToken: params.shareToken },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });

    return NextResponse.json(timer);
  } catch (error) {
    console.error("Error updating timer:", error);
    return NextResponse.json({ error: "Failed to update timer" }, { status: 500 });
  }
}
