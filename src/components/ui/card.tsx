import Link from "next/link";
import { cn } from "@/lib/cn";

// Content card. If `href` is set the whole card becomes a link with hover lift.
export function Card({
  href,
  title,
  children,
  className,
}: {
  href?: string;
  title?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const inner = (
    <>
      {title ? <h3 className="text-lg font-semibold text-brand">{title}</h3> : null}
      {children ? (
        <div className={cn(title && "mt-2", "text-sm text-muted")}>{children}</div>
      ) : null}
    </>
  );

  const classes = cn(
    "rounded-lg border border-border bg-background p-6",
    href &&
      "block transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent",
    className,
  );

  return href ? (
    <Link href={href} className={classes}>
      {inner}
    </Link>
  ) : (
    <div className={classes}>{inner}</div>
  );
}
