-- Add recurring timer fields and new fill patterns
ALTER TABLE "Timer" ADD COLUMN IF NOT EXISTS "isRecurring" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Timer" ADD COLUMN IF NOT EXISTS "recurrenceType" TEXT;
ALTER TABLE "Timer" ADD COLUMN IF NOT EXISTS "lastReset" TIMESTAMP(3);

-- Update fillMode column to allow new patterns
-- No structural change needed, just documentation in schema
