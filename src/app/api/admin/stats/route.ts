import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { json, apiError } from "@/lib/api";

// GET /api/admin/stats — dashboard counts.
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return apiError("Forbidden", 403);

  const [pending, approved, rejected, draft, totalArticles, totalUsers] = await Promise.all([
    prisma.article.count({ where: { status: "PENDING" } }),
    prisma.article.count({ where: { status: "APPROVED" } }),
    prisma.article.count({ where: { status: "REJECTED" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.article.count(),
    prisma.user.count(),
  ]);

  return json({ stats: { pending, approved, rejected, draft, totalArticles, totalUsers } });
}
