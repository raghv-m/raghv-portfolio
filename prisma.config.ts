import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Prisma CLI uses local SQLite file — Turso is handled at runtime via the LibSQL adapter in src/lib/prisma.ts
  datasource: {
    url: "file:./dev.db",
  },
});
