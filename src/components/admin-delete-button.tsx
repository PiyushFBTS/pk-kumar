"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Admin delete for any article (used in the All Articles table).
export function AdminDeleteButton({ id }: { id: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm("Delete this article permanently?")) return;
    setBusy(true);
    await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      Delete
    </button>
  );
}
