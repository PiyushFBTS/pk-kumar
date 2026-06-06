"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Client-side withdraw/delete for a single article row.
export function ArticleActions({ id, status }: { id: number; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function withdraw() {
    setBusy(true);
    await fetch(`/api/articles/${id}/withdraw`, { method: "POST" });
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    if (!window.confirm("Delete this article? This cannot be undone.")) return;
    setBusy(true);
    await fetch(`/api/articles/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      {status === "PENDING" ? (
        <button
          type="button"
          onClick={withdraw}
          disabled={busy}
          className="text-brand hover:underline disabled:opacity-50"
        >
          Withdraw
        </button>
      ) : null}
      {status !== "APPROVED" ? (
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          className="text-red-600 hover:underline disabled:opacity-50"
        >
          Delete
        </button>
      ) : null}
    </div>
  );
}
