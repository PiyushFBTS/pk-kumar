"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export interface ManagedUser {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  active: boolean;
  articleCount: number;
}

export function UserManager({
  users,
  currentAdminId,
}: {
  users: ManagedUser[];
  currentAdminId: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not create user.");
      return;
    }
    setForm({ name: "", email: "", password: "", role: "USER" });
    setOpen(false);
    router.refresh();
  }

  async function patch(id: number, body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Update failed.");
      return;
    }
    router.refresh();
  }

  return (
    <>
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted">{users.length} users</p>
        <Button size="sm" onClick={() => setOpen((v) => !v)}>
          {open ? "Close" : "Create user"}
        </Button>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      {open ? (
        <form
          onSubmit={createUser}
          className="mt-4 grid gap-3 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2"
        >
          <input
            required
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded border border-border px-3 py-2 text-sm"
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded border border-border px-3 py-2 text-sm"
          />
          <input
            required
            type="password"
            placeholder="Temporary password (min 8)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rounded border border-border px-3 py-2 text-sm"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="rounded border border-border px-3 py-2 text-sm"
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
          <div className="sm:col-span-2">
            <Button type="submit" size="sm" disabled={busy}>
              {busy ? "Creating…" : "Create user"}
            </Button>
          </div>
        </form>
      ) : null}

      <ul className="mt-6 divide-y divide-border rounded-lg border border-border">
        {users.map((u) => {
          const isSelf = u.id === currentAdminId;
          return (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-medium text-brand">
                  {u.name} {isSelf ? <span className="text-xs text-muted">(you)</span> : null}
                </p>
                <p className="text-xs text-muted">
                  {u.email} · {u.articleCount} article{u.articleCount === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className={u.active ? "text-green-700" : "text-red-600"}>
                  {u.active ? "Active" : "Inactive"}
                </span>
                <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
                  {u.role}
                </span>
                {!isSelf ? (
                  <>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => patch(u.id, { role: u.role === "ADMIN" ? "USER" : "ADMIN" })}
                      className="text-brand hover:underline disabled:opacity-50"
                    >
                      {u.role === "ADMIN" ? "Make user" : "Make admin"}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => patch(u.id, { active: !u.active })}
                      className="text-brand hover:underline disabled:opacity-50"
                    >
                      {u.active ? "Deactivate" : "Activate"}
                    </button>
                  </>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
