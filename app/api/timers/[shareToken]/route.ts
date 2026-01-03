import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params;
    const session = await getServerSession(authOptions);

    const timer = await prisma.timer.findUnique({
      where: { shareToken },
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

    // Only increment view count if viewer is not the creator
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });

      if (!user || user.id !== timer.userId) {
        await prisma.timer.update({
          where: { id: timer.id },
          data: { viewCount: { increment: 1 } },
        });
      }
    } else {
      // If not logged in, always increment views
      await prisma.timer.update({
        where: { id: timer.id },
        data: { viewCount: { increment: 1 } },
      });
    }

    return NextResponse.json(timer);
  } catch (error) {
    console.error("Error fetching timer:", error);
    return NextResponse.json({ error: "Failed to fetch timer" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params;
    await prisma.timer.delete({
      where: { shareToken },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting timer:", error);
    return NextResponse.json({ error: "Failed to delete timer" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params;
    const body = await request.json();
    const { title, description, isPublic } = body;

    const timer = await prisma.timer.update({
      where: { shareToken },
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
