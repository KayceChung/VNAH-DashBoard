import { NotAvailable } from "@/components/dashboard/not-available";
import type { StaffPerformanceRow } from "@/types/domain";

const COMMITTED_COLOR = "var(--viz-series-1)";
const DRAFT_COLOR = "var(--viz-series-2)";

interface CompletionStackedListProps {
  rows: StaffPerformanceRow[];
  limit?: number;
}

export function CompletionStackedList({ rows, limit = 10 }: CompletionStackedListProps) {
  const withData = rows.filter((r) => r.formsCommitted + r.formsDrafted > 0).slice(0, limit);

  if (withData.length === 0) {
    return <NotAvailable reason="Chưa có phiếu nào (kể cả bản nháp) trong khoảng thời gian này." />;
  }

  return (
    <div className="space-y-3">
      {withData.map((row) => {
        const total = row.formsCommitted + row.formsDrafted;
        const committedPct = (row.formsCommitted / total) * 100;
        const draftPct = 100 - committedPct;
        return (
          <div key={row.staffId}>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span className="truncate font-medium">{row.fullName}</span>
              <span className="shrink-0 tabular-nums text-xs text-muted-foreground">
                {row.formsCommitted}/{total} đã ghi nhận
              </span>
            </div>
            <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-[var(--viz-grid)]">
              {committedPct > 0 && (
                <div
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{ width: `${committedPct}%`, backgroundColor: COMMITTED_COLOR }}
                  title={`Đã ghi nhận: ${row.formsCommitted}`}
                />
              )}
              {draftPct > 0 && (
                <div
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{ width: `${draftPct}%`, backgroundColor: DRAFT_COLOR }}
                  title={`Bản nháp: ${row.formsDrafted}`}
                />
              )}
            </div>
          </div>
        );
      })}
      <div className="flex gap-4 pt-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COMMITTED_COLOR }} />
          Đã ghi nhận
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: DRAFT_COLOR }} />
          Bản nháp (chưa chốt)
        </span>
      </div>
    </div>
  );
}
