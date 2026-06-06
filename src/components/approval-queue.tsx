"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export interface QueueArticle {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  author: { name: string; email: string };
}

export function ApprovalQueue({ articles }: { articles: QueueArticle[] }) {
  const router = useRouter();
  const [preview, setPreview] = useState<QueueArticle | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(id: number, run: () => Promise<Response>) {
    setBusyId(id);
    setError(null);
    const res = await run();
    setBusyId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Action failed.");
      return false;
    }
    router.refresh();
    return true;
  }

  async function approve(id: number) {
    await act(id, () => fetch(`/api/admin/articles/${id}/approve`, { method: "POST" }));
  }

  async function confirmReject(id: number) {
    const ok = await act(id, () =>
      fetch(`/api/admin/articles/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      }),
    );
    if (ok) {
      setRejectingId(null);
      setReason("");
    }
  }

  async function remove(id: number) {
    if (!window.confirm("Delete this article permanently?")) return;
    await act(id, () => fetch(`/api/admin/articles/${id}`, { method: "DELETE" }));
  }

  if (articles.length === 0) {
    return (
      <p className="mt-8 rounded border border-border bg-surface p-6 text-sm text-muted">
        Nothing awaiting review. 🎉
      </p>
    );
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

      <ul className="mt-6 space-y-4">
        {articles.map((article) => (
          <li key={article.id} className="rounded-lg border border-border bg-background p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-brand">{article.title}</h2>
                <p className="mt-1 text-xs text-muted">
                  by {article.author.name} ({article.author.email}) ·{" "}
                  {new Date(article.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreview(article)}
                className="text-sm font-medium text-brand hover:underline"
              >
                Preview
              </button>
            </div>

            {rejectingId === article.id ? (
              <div className="mt-4">
                <label htmlFor={`reason-${article.id}`} className="text-sm font-medium text-brand">
                  Reason for rejection
                </label>
                <textarea
                  id={`reason-${article.id}`}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded border border-border p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                  placeholder="Explain what needs to change…"
                />
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => confirmReject(article.id)}
                    disabled={busyId === article.id || reason.trim().length < 3}
                  >
                    Confirm rejection
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setRejectingId(null);
                      setReason("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => approve(article.id)}
                  disabled={busyId === article.id}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setRejectingId(article.id);
                    setReason("");
                  }}
                >
                  Reject
                </Button>
                <button
                  type="button"
                  onClick={() => remove(article.id)}
                  disabled={busyId === article.id}
                  className="px-2 text-sm text-red-600 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <Modal
        open={preview !== null}
        onClose={() => setPreview(null)}
        title={preview?.title ?? ""}
        className="max-w-2xl"
      >
        <div className="ProseMirror" dangerouslySetInnerHTML={{ __html: preview?.body ?? "" }} />
      </Modal>
    </>
  );
}
