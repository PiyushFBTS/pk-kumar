import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { json, apiError } from "@/lib/api";
import { notifyAdminOfSubmission } from "@/lib/emails";

type Params = { params: Promise<{ id: string }> };

// POST /api/articles/:id/submit — move a DRAFT or REJECTED article to PENDING.
export async function POST(_req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated", 401);

  const id = Number((await params).id);
  if (!Number.isInteger(id)) return apiError("Invalid id", 400);

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article || article.authorId !== user.id) return apiError("Not found", 404);

  if (article.status !== "DRAFT" && article.status !== "REJECTED") {
    return apiError("Only drafts or rejected articles can be submitted.", 409);
  }
  if (!article.body || article.body.trim().length === 0) {
    return apiError("Add some content before submitting.", 400);
  }

  await prisma.article.update({
    where: { id },
    data: { status: "PENDING", rejectReason: null },
  });

  await notifyAdminOfSubmission({ articleId: id, title: article.title, authorName: user.name });

  return json({ ok: true, status: "PENDING" });
}
