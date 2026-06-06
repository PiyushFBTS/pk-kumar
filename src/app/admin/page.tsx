import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Section } from "@/components/ui/section";

export const metadata = { title: "Admin Dashboard" } satisfies Metadata;

function StatCard({ label, value, href }: { label: string; value: number; href?: string }) {
  const inner = (
    <>
      <p className="text-3xl font-semibold text-brand">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </>
  );
  return href ? (
    <Link
      href={href}
      className="rounded-lg border border-border bg-background p-6 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
    >
      {inner}
    </Link>
  ) : (
    <div className="rounded-lg border border-border bg-background p-6">{inner}</div>
  );
}

export default async function AdminDashboardPage() {
  const [pending, approved, rejected, totalArticles, totalUsers] = await Promise.all([
    prisma.article.count({ where: { status: "PENDING" } }),
    prisma.article.count({ where: { status: "APPROVED" } }),
    prisma.article.count({ where: { status: "REJECTED" } }),
    prisma.article.count(),
    prisma.user.count(),
  ]);

  return (
    <Section>
      <h1 className="text-2xl font-semibold text-brand">Dashboard</h1>
      <p className="mt-2 text-sm text-muted">Overview of articles and users.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Pending review" value={pending} href="/admin/approvals" />
        <StatCard label="Approved (live)" value={approved} href="/admin/articles?status=APPROVED" />
        <StatCard label="Rejected" value={rejected} href="/admin/articles?status=REJECTED" />
        <StatCard label="Total articles" value={totalArticles} href="/admin/articles" />
        <StatCard label="Users" value={totalUsers} href="/admin/users" />
      </div>

      {pending > 0 ? (
        <p className="mt-8 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          {pending} article{pending === 1 ? "" : "s"} awaiting review.{" "}
          <Link href="/admin/approvals" className="font-medium underline">
            Open the approval queue
          </Link>
        </p>
      ) : null}
    </Section>
  );
}
