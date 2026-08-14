import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarNav } from "@/components/sidebar-nav";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: staff } = await supabase
    .from("staff")
    .select("full_name, role")
    .eq("user_id", user.id)
    .single();

  if (!staff) redirect("/login");

  const canViewAuditLogs = staff.role === "admin" || staff.role === "manager";

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card px-4 py-6 md:block">
        <div className="mb-6 px-2">
          <p className="text-sm font-semibold">VNAH Dashboard</p>
          <p className="text-xs text-muted-foreground">Báo cáo &amp; giám sát PDF</p>
        </div>
        <SidebarNav canViewAuditLogs={canViewAuditLogs} />
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
          <div>
            <p className="text-sm font-medium">{staff.full_name}</p>
            <p className="text-xs capitalize text-muted-foreground">{staff.role}</p>
          </div>
          <SignOutButton />
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
