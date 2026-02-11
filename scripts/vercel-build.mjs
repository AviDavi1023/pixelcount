import { spawnSync } from "node:child_process";

const run = (command, args = []) => {
  const result = spawnSync(command, args, { stdio: "inherit", shell: true });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const shouldMigrate = process.env.MIGRATE_ON_BUILD === "true";

if (shouldMigrate) {
  console.log("MIGRATE_ON_BUILD=true -> running prisma migrate deploy");
  run("prisma", ["migrate", "deploy"]);
} else {
  console.log("Skipping prisma migrate deploy (set MIGRATE_ON_BUILD=true to enable)");
}

run("next", ["build"]);
