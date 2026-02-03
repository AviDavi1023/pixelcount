-- Add username to User
ALTER TABLE "User" ADD COLUMN "username" TEXT UNIQUE;
CREATE INDEX "User_username_idx" ON "User"("username");

-- Add category, remixedFromId, and remixCount to Timer
ALTER TABLE "Timer" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'productivity';
ALTER TABLE "Timer" ADD COLUMN "remixedFromId" TEXT;
ALTER TABLE "Timer" ADD COLUMN "remixCount" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX "Timer_category_idx" ON "Timer"("category");

-- Create the .prismarc file to mark migration as complete
-- (This is handled by Prisma automatically)
