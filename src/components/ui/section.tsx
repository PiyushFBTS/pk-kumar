import { cn } from "@/lib/cn";
import { Container } from "./container";

// A vertically padded page section. Optional title/lead render a heading block.
export function Section({
  title,
  lead,
  className,
  containerClassName,
  children,
}: {
  title?: string;
  lead?: string;
  className?: string;
  containerClassName?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className={cn("py-14 sm:py-20", className)}>
      <Container className={containerClassName}>
        {title ? (
          <div className="mb-8 max-w-2xl">
            <h2 className="text-2xl font-semibold text-brand sm:text-3xl">{title}</h2>
            {lead ? <p className="mt-3 text-muted">{lead}</p> : null}
          </div>
        ) : null}
        {children}
      </Container>
    </section>
  );
}
