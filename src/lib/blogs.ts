import { prisma } from "@/lib/prisma";

export interface BlogListItem {
  id: number;
  title: string;
  slug: string;
  coverImage: string | null;
  publishedAt: Date | null;
  author: { name: string };
}

export interface BlogPage {
  articles: BlogListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Paginated list of APPROVED articles, newest first.
export async function getApprovedArticles(page = 1, pageSize = 6): Promise<BlogPage> {
  const safePage = Math.max(1, Math.floor(page) || 1);
  const where = { status: "APPROVED" as const };

  const [total, articles] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (safePage - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        publishedAt: true,
        author: { select: { name: true } },
      },
    }),
  ]);

  return {
    articles,
    total,
    page: safePage,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

// Single APPROVED article by slug (for the public detail page).
export async function getApprovedArticleBySlug(slug: string) {
  return prisma.article.findFirst({
    where: { slug, status: "APPROVED" },
    select: {
      id: true,
      title: true,
      slug: true,
      body: true,
      coverImage: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });
}
