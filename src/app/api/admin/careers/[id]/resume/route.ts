import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { apiError } from "@/lib/api";

export const runtime = "nodejs";

const RESUME_DIR = path.join(process.cwd(), "private-uploads", "resumes");
const MIME: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/careers/:id/resume — admin-only resume download.
export async function GET(_req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return apiError("Forbidden", 403);

  const id = Number((await params).id);
  if (!Number.isInteger(id)) return apiError("Invalid id", 400);

  const application = await prisma.jobApplication.findUnique({
    where: { id },
    select: { resume: true, name: true },
  });
  if (!application?.resume) return apiError("No resume on file", 404);

  // Guard against path traversal — only a bare filename is ever stored.
  const safe = path.basename(application.resume);
  const ext = safe.split(".").pop() ?? "";
  let data: Buffer;
  try {
    data = await readFile(path.join(RESUME_DIR, safe));
  } catch {
    return apiError("Resume file missing", 404);
  }

  const downloadName = `${application.name.replace(/[^a-z0-9]+/gi, "_")}_resume.${ext}`;
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": MIME[ext] ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${downloadName}"`,
    },
  });
}
