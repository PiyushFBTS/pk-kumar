import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/ui/hero";
import { Section } from "@/components/ui/section";
import { getApprovedArticles } from "@/lib/blogs";

// DB-backed → render per request (also keeps the build DB-free).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recent Blogs",
  description: "Insights and articles from the team at P. R. Kumar & Co.",
};

function formatDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "";
}

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = Number((await searchParams).page ?? "1");
  const { articles, page: current, totalPages } = await getApprovedArticles(page, 6);

  return (
    <>
      <Hero
        image="/cover/blog.jpeg"
        eyebrow="Thought Leadership"
        title="Recent insights"
        subtitle="Articles and commentary from our partners and team, published after editorial review."
      />

      <Section>
        {articles.length === 0 ? (
          <p className="rounded border border-border bg-surface p-6 text-sm text-muted">
            No articles published yet. Please check back soon.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/thought-leadership/blogs/${article.slug}`}
                className="flex flex-col overflow-hidden rounded-lg border border-border bg-background transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
              >
                {article.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={article.coverImage} alt="" className="h-40 w-full object-cover" />
                ) : (
                  <div className="h-40 w-full bg-surface" aria-hidden />
                )}
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-semibold text-brand">{article.title}</h2>
                  <p className="mt-auto pt-3 text-xs text-muted">
                    {article.author.name} · {formatDate(article.publishedAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <nav
            className="mt-10 flex items-center justify-center gap-4 text-sm"
            aria-label="Pagination"
          >
            {current > 1 ? (
              <Link
                href={`/thought-leadership/blogs?page=${current - 1}`}
                className="rounded border border-border px-3 py-2 text-brand hover:bg-surface"
              >
                ← Previous
              </Link>
            ) : (
              <span className="rounded border border-border px-3 py-2 text-muted opacity-50">
                ← Previous
              </span>
            )}
            <span className="text-muted">
              Page {current} of {totalPages}
            </span>
            {current < totalPages ? (
              <Link
                href={`/thought-leadership/blogs?page=${current + 1}`}
                className="rounded border border-border px-3 py-2 text-brand hover:bg-surface"
              >
                Next →
              </Link>
            ) : (
              <span className="rounded border border-border px-3 py-2 text-muted opacity-50">
                Next →
              </span>
            )}
          </nav>
        ) : null}
      </Section>
    </>
  );
}
