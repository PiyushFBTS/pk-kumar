import { getCurrentUser, createSession } from "@/lib/session";
import { json, apiError } from "@/lib/api";

// Sliding session: re-issue a fresh-expiry session cookie for an active user.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated", 401);
  await createSession(user);
  return json({ user });
}
