"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const SunIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden
    className="h-5 w-5"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const MoonIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden
    className="h-5 w-5"
  >
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

// Toggles the `.dark` class on <html> and persists the choice. The initial
// class is set by an inline no-FOUC script in the root layout, so we only
// reflect the current state here (after mount, to avoid hydration mismatch).
export function ThemeToggle({ className }: { className?: string }) {
  const [state, setState] = useState({ mounted: false, dark: false });
  const { mounted, dark } = state;

  useEffect(() => {
    // Reflect the class the inline no-FOUC script already applied to <html>.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ mounted: true, dark: document.documentElement.classList.contains("dark") });
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* ignore storage failures (private mode) */
    }
    setState((s) => ({ ...s, dark: next }));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mounted && dark ? "Switch to light mode" : "Switch to dark mode"}
      title="Toggle theme"
      className={cn(
        "rounded p-2 text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent",
        className,
      )}
    >
      {/* Render the icon only after mount to keep SSR/CSR markup identical. */}
      <span className="block h-5 w-5">{mounted ? (dark ? SunIcon : MoonIcon) : null}</span>
    </button>
  );
}
