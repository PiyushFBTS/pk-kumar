import slugify from "slugify";
import { prisma } from "@/lib/prisma";

// Generate a URL-safe, unique article slug. Appends -2, -3, … on collision,
// ignoring the article being edited (excludeId).
export async function uniqueArticleSlug(title: string, excludeId?: number): Promise<string> {
  const base = slugify(title, { lower: true, strict: true }) || "article";
  let slug = base;
  let n = 1;
  // Bounded loop; in practice resolves in 1–2 iterations.
  while (n < 1000) {
    const existing = await prisma.article.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === excludeId) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
  return `${base}-${Date.now()}`;
}
