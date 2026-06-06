import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/article-editor";
import { ArticleActions } from "@/components/article-actions";

export const metadata = { title: "My Articles" } satisfies Metadata;

export default async function MyArticlesPage() {
  const user = await getCurrentUser();
  // Layout guarantees a user, but narrow for type-safety.
  if (!user) return null;

  const articles = await prisma.article.findMany({
    where: { authorId: user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, status: true, updatedAt: true },
  });

  return (
    <Section>
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-brand">My articles</h1>
          <Button href="/account/articles/new" size="sm">
            New article
          </Button>
        </div>

        {articles.length === 0 ? (
          <p className="mt-8 rounded border border-border bg-surface p-6 text-sm text-muted">
            You haven&apos;t written any articles yet.{" "}
            <Link href="/account/articles/new" className="font-medium text-brand hover:underline">
              Write your first one
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-8 divide-y divide-border rounded-lg border border-border">
            {articles.map((article) => {
              const editable = article.status !== "APPROVED";
              return (
                <li
                  key={article.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-brand">{article.title || "Untitled"}</p>
                    <p className="mt-1 text-xs text-muted">
                      Updated {article.updatedAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={article.status} />
                    {editable ? (
                      <Link
                        href={`/account/articles/${article.id}/edit`}
                        className="text-sm font-medium text-brand hover:underline"
                      >
                        Edit
                      </Link>
                    ) : null}
                    <ArticleActions id={article.id} status={article.status} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Section>
  );
}
