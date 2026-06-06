import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  encryptSession,
  decryptSession,
  SESSION_MAX_AGE_SECONDS,
  type Role,
  type SessionPayload,
} from "@/lib/jwt";

// Server-only Data Access Layer for sessions. Imported by route handlers and
// server components only (uses next/headers — would error in a client bundle).
const COOKIE = "session";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export async function createSession(user: SessionUser): Promise<void> {
  const token = await encryptSession({
    sub: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role,
  });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return decryptSession(cookieStore.get(COOKIE)?.value);
}

// Authoritative check: re-reads the DB so deactivated users and role changes
// take effect immediately, regardless of what the (stateless) token claims.
export async function getCurrentUser(): Promise<SessionUser | null> {
  const payload = await getSessionPayload();
  if (!payload?.sub) return null;

  const user = await prisma.user.findUnique({
    where: { id: Number(payload.sub) },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
  if (!user || !user.active) return null;

  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// Returns the current user only if they are an active ADMIN, else null.
// For guarding admin route handlers.
export async function requireAdmin(): Promise<SessionUser | null> {
  const user = await getCurrentUser();
  return user && user.role === "ADMIN" ? user : null;
}
