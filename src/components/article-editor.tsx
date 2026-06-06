"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export interface ArticleInitial {
  id: number;
  title: string;
  body: string;
  coverImage: string | null;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  rejectReason: string | null;
}

type Mode = "create" | "edit";

async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Upload failed");
  return data.url as string;
}

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "h-8 min-w-8 rounded px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent",
        active ? "bg-ink text-white" : "text-brand hover:bg-surface",
      )}
    >
      {children}
    </button>
  );
}

export function ArticleEditor({ mode, initial }: { mode: Mode; initial?: ArticleInitial }) {
  const router = useRouter();
  const [articleId, setArticleId] = useState<number | null>(initial?.id ?? null);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [coverImage, setCoverImage] = useState<string | null>(initial?.coverImage ?? null);
  const [status] = useState(initial?.status ?? "DRAFT");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false, // avoid SSR hydration mismatch in Next
    extensions: [StarterKit, Image.configure({ inline: false })],
    content: initial?.body || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "ProseMirror min-h-72 rounded-b border border-t-0 border-border p-4 focus:outline-none",
      },
    },
  });

  const locked = status === "APPROVED";

  async function persist(): Promise<number | null> {
    setError(null);
    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters.");
      return null;
    }
    const html = editor?.getHTML() ?? "";
    const payload = { title: title.trim(), body: html, coverImage };

    if (articleId == null) {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save.");
        return null;
      }
      setArticleId(data.article.id);
      // Move to the edit URL so future saves update the same record.
      window.history.replaceState(null, "", `/account/articles/${data.article.id}/edit`);
      return data.article.id;
    }

    const res = await fetch(`/api/articles/${articleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not save.");
      return null;
    }
    return articleId;
  }

  async function onSaveDraft() {
    setBusy(true);
    setMessage(null);
    const id = await persist();
    if (id != null) setMessage("Draft saved.");
    setBusy(false);
  }

  async function onSubmitForReview() {
    setBusy(true);
    setMessage(null);
    const id = await persist();
    if (id == null) {
      setBusy(false);
      return;
    }
    const res = await fetch(`/api/articles/${id}/submit`, { method: "POST" });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not submit.");
      return;
    }
    router.push("/account/articles");
    router.refresh();
  }

  async function onPickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      setCoverImage(await uploadImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }

  async function onPickInlineImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setError(null);
    try {
      const url = await uploadImage(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      if (inlineInputRef.current) inlineInputRef.current.value = "";
    }
  }

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (leave empty to remove):", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-brand">
          {mode === "create" ? "New article" : "Edit article"}
        </h1>
        <StatusBadge status={status} />
      </div>

      {initial?.status === "REJECTED" && initial.rejectReason ? (
        <p className="mt-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          <strong>Rejected:</strong> {initial.rejectReason}
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-4 rounded border border-green-300 bg-green-50 p-3 text-sm text-green-700">
          {message}
        </p>
      ) : null}

      {locked ? (
        <p className="mt-4 rounded border border-border bg-surface p-3 text-sm text-muted">
          This article is approved and published, so it is read-only here.
        </p>
      ) : null}

      {/* Title */}
      <label htmlFor="title" className="mt-6 block text-sm font-medium text-brand">
        Title
      </label>
      <input
        id="title"
        value={title}
        disabled={locked}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Article title"
        className="mt-1 w-full rounded border border-border px-3 py-2 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent disabled:opacity-60"
      />

      {/* Cover image */}
      <div className="mt-6">
        <p className="text-sm font-medium text-brand">Cover image</p>
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
            alt="Cover"
            className="mt-2 max-h-48 rounded border border-border"
          />
        ) : null}
        <div className="mt-2 flex gap-3">
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={onPickCover}
            className="hidden"
            id="cover-input"
            disabled={locked}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => coverInputRef.current?.click()}
            className={cn(locked && "pointer-events-none opacity-60")}
          >
            {coverImage ? "Replace cover" : "Upload cover"}
          </Button>
          {coverImage ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => setCoverImage(null)}>
              Remove
            </Button>
          ) : null}
        </div>
      </div>

      {/* Editor */}
      <div className="mt-6">
        <p className="text-sm font-medium text-brand">Body</p>
        {editor ? (
          <>
            <div className="mt-1 flex flex-wrap gap-1 rounded-t border border-border bg-surface p-1">
              <ToolbarButton
                label="Bold"
                active={editor.isActive("bold")}
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <strong>B</strong>
              </ToolbarButton>
              <ToolbarButton
                label="Italic"
                active={editor.isActive("italic")}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <em>I</em>
              </ToolbarButton>
              <ToolbarButton
                label="Strikethrough"
                active={editor.isActive("strike")}
                onClick={() => editor.chain().focus().toggleStrike().run()}
              >
                <s>S</s>
              </ToolbarButton>
              <ToolbarButton
                label="Heading 2"
                active={editor.isActive("heading", { level: 2 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              >
                H2
              </ToolbarButton>
              <ToolbarButton
                label="Heading 3"
                active={editor.isActive("heading", { level: 3 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              >
                H3
              </ToolbarButton>
              <ToolbarButton
                label="Bullet list"
                active={editor.isActive("bulletList")}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >
                • List
              </ToolbarButton>
              <ToolbarButton
                label="Numbered list"
                active={editor.isActive("orderedList")}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              >
                1. List
              </ToolbarButton>
              <ToolbarButton
                label="Quote"
                active={editor.isActive("blockquote")}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
              >
                ❝
              </ToolbarButton>
              <ToolbarButton label="Link" active={editor.isActive("link")} onClick={setLink}>
                🔗
              </ToolbarButton>
              <ToolbarButton label="Insert image" onClick={() => inlineInputRef.current?.click()}>
                🖼
              </ToolbarButton>
              <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
                ↶
              </ToolbarButton>
              <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
                ↷
              </ToolbarButton>
            </div>
            <input
              ref={inlineInputRef}
              type="file"
              accept="image/*"
              onChange={onPickInlineImage}
              className="hidden"
            />
            <EditorContent editor={editor} />
          </>
        ) : (
          <div className="mt-1 h-72 rounded border border-border" aria-hidden />
        )}
      </div>

      {/* Actions */}
      {!locked ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={onSaveDraft} disabled={busy}>
            {busy ? "Saving…" : "Save draft"}
          </Button>
          <Button type="button" onClick={onSubmitForReview} disabled={busy}>
            Submit for review
          </Button>
          <Button variant="ghost" href="/account/articles">
            Back to my articles
          </Button>
        </div>
      ) : (
        <div className="mt-6">
          <Button variant="ghost" href="/account/articles">
            Back to my articles
          </Button>
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: "bg-surface text-muted border-border",
    PENDING: "bg-amber-50 text-amber-800 border-amber-300",
    APPROVED: "bg-green-50 text-green-800 border-green-300",
    REJECTED: "bg-red-50 text-red-700 border-red-300",
  };
  return (
    <span className={cn("rounded-full border px-3 py-1 text-xs font-medium", styles[status])}>
      {status}
    </span>
  );
}
