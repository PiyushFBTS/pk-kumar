import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { getApprovedArticleBySlug } from "@/lib/blogs";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getApprovedArticleBySlug(slug);
  if (!article) return { title: "Article" };
  return { title: article.title, description: `${article.title} — by ${article.author.name}` };
}

export default async function BlogArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const article = await getApprovedArticleBySlug(slug);
  if (!article) notFound();

  const published = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-IN", { dateStyle: "long" })
    : "";

  return (
    <Section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          author: { "@type": "Person", name: article.author.name },
          datePublished: article.publishedAt
            ? new Date(article.publishedAt).toISOString()
            : undefined,
          publisher: { "@type": "Organization", name: "P. R. Kumar & Co." },
          ...(article.coverImage ? { image: article.coverImage } : {}),
        }}
      />
      <Container className="max-w-3xl px-0">
        <h1 className="mt-6 text-3xl font-semibold text-brand sm:text-4xl">{article.title}</h1>
        <p className="mt-2 text-sm text-muted">
          By {article.author.name}
          {published ? ` · ${published}` : ""}
        </p>

        {article.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImage}
            alt=""
            className="mt-6 w-full rounded-lg border border-border object-cover"
          />
        ) : null}

        {/* Body is sanitized on save (Sprint 4), so it is safe to render. */}
        <article
          className="ProseMirror mt-8 text-foreground"
          dangerouslySetInnerHTML={{ __html: article.body }}
        />

        <div className="mt-10 border-t border-border pt-6">
          <Button href="/thought-leadership/blogs" variant="ghost" className="px-0">
            ← Back to all articles
          </Button>
        </div>
      </Container>
    </Section>
  );
}
