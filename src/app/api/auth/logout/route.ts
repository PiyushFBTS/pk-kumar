import { deleteSession } from "@/lib/session";
import { json } from "@/lib/api";

export async function POST() {
  await deleteSession();
  return json({ ok: true });
}
