import type { Metadata } from "next";
import { Hero } from "@/components/ui/hero";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Thought Leadership",
  description: "Partner quotes, regulatory resources and recent articles from P. R. Kumar & Co.",
};

const items = [
  {
    title: "Partner Quotes",
    href: "/thought-leadership/quotes",
    blurb: "Perspectives from our partners on tax, assurance and advisory.",
  },
  {
    title: "Resources",
    href: "/thought-leadership/resources",
    blurb: "Quick links to key regulatory and government portals.",
  },
  {
    title: "Recent Blogs",
    href: "/thought-leadership/blogs",
    blurb: "Reviewed articles and insights from our team.",
  },
];

export default function ThoughtLeadershipPage() {
  return (
    <>
      <Hero
        eyebrow="Thought Leadership"
        title="Insight you can act on."
        subtitle="Curated perspectives, practical resources and articles from across the firm."
      />
      <Section>
        <div className="grid gap-6 sm:grid-cols-3">
          {items.map((item) => (
            <Card key={item.href} href={item.href} title={item.title}>
              {item.blurb}
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
