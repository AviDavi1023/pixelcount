import { prisma } from "@/app/lib/prisma";

let ensurePromise: Promise<void> | null = null;

export async function ensureCoreSchema() {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      // User fields
      await prisma.$executeRawUnsafe(
        'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT;'
      );
      await prisma.$executeRawUnsafe(
        'CREATE INDEX IF NOT EXISTS "User_username_idx" ON "User"("username");'
      );

      // Timer discovery fields
      await prisma.$executeRawUnsafe(
        'ALTER TABLE "Timer" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT \'productivity\';'
      );
      await prisma.$executeRawUnsafe(
        'ALTER TABLE "Timer" ADD COLUMN IF NOT EXISTS "remixedFromId" TEXT;'
      );
      await prisma.$executeRawUnsafe(
        'ALTER TABLE "Timer" ADD COLUMN IF NOT EXISTS "remixCount" INTEGER NOT NULL DEFAULT 0;'
      );
      await prisma.$executeRawUnsafe(
        'CREATE INDEX IF NOT EXISTS "Timer_category_idx" ON "Timer"("category");'
      );

      // Timer recurring fields
      await prisma.$executeRawUnsafe(
        'ALTER TABLE "Timer" ADD COLUMN IF NOT EXISTS "isRecurring" BOOLEAN NOT NULL DEFAULT false;'
      );
      await prisma.$executeRawUnsafe(
        'ALTER TABLE "Timer" ADD COLUMN IF NOT EXISTS "recurrenceType" TEXT;'
      );
      await prisma.$executeRawUnsafe(
        'ALTER TABLE "Timer" ADD COLUMN IF NOT EXISTS "lastReset" TIMESTAMP(3);'
      );
    })();
  }

  return ensurePromise;
}
