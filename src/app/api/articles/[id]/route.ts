import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { json, apiError } from "@/lib/api";
import { articleUpdateSchema } from "@/lib/validation";
import { sanitizeHtml } from "@/lib/sanitize";
import { uniqueArticleSlug } from "@/lib/slug";

type Params = { params: Promise<{ id: string }> };

// Approved articles are locked from author edits/deletes.
function isEditable(status: string): boolean {
  return status === "DRAFT" || status === "PENDING" || status === "REJECTED";
}

async function loadOwned(id: number, userId: number) {
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article || article.authorId !== userId) return null;
  return article;
}

// GET /api/articles/:id — the owner's article (full body for editing).
export async function GET(_req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated", 401);

  const id = Number((await params).id);
  if (!Number.isInteger(id)) return apiError("Invalid id", 400);

  const article = await loadOwned(id, user.id);
  if (!article) return apiError("Not found", 404);
  return json({ article });
}

// PUT /api/articles/:id — update title/body/cover (not allowed once APPROVED).
export async function PUT(req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated", 401);

  const id = Number((await params).id);
  if (!Number.isInteger(id)) return apiError("Invalid id", 400);

  const existing = await loadOwned(id, user.id);
  if (!existing) return apiError("Not found", 404);
  if (!isEditable(existing.status)) {
    return apiError("Approved articles can no longer be edited.", 409);
  }

  const body = await req.json().catch(() => null);
  const parsed = articleUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Invalid input", 400, { issues: parsed.error.flatten().fieldErrors });
  }

  const { title, body: html, coverImage } = parsed.data;
  const slug = title !== existing.title ? await uniqueArticleSlug(title, id) : existing.slug;

  const article = await prisma.article.update({
    where: { id },
    data: { title, slug, body: sanitizeHtml(html ?? ""), coverImage: coverImage ?? null },
    select: { id: true, slug: true, status: true },
  });
  return json({ article });
}

// DELETE /api/articles/:id — withdraw/remove own article (not once APPROVED).
export async function DELETE(_req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated", 401);

  const id = Number((await params).id);
  if (!Number.isInteger(id)) return apiError("Invalid id", 400);

  const existing = await loadOwned(id, user.id);
  if (!existing) return apiError("Not found", 404);
  if (existing.status === "APPROVED") {
    return apiError("Approved articles cannot be deleted here.", 409);
  }

  await prisma.article.delete({ where: { id } });
  return json({ ok: true });
}
