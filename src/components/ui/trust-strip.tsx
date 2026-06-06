import { Fragment } from "react";
import { Container } from "./container";

// Horizontal strip of key stats (Est. 1981 · 45+ Staff · 6 Partners).
export function TrustStrip({ items }: { items: string[] }) {
  return (
    <div className="border-y border-border bg-surface">
      <Container className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-5 text-sm font-medium text-brand">
        {items.map((item, i) => (
          <Fragment key={item}>
            <span>{item}</span>
            {i < items.length - 1 ? (
              <span aria-hidden className="text-border">
                ·
              </span>
            ) : null}
          </Fragment>
        ))}
      </Container>
    </div>
  );
}
