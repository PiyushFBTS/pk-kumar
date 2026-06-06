import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { Section } from "@/components/ui/section";
import { ArticleEditor } from "@/components/article-editor";

export const metadata = { title: "Edit Article" } satisfies Metadata;

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;

  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article || article.authorId !== user.id) notFound();

  return (
    <Section>
      <ArticleEditor
        mode="edit"
        initial={{
          id: article.id,
          title: article.title,
          body: article.body,
          coverImage: article.coverImage,
          status: article.status,
          rejectReason: article.rejectReason,
        }}
      />
    </Section>
  );
}
