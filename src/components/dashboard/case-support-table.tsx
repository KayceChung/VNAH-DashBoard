import type { CaseSupportCount } from "@/types/domain";

/** Per-case totals for one staff member — "ghi nhận tổng theo từng hồ sơ". */
export function CaseSupportTable({ data }: { data: CaseSupportCount[] }) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Chưa có phiếu nào được ghi nhận trong khoảng thời gian này.
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Hồ sơ (Người thụ hưởng)
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Số phiếu đã ghi nhận
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row) => (
            <tr key={row.caseId} className="hover:bg-muted/40">
              <td className="px-3 py-2 font-medium">{row.beneficiaryName}</td>
              <td className="px-3 py-2 text-right tabular-nums">{row.count.toLocaleString("vi-VN")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
