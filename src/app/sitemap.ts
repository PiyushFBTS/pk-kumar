import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Flatten the nav into a list of public URLs.
function paths(): string[] {
  const out = new Set<string>(["/"]);
  for (const item of site.nav) {
    out.add(item.href);
    if ("children" in item) {
      for (const child of item.children) out.add(child.href);
    }
  }
  return [...out];
}

export default function sitemap(): MetadataRoute.Sitemap {
  return paths().map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
