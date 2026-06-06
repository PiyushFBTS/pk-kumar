"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Item {
  id: number;
  title: string;
  slug: string;
  coverImage: string | null;
  publishedAt: string | null;
  author: { name: string };
}

function formatDate(d: string | null): string {
  return d ? new Date(d).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "";
}

// Vertical auto-scrolling "notice board" of the latest approved articles —
// newest on top, sliding continuously upward. Pauses on hover/focus.
export function LatestBlogs() {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/blogs?limit=8", { cache: "no-store" });
        const data = await res.json();
        if (active) setItems(data.articles ?? []);
      } catch {
        if (active) setItems([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (items === null) {
    return (
      <div
        className="h-72 w-full animate-pulse rounded-lg border border-border bg-surface"
        aria-hidden
      />
    );
  }

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-surface p-6 text-muted">
        No articles published yet — check back soon.
      </p>
    );
  }

  // Duplicate the list so the upward translate (-50%) loops seamlessly.
  const loop = [...items, ...items];
  // Pace the scroll by how much content there is (~4s per item).
  const durationSeconds = Math.max(items.length * 4, 12);

  return (
    <div className="group relative h-72 w-full overflow-hidden rounded-lg border border-border bg-background">
      <ul
        className="animate-marquee-up group-hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]"
        style={{ animationDuration: `${durationSeconds}s` }}
      >
        {loop.map((article, i) => (
          <li key={`${article.id}-${i}`} className="border-b border-border">
            <Link
              href={`/thought-leadership/blogs/${article.slug}`}
              className="block px-5 py-4 transition-colors hover:bg-surface focus-visible:bg-surface focus-visible:outline-none"
            >
              <p className="font-medium text-brand">{article.title}</p>
              <p className="mt-1 text-xs text-muted">
                {article.author.name}
                {article.publishedAt ? ` · ${formatDate(article.publishedAt)}` : ""}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {/* Fade the top and bottom edges into the card background. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
