import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Section } from "@/components/ui/section";

export const metadata = { title: "Applications" } satisfies Metadata;

interface Experience {
  company?: string;
  years?: string;
  role?: string;
}

export default async function AdminCareersPage() {
  const applications = await prisma.jobApplication.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <Section>
      <h1 className="text-2xl font-semibold text-brand">Career applications</h1>
      <p className="mt-2 text-sm text-muted">Job, internship and articleship applications.</p>

      {applications.length === 0 ? (
        <p className="mt-8 rounded border border-border bg-surface p-6 text-sm text-muted">
          No applications yet.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {applications.map((a) => {
            const exp = (a.experience as Experience | null) ?? null;
            return (
              <li key={a.id} className="rounded-lg border border-border bg-background p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-brand">
                      {a.name}{" "}
                      <span className="ml-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted">
                        {a.applyType}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      <a href={`mailto:${a.email}`} className="hover:text-brand">
                        {a.email}
                      </a>{" "}
                      · {a.phone}
                    </p>
                  </div>
                  <span className="text-xs text-muted">{a.createdAt.toLocaleString()}</span>
                </div>

                {a.hasExperience && exp ? (
                  <p className="mt-3 text-sm text-foreground">
                    <span className="font-medium">Experience:</span> {exp.role || "—"}
                    {exp.company ? ` at ${exp.company}` : ""}
                    {exp.years ? ` (${exp.years} yrs)` : ""}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-muted">No prior experience indicated.</p>
                )}

                {a.coverNote ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{a.coverNote}</p>
                ) : null}

                {a.resume ? (
                  <a
                    href={`/api/admin/careers/${a.id}/resume`}
                    className="mt-3 inline-block text-sm font-medium text-brand hover:underline"
                  >
                    ↓ Download resume
                  </a>
                ) : (
                  <p className="mt-3 text-xs text-muted">No resume attached.</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}
