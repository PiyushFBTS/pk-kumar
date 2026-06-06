import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { env } from "@/lib/env";

// Edge-safe session token utilities (jose works in both proxy/edge and node).
const key = new TextEncoder().encode(env.jwt.accessSecret);
const ALG = "HS256";

export type Role = "USER" | "ADMIN";

export interface SessionPayload extends JWTPayload {
  sub: string; // user id (as string)
  email: string;
  name: string;
  role: Role;
}

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function encryptSession(payload: {
  sub: string;
  email: string;
  name: string;
  role: Role;
}): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function decryptSession(token?: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: [ALG] });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}
