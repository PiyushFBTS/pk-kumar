import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Section } from "@/components/ui/section";
import { ResourceManager } from "@/components/resource-manager";

export const metadata = { title: "Resources" } satisfies Metadata;

export default async function AdminResourcesPage() {
  const resources = await prisma.resource.findMany({
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });

  return (
    <Section>
      <h1 className="text-2xl font-semibold text-brand">Resources</h1>
      <p className="mt-2 text-sm text-muted">
        Manage the regulatory links shown on the public Resources page.
      </p>
      <ResourceManager resources={resources} />
    </Section>
  );
}
