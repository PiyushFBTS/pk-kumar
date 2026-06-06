"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export interface ManagedQuote {
  id: number;
  partner: string;
  quote: string;
  order: number;
  published: boolean;
}

export function QuoteManager({ quotes }: { quotes: ManagedQuote[] }) {
  const router = useRouter();
  const [partner, setPartner] = useState("");
  const [quote, setQuote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partner, quote }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not add quote.");
      return;
    }
    setPartner("");
    setQuote("");
    router.refresh();
  }

  async function togglePublished(q: ManagedQuote) {
    await fetch(`/api/admin/quotes/${q.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !q.published }),
    });
    router.refresh();
  }

  async function remove(id: number) {
    if (!window.confirm("Delete this quote?")) return;
    await fetch(`/api/admin/quotes/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      {error ? (
        <p
          role="alert"
          className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <form
        onSubmit={add}
        className="mt-6 space-y-3 rounded-lg border border-border bg-surface p-4"
      >
        <input
          required
          placeholder="Partner name"
          value={partner}
          onChange={(e) => setPartner(e.target.value)}
          className="w-full rounded border border-border px-3 py-2 text-sm"
        />
        <textarea
          required
          rows={3}
          placeholder="Quote text"
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          className="w-full rounded border border-border px-3 py-2 text-sm"
        />
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? "Adding…" : "Add quote"}
        </Button>
      </form>

      <ul className="mt-6 space-y-3">
        {quotes.map((q) => (
          <li key={q.id} className="rounded-lg border border-border bg-background p-4">
            <p className="text-sm text-foreground">“{q.quote}”</p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-brand">— {q.partner}</span>
              <div className="flex items-center gap-3 text-sm">
                <span className={q.published ? "text-green-700" : "text-muted"}>
                  {q.published ? "Published" : "Hidden"}
                </span>
                <button
                  type="button"
                  onClick={() => togglePublished(q)}
                  className="text-brand hover:underline"
                >
                  {q.published ? "Hide" : "Publish"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(q.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
        {quotes.length === 0 ? (
          <li className="rounded border border-border bg-surface p-4 text-sm text-muted">
            No quotes yet.
          </li>
        ) : null}
      </ul>
    </>
  );
}
