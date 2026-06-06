import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { json, apiError } from "@/lib/api";
import { hashPassword } from "@/lib/password";
import { adminUserCreateSchema } from "@/lib/validation";

// GET /api/admin/users — list all users.
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return apiError("Forbidden", 403);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
      _count: { select: { articles: true } },
    },
  });
  return json({ users });
}

// POST /api/admin/users — create a user.
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return apiError("Forbidden", 403);

  const body = await req.json().catch(() => null);
  const parsed = adminUserCreateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Invalid input", 400, { issues: parsed.error.flatten().fieldErrors });
  }

  const { name, email, password, role } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return apiError("A user with this email already exists.", 409);

  const user = await prisma.user.create({
    data: { name, email, passwordHash: await hashPassword(password), role },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
  return json({ user }, 201);
}
