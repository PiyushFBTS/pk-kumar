import { getCurrentUser } from "@/lib/session";
import { json } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  return json({ user: user ?? null });
}
