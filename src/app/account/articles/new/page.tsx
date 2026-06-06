import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { ArticleEditor } from "@/components/article-editor";

export const metadata = { title: "New Article" } satisfies Metadata;

export default function NewArticlePage() {
  return (
    <Section>
      <ArticleEditor mode="create" />
    </Section>
  );
}
