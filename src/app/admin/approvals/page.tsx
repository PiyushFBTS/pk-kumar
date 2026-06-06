import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Section } from "@/components/ui/section";
import { ApprovalQueue } from "@/components/approval-queue";

export const metadata = { title: "Approval Queue" } satisfies Metadata;

export default async function ApprovalsPage() {
  const pending = await prisma.article.findMany({
    where: { status: "PENDING" },
    orderBy: { updatedAt: "asc" },
    select: {
      id: true,
      title: true,
      body: true,
      createdAt: true,
      author: { select: { name: true, email: true } },
    },
  });

  const articles = pending.map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    createdAt: a.createdAt.toISOString(),
    author: a.author,
  }));

  return (
    <Section>
      <h1 className="text-2xl font-semibold text-brand">Approval queue</h1>
      <p className="mt-2 text-sm text-muted">
        Review submitted articles. Approving publishes them to the public blog.
      </p>
      <ApprovalQueue articles={articles} />
    </Section>
  );
}
