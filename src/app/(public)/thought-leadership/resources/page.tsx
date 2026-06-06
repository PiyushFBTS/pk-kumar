import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/ui/hero";
import { Section } from "@/components/ui/section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resources",
  description: "Key regulatory and government links curated by P. R. Kumar & Co.",
};

export default async function ResourcesPage() {
  const resources = await prisma.resource.findMany({
    orderBy: [{ order: "asc" }, { id: "asc" }],
    select: { id: true, label: true, url: true, category: true },
  });

  // Group by category for display.
  const groups = new Map<string, typeof resources>();
  for (const r of resources) {
    const key = r.category?.trim() || "General";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  return (
    <>
      <Hero
        eyebrow="Thought Leadership"
        title="Useful resources"
        subtitle="Quick links to the regulatory and government portals we work with most."
      />

      <Section>
        {resources.length === 0 ? (
          <p className="rounded border border-border bg-surface p-6 text-sm text-muted">
            No resources published yet.
          </p>
        ) : (
          <div className="space-y-10">
            {[...groups.entries()].map(([category, items]) => (
              <div key={category}>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                  {category}
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((r) => (
                    <li key={r.id}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-lg border border-border bg-background p-4 text-brand transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                      >
                        <span className="font-medium">{r.label}</span>
                        <span aria-hidden className="text-brand-accent">
                          ↗
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
