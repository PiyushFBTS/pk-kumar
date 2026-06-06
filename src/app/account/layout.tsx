import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

// Authoritative guard for the signed-in user area.
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/articles");
  return <>{children}</>;
}
