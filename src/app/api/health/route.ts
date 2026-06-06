import { prisma } from "@/lib/prisma";
import { json } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/health — liveness + DB connectivity for uptime monitoring.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return json({ status: "ok", db: "up" });
  } catch {
    return json({ status: "degraded", db: "down" }, 503);
  }
}
