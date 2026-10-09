import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  // Local dev: DATABASE_URL=file:./dev.db
  // Production: DATABASE_URL=libsql://xxx.turso.io + TURSO_AUTH_TOKEN=yyy
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const adapter = new PrismaLibSql({ url, authToken });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

/**
 * False on Vercel Preview builds, where DATABASE_URL is only set for Production. Pages that
 * pre-render from the database check this and render empty instead of failing the whole build
 * against the empty local fallback ("no such table: main.Post").
 */
export const isDatabaseConfigured = Boolean(process.env.DATABASE_URL);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
