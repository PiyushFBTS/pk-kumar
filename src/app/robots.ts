import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep authenticated/admin areas out of search indexes.
      disallow: ["/admin", "/account", "/login"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
