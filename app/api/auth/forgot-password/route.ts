import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    // In production, you'd send an actual email here
    if (user) {
      // TODO: Generate reset token, save to database with expiry
      // TODO: Send email with reset link
      console.log(`Password reset requested for: ${email}`);
      // Example: Reset link would be: /reset-password?token=SECURE_TOKEN
    }

    return NextResponse.json(
      { message: "If an account exists, a reset email will be sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
