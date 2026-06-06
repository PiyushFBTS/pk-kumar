import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { json, apiError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

// POST /api/articles/:id/withdraw — pull a PENDING article back to DRAFT.
export async function POST(_req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated", 401);

  const id = Number((await params).id);
  if (!Number.isInteger(id)) return apiError("Invalid id", 400);

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article || article.authorId !== user.id) return apiError("Not found", 404);

  if (article.status !== "PENDING") {
    return apiError("Only pending articles can be withdrawn.", 409);
  }

  await prisma.article.update({ where: { id }, data: { status: "DRAFT" } });
  return json({ ok: true, status: "DRAFT" });
}
