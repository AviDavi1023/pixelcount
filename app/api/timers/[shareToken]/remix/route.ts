import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { ensureCoreSchema } from "@/app/lib/ensure-schema";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    await ensureCoreSchema();
    const { shareToken } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the original timer
    const originalTimer = await prisma.timer.findUnique({
      where: { shareToken },
      include: { user: true },
    });

    if (!originalTimer) {
      return NextResponse.json(
        { error: "Timer not found" },
        { status: 404 }
      );
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create a new timer as a remix
    const remixedTimer = await prisma.timer.create({
      data: {
        title: `${originalTimer.title} (remixed)`,
        description: originalTimer.description,
        timerMode: originalTimer.timerMode,
        duration: originalTimer.duration,
        startTime: originalTimer.startTime,
        endTime: originalTimer.endTime,
        fillMode: originalTimer.fillMode,
        startColor: originalTimer.startColor,
        endColor: originalTimer.endColor,
        isRecurring: originalTimer.isRecurring,
        recurrenceType: originalTimer.recurrenceType,
        category: originalTimer.category,
        isPublic: false, // New remixes default to private
        userId: user.id,
        remixedFromId: originalTimer.id,
      },
    });

    // Increment remix count on original timer
    await prisma.timer.update({
      where: { id: originalTimer.id },
      data: { remixCount: { increment: 1 } },
    });

    return NextResponse.json(remixedTimer, { status: 201 });
  } catch (error) {
    console.error("Error creating remix:", error);
    return NextResponse.json(
      { error: "Failed to create remix" },
      { status: 500 }
    );
  }
}
