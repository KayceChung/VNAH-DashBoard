import type { StaffPerformanceRow } from "@/types/domain";

export function PerformanceTable({ rows }: { rows: StaffPerformanceRow[] }) {
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Chưa có dữ liệu nhân sự.</p>;
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Nhân sự / CTV
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Chức danh
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Phiếu đã ghi nhận
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Hồ sơ đã mở
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
              NKT phụ trách
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.staffId} className="hover:bg-muted/40">
              <td className="px-3 py-2 font-medium">{row.fullName}</td>
              <td className="px-3 py-2 text-muted-foreground">{row.title ?? "—"}</td>
              <td className="px-3 py-2 text-right tabular-nums">{row.formsCommitted.toLocaleString("vi-VN")}</td>
              <td className="px-3 py-2 text-right tabular-nums">{row.casesOpened.toLocaleString("vi-VN")}</td>
              <td className="px-3 py-2 text-right tabular-nums">
                {row.beneficiariesAssigned.toLocaleString("vi-VN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
