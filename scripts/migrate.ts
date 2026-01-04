import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "@/src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Load environment variables from .env
config({ path: resolve(__dirname, "../.env") });

// Create a direct connection for migration
const pool = new pg.Pool({
  connectionString: process.env.DIRECT_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function main() {
  console.log("Running manual migration...");

  // Run raw SQL to add new columns
  await pool.query(`
    ALTER TABLE "Timer" ADD COLUMN IF NOT EXISTS "isRecurring" BOOLEAN NOT NULL DEFAULT false;
  `);
  console.log("Added isRecurring column");

  await pool.query(`
    ALTER TABLE "Timer" ADD COLUMN IF NOT EXISTS "recurrenceType" TEXT;
  `);
  console.log("Added recurrenceType column");

  await pool.query(`
    ALTER TABLE "Timer" ADD COLUMN IF NOT EXISTS "lastReset" TIMESTAMP(3);
  `);
  console.log("Added lastReset column");

  console.log("Migration completed!");
  await pool.end();
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
