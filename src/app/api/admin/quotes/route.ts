import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { json, apiError } from "@/lib/api";
import { quoteSchema } from "@/lib/validation";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return apiError("Forbidden", 403);

  const quotes = await prisma.partnerQuote.findMany({
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });
  return json({ quotes });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return apiError("Forbidden", 403);

  const body = await req.json().catch(() => null);
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Invalid input", 400, { issues: parsed.error.flatten().fieldErrors });
  }

  const quote = await prisma.partnerQuote.create({ data: parsed.data });
  return json({ quote }, 201);
}
