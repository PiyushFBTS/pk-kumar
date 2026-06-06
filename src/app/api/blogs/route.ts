import { getApprovedArticles } from "@/lib/blogs";
import { json } from "@/lib/api";

// Public, read-only feed of approved articles (used by the Home page).
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const page = Number(params.get("page") ?? "1");
  const limit = Math.min(24, Math.max(1, Number(params.get("limit") ?? "6")));

  const data = await getApprovedArticles(page, limit);
  return json(data);
}
