import { NotAvailable } from "@/components/dashboard/not-available";
import { sequentialStep } from "@/lib/utils";
import type { HeatmapCell } from "@/types/domain";

const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function ActivityHeatmap({ cells, staffIds, staffLabels }: { cells: HeatmapCell[]; staffIds: string[]; staffLabels: Map<string, string> }) {
  if (staffIds.length === 0 || cells.every((c) => c.count === 0)) {
    return <NotAvailable reason="Chưa có phiếu nào được ghi nhận trong khoảng thời gian này." />;
  }

  const byKey = new Map<string, number>();
  for (const cell of cells) byKey.set(`${cell.weekday}-${cell.staffId}`, cell.count);
  const max = Math.max(1, ...cells.map((c) => c.count));

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate text-xs" style={{ borderSpacing: 4 }}>
        <thead>
          <tr>
            <th className="w-24 text-left font-medium text-muted-foreground" />
            {WEEKDAY_LABELS.map((label) => (
              <th key={label} className="w-9 text-center font-medium text-muted-foreground">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {staffIds.map((staffId) => (
            <tr key={staffId}>
              <td className="truncate pr-2 text-right font-medium text-[var(--viz-ink-secondary)]" title={staffLabels.get(staffId)}>
                {staffLabels.get(staffId) ?? "—"}
              </td>
              {WEEKDAY_LABELS.map((_, weekday) => {
                const count = byKey.get(`${weekday}-${staffId}`) ?? 0;
                return (
                  <td key={weekday}>
                    <div
                      className="mx-auto flex h-8 w-8 items-center justify-center rounded-md text-[10px] font-medium tabular-nums"
                      style={{
                        backgroundColor: count > 0 ? sequentialStep(count, max) : "var(--viz-grid)",
                        color: count > 0 ? "#fff" : "var(--viz-ink-muted)",
                      }}
                      title={`${staffLabels.get(staffId)} · ${WEEKDAY_LABELS[weekday]}: ${count} phiếu`}
                    >
                      {count > 0 ? count : ""}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
