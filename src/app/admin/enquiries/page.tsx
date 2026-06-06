import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Section } from "@/components/ui/section";

export const metadata = { title: "Enquiries" } satisfies Metadata;

export default async function AdminEnquiriesPage() {
  const enquiries = await prisma.enquiry.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <Section>
      <h1 className="text-2xl font-semibold text-brand">Enquiries</h1>
      <p className="mt-2 text-sm text-muted">Messages submitted via the contact form.</p>

      {enquiries.length === 0 ? (
        <p className="mt-8 rounded border border-border bg-surface p-6 text-sm text-muted">
          No enquiries yet.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {enquiries.map((e) => (
            <li key={e.id} className="rounded-lg border border-border bg-background p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-brand">{e.name}</p>
                  <p className="text-xs text-muted">
                    <a href={`mailto:${e.email}`} className="hover:text-brand">
                      {e.email}
                    </a>{" "}
                    · {e.service}
                  </p>
                </div>
                <span className="text-xs text-muted">{e.createdAt.toLocaleString()}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{e.message}</p>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
