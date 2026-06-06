"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export interface ManagedResource {
  id: number;
  label: string;
  url: string;
  category: string | null;
  order: number;
}

export function ResourceManager({ resources }: { resources: ManagedResource[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ label: "", url: "", category: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: form.label,
        url: form.url,
        category: form.category || null,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not add resource.");
      return;
    }
    setForm({ label: "", url: "", category: "" });
    router.refresh();
  }

  async function remove(id: number) {
    if (!window.confirm("Delete this resource?")) return;
    await fetch(`/api/admin/resources/${id}`, { method: "DELETE" });
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
        className="mt-6 grid gap-3 rounded-lg border border-border bg-surface p-4 sm:grid-cols-3"
      >
        <input
          required
          placeholder="Label (e.g. MCA)"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          className="rounded border border-border px-3 py-2 text-sm"
        />
        <input
          required
          type="url"
          placeholder="https://…"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          className="rounded border border-border px-3 py-2 text-sm"
        />
        <input
          placeholder="Category (optional)"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="rounded border border-border px-3 py-2 text-sm"
        />
        <div className="sm:col-span-3">
          <Button type="submit" size="sm" disabled={busy}>
            {busy ? "Adding…" : "Add resource"}
          </Button>
        </div>
      </form>

      <ul className="mt-6 divide-y divide-border rounded-lg border border-border">
        {resources.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="font-medium text-brand">{r.label}</p>
              <p className="truncate text-xs text-muted">
                {r.category ? `${r.category} · ` : ""}
                {r.url}
              </p>
            </div>
            <button
              type="button"
              onClick={() => remove(r.id)}
              className="text-sm text-red-600 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
        {resources.length === 0 ? (
          <li className="p-4 text-sm text-muted">No resources yet.</li>
        ) : null}
      </ul>
    </>
  );
}
