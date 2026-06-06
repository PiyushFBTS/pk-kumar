import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { json, apiError } from "@/lib/api";
import { adminUserUpdateSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/admin/users/:id — toggle active / change role.
export async function PATCH(req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return apiError("Forbidden", 403);

  const id = Number((await params).id);
  if (!Number.isInteger(id)) return apiError("Invalid id", 400);

  const body = await req.json().catch(() => null);
  const parsed = adminUserUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Invalid input", 400, { issues: parsed.error.flatten().fieldErrors });
  }

  // Guard against an admin locking themselves out.
  if (id === admin.id) {
    if (parsed.data.active === false) return apiError("You cannot deactivate yourself.", 400);
    if (parsed.data.role === "USER") return apiError("You cannot demote yourself.", 400);
  }

  const existing = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return apiError("Not found", 404);

  const user = await prisma.user.update({
    where: { id },
    data: parsed.data,
    select: { id: true, name: true, email: true, role: true, active: true },
  });
  return json({ user });
}
