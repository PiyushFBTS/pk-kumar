import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { json, apiError } from "@/lib/api";
import { rejectSchema } from "@/lib/validation";
import { notifyAuthorRejected } from "@/lib/emails";

type Params = { params: Promise<{ id: string }> };

// POST /api/admin/articles/:id/reject  body: { reason }
export async function POST(req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return apiError("Forbidden", 403);

  const id = Number((await params).id);
  if (!Number.isInteger(id)) return apiError("Invalid id", 400);

  const body = await req.json().catch(() => null);
  const parsed = rejectSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Invalid input", 400, { issues: parsed.error.flatten().fieldErrors });
  }

  const article = await prisma.article.findUnique({
    where: { id },
    include: { author: { select: { name: true, email: true } } },
  });
  if (!article) return apiError("Not found", 404);
  if (article.status !== "PENDING") {
    return apiError("Only pending articles can be rejected.", 409);
  }

  await prisma.article.update({
    where: { id },
    data: { status: "REJECTED", rejectReason: parsed.data.reason },
  });

  await notifyAuthorRejected({
    to: article.author.email,
    authorName: article.author.name,
    title: article.title,
    reason: parsed.data.reason,
  });

  return json({ ok: true, status: "REJECTED" });
}
