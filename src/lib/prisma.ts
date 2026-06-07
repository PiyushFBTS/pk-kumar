import { PrismaClient } from "@/generated/prisma/client";
import { makeMariaAdapter } from "@/lib/db-adapter";
import { env } from "@/lib/env";

// Prisma 7 connects through a driver adapter (no Rust engine). For MySQL/TiDB
// we use the mariadb-based adapter (TLS auto-enabled for managed databases).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  return new PrismaClient({
    adapter: makeMariaAdapter(env.databaseUrl),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
