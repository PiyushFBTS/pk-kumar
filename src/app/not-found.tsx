import Link from "next/link";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Section>
      <div className="mx-auto max-w-xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-brand-accent">404</p>
        <h1 className="mt-3 text-3xl font-semibold text-brand">Page not found</h1>
        <p className="mt-3 text-muted">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button href="/">Go home</Button>
          <Button href="/contact" variant="outline">
            Contact us
          </Button>
        </div>
        <p className="mt-6 text-sm text-muted">
          Or browse our{" "}
          <Link href="/practice-areas" className="text-brand hover:underline">
            practice areas
          </Link>
          .
        </p>
      </div>
    </Section>
  );
}
