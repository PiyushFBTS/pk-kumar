import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { loginSchema } from "@/lib/validation";
import { json, apiError, getClientIp } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!rateLimit(`login:${ip}`, 10, 60_000).ok) {
    return apiError("Too many attempts. Please try again in a minute.", 429);
  }

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Invalid input", 400, { issues: parsed.error.flatten().fieldErrors });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Generic message + always-run compare avoids leaking which emails exist.
  const fallbackHash = "$2a$12$............................................................";
  const valid = await verifyPassword(password, user?.passwordHash ?? fallbackHash);

  if (!user || !valid || !user.active) {
    return apiError("Invalid email or password.", 401);
  }

  const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
  await createSession(safeUser);
  return json({ user: safeUser });
}
