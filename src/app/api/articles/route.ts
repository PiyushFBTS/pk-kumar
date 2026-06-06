import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { json, apiError } from "@/lib/api";
import { articleCreateSchema } from "@/lib/validation";
import { sanitizeHtml } from "@/lib/sanitize";
import { uniqueArticleSlug } from "@/lib/slug";

// GET /api/articles — the current user's own articles.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated", 401);

  const articles = await prisma.article.findMany({
    where: { authorId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      rejectReason: true,
      coverImage: true,
      updatedAt: true,
      createdAt: true,
    },
  });
  return json({ articles });
}

// POST /api/articles — create a new DRAFT owned by the current user.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated", 401);

  const body = await req.json().catch(() => null);
  const parsed = articleCreateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Invalid input", 400, { issues: parsed.error.flatten().fieldErrors });
  }

  const { title, body: html, coverImage } = parsed.data;
  const article = await prisma.article.create({
    data: {
      title,
      slug: await uniqueArticleSlug(title),
      body: sanitizeHtml(html ?? ""),
      coverImage: coverImage ?? null,
      status: "DRAFT",
      authorId: user.id,
    },
    select: { id: true, slug: true, status: true },
  });
  return json({ article }, 201);
}
