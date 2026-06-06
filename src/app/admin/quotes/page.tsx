import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Section } from "@/components/ui/section";
import { QuoteManager } from "@/components/quote-manager";

export const metadata = { title: "Partner Quotes" } satisfies Metadata;

export default async function AdminQuotesPage() {
  const quotes = await prisma.partnerQuote.findMany({
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });

  return (
    <Section>
      <h1 className="text-2xl font-semibold text-brand">Partner quotes</h1>
      <p className="mt-2 text-sm text-muted">
        Manage the quotes shown on the public Thought Leadership page.
      </p>
      <QuoteManager quotes={quotes} />
    </Section>
  );
}
