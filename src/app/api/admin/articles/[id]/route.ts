import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { json, apiError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

// GET full article (with author) for admin preview.
export async function GET(_req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return apiError("Forbidden", 403);

  const id = Number((await params).id);
  if (!Number.isInteger(id)) return apiError("Invalid id", 400);

  const article = await prisma.article.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true, email: true } } },
  });
  if (!article) return apiError("Not found", 404);
  return json({ article });
}

// DELETE any article (admin moderation).
export async function DELETE(_req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return apiError("Forbidden", 403);

  const id = Number((await params).id);
  if (!Number.isInteger(id)) return apiError("Invalid id", 400);

  const existing = await prisma.article.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return apiError("Not found", 404);

  await prisma.article.delete({ where: { id } });
  return json({ ok: true });
}
