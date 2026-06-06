import { site } from "@/lib/site";
import { Hero } from "@/components/ui/hero";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LatestBlogs } from "@/components/latest-blogs";
import { practiceAreas, sectors } from "@/content/firm";

export default function HomePage() {
  return (
    <>
      <Hero
        image="/cover/handshake.jpg"
        eyebrow={site.tagline}
        title="Trusted, long-term advisors to corporates, banks and the middle market."
        subtitle="A New Delhi Chartered Accountancy firm since 1981 — single-source financial, process and management assurance, with direct & indirect tax and ERP expertise."
        actions={
          <>
            <Button href="/contact">Get in touch</Button>
            <Button href="/practice-areas" variant="outline" className="border-white/30 text-white">
              Our practice areas
            </Button>
          </>
        }
      />

      {/* <TrustStrip
        items={[
          `Est. ${site.established}`,
          `${site.stats.staff} Staff`,
          `${site.stats.partners} Partners`,
        ]}
      /> */}

      <Section>
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Practice areas — left */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold text-brand sm:text-3xl">Practice areas</h2>
            <p className="mt-3 max-w-2xl text-muted">
              Four connected disciplines, delivered by a cross-functional team of chartered
              accountants, auditors and advisors.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {practiceAreas.map((area) => (
                <Card key={area.slug} href={`/practice-areas/${area.slug}`} title={area.name}>
                  {area.summary}
                </Card>
              ))}
            </div>
          </div>

          {/* Latest insights — right */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-semibold text-brand sm:text-3xl">Latest insights</h2>
            <div className="mt-8">
              <LatestBlogs />
              <Button href="/thought-leadership/blogs" variant="ghost" className="mt-6 px-0">
                Visit Thought Leadership →
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Sectors we serve" className="bg-surface">
        <ul className="flex flex-wrap gap-3">
          {sectors.map((sector) => (
            <li
              key={sector}
              className="rounded-full border border-border bg-background px-4 py-2 text-sm text-brand"
            >
              {sector}
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
