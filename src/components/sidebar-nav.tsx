"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  canViewAuditLogs: boolean;
}

const items = [
  { href: "/dashboard/reports", label: "Báo cáo", icon: FileText, requiresAdmin: false },
  { href: "/dashboard/audit-logs", label: "Nhật ký giám sát", icon: ShieldCheck, requiresAdmin: true },
];

export function SidebarNav({ canViewAuditLogs }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items
        .filter((item) => !item.requiresAdmin || canViewAuditLogs)
        .map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
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
