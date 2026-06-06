import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptSession } from "@/lib/jwt";

// Next.js 16 renamed Middleware to Proxy. This performs OPTIMISTIC auth checks
// only (redirects). Authoritative role/active checks live in the server-side
// layouts via getCurrentUser (the Data Access Layer).
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await decryptSession(req.cookies.get("session")?.value);

  if (!session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // /admin requires the ADMIN role (role is embedded in the session token).
  if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/account/articles", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
