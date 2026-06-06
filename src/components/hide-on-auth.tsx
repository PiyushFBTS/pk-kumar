"use client";

import { usePathname } from "next/navigation";

// Hides its children on auth routes (e.g. the footer on /login).
export function HideOnAuth({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/login")) return null;
  return <>{children}</>;
}
