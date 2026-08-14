"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, ShieldCheck, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  canViewAdminSections: boolean;
}

const items = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard, requiresAdmin: false, exact: true },
  { href: "/dashboard/reports", label: "Báo cáo", icon: FileText, requiresAdmin: false, exact: false },
  { href: "/dashboard/performance", label: "Hiệu suất nhân sự", icon: TrendingUp, requiresAdmin: true, exact: false },
  { href: "/dashboard/audit-logs", label: "Nhật ký giám sát", icon: ShieldCheck, requiresAdmin: true, exact: false },
];

export function SidebarNav({ canViewAdminSections }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items
        .filter((item) => !item.requiresAdmin || canViewAdminSections)
        .map((item) => {
          const Icon = item.icon;
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
    </nav>
  );
}
