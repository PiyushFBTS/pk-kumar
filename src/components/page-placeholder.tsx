// Temporary scaffolding for pages whose real content arrives in later sprints.
export function PagePlaceholder({
  title,
  sprint,
  children,
}: {
  title: string;
  sprint: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-semibold text-brand">{title}</h1>
      <p className="mt-2 text-sm text-muted">Scheduled for: {sprint}</p>
      {children ? <div className="mt-6 text-foreground">{children}</div> : null}
    </section>
  );
}
