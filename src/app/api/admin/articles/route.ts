import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { json, apiError } from "@/lib/api";

const STATUSES = ["DRAFT", "PENDING", "APPROVED", "REJECTED"] as const;
type Status = (typeof STATUSES)[number];

// GET /api/admin/articles?status=PENDING — all authors' articles, admin only.
export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return apiError("Forbidden", 403);

  const statusParam = new URL(req.url).searchParams.get("status");
  const where =
    statusParam && (STATUSES as readonly string[]).includes(statusParam)
      ? { status: statusParam as Status }
      : {};

  const articles = await prisma.article.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      rejectReason: true,
      publishedAt: true,
      updatedAt: true,
      createdAt: true,
      author: { select: { id: true, name: true, email: true } },
    },
  });
  return json({ articles });
}
