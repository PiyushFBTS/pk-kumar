import { cn } from "@/lib/cn";

// Full-width content wrapper with responsive side gutters. Pages that need a
// narrower reading width (article body, auth forms) pass their own max-w-* via
// className.
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12", className)}>{children}</div>
  );
}
