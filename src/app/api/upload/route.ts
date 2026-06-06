import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/session";
import { apiError, json, getClientIp } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { env } from "@/lib/env";

export const runtime = "nodejs"; // needs the Node fs APIs

const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated", 401);

  if (!rateLimit(`upload:${getClientIp(req)}`, 30, 60_000).ok) {
    return apiError("Too many uploads. Please slow down.", 429);
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return apiError("No file provided", 400);

  const ext = ALLOWED.get(file.type);
  if (!ext) return apiError("Unsupported image type (use JPG, PNG, WebP or GIF).", 415);

  const maxBytes = env.upload.maxMb * 1024 * 1024;
  if (file.size > maxBytes) return apiError(`Image exceeds ${env.upload.maxMb}MB limit.`, 413);

  const name = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

  return json({ url: `/uploads/${name}` }, 201);
}
