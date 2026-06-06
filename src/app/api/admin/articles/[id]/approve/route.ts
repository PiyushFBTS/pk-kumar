import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { json, apiError } from "@/lib/api";
import { notifyAuthorApproved } from "@/lib/emails";

type Params = { params: Promise<{ id: string }> };

// POST /api/admin/articles/:id/approve — publish a PENDING article.
export async function POST(_req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return apiError("Forbidden", 403);

  const id = Number((await params).id);
  if (!Number.isInteger(id)) return apiError("Invalid id", 400);

  const article = await prisma.article.findUnique({
    where: { id },
    include: { author: { select: { name: true, email: true } } },
  });
  if (!article) return apiError("Not found", 404);
  if (article.status !== "PENDING") {
    return apiError("Only pending articles can be approved.", 409);
  }

  await prisma.article.update({
    where: { id },
    data: {
      status: "APPROVED",
      publishedAt: new Date(),
      approvedBy: admin.id,
      rejectReason: null,
    },
  });

  await notifyAuthorApproved({
    to: article.author.email,
    authorName: article.author.name,
    title: article.title,
    slug: article.slug,
  });

  return json({ ok: true, status: "APPROVED" });
}
