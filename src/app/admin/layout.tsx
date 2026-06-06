import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Container } from "@/components/ui/container";

const adminNav = [
  { label: "Dashboard", href: "/admin" },
  { label: "Approvals", href: "/admin/approvals" },
  { label: "All Articles", href: "/admin/articles" },
  { label: "Quotes", href: "/admin/quotes" },
  { label: "Resources", href: "/admin/resources" },
  { label: "Enquiries", href: "/admin/enquiries" },
  { label: "Applications", href: "/admin/careers" },
  { label: "Users", href: "/admin/users" },
];

// Authoritative guard for the admin area — requires an active ADMIN user.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/account/articles");

  return (
    <div>
      <div className="border-b border-border bg-surface">
        <Container className="flex flex-wrap items-center gap-x-6 gap-y-2 py-3 text-sm">
          <span className="font-semibold text-brand">Admin</span>
          {adminNav.map((item) => (
            <Link key={item.href} href={item.href} className="text-muted hover:text-brand">
              {item.label}
            </Link>
          ))}
        </Container>
      </div>
      {children}
    </div>
  );
}
