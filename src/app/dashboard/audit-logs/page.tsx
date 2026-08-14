import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

const PAGE_LIMIT = 100;

interface AuditLogQueryRow {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  resource_path: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  staff: { full_name: string } | null;
}

export default async function AuditLogsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: staff } = await supabase.from("staff").select("role").eq("user_id", user.id).single();
  if (!staff || (staff.role !== "admin" && staff.role !== "manager")) {
    redirect("/dashboard/reports");
  }

  // RLS (audit_logs_select_admin) is the real gate here — this in-page check
  // just avoids rendering an empty page for a staff role that would get
  // zero rows back anyway.
  const { data } = await supabase
    .from("audit_logs")
    .select("id, action, resource_type, resource_id, resource_path, ip_address, user_agent, created_at, staff:staff(full_name)")
    .order("created_at", { ascending: false })
    .limit(PAGE_LIMIT);

  const logs = (data as AuditLogQueryRow[] | null) ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Nhật ký giám sát</h1>
        <p className="text-sm text-muted-foreground">
          Mỗi lượt cấp liên kết xem PDF/Excel bảo mật được ghi lại theo §164.312(b) — ai xem, xem gì, lúc nào,
          từ IP nào.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Thời gian</TableHead>
            <TableHead>Nhân sự</TableHead>
            <TableHead>Hành động</TableHead>
            <TableHead>Tài nguyên</TableHead>
            <TableHead>Đường dẫn</TableHead>
            <TableHead>IP</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                Chưa có nhật ký nào.
              </TableCell>
            </TableRow>
          )}
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="text-sm text-muted-foreground">{formatDateTime(log.created_at)}</TableCell>
              <TableCell className="font-medium">{log.staff?.full_name ?? "—"}</TableCell>
              <TableCell>
                <Badge variant={log.action === "VIEW_EXCEL" ? "muted" : "outline"}>{log.action}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{log.resource_type}</TableCell>
              <TableCell className="max-w-xs truncate font-mono text-xs text-muted-foreground" title={log.resource_path}>
                {log.resource_path}
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">{log.ip_address ?? "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
