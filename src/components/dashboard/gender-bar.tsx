import type { GenderCount } from "@/types/domain";

const SERIES_COLORS = ["var(--viz-series-1)", "var(--viz-series-2)"];

interface GenderBarProps {
  data: GenderCount[];
  total: number;
}

export function GenderBar({ data, total }: GenderBarProps) {
  if (total === 0 || data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Chưa có dữ liệu.</p>;
  }

  return (
    <div>
      <div className="flex h-7 w-full gap-0.5 overflow-hidden rounded-full bg-[var(--viz-grid)]">
        {data.map((item, i) => {
          const pct = (item.count / total) * 100;
          if (pct <= 0) return null;
          return (
            <div
              key={item.label}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ width: `${pct}%`, backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }}
              title={`${item.label}: ${item.count} (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {data.map((item, i) => {
          const pct = (item.count / total) * 100;
          return (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }}
              />
              <span className="font-medium text-[var(--viz-ink-primary)]">{item.label}</span>
              <span className="tabular-nums text-[var(--viz-ink-secondary)]">
                {item.count.toLocaleString("vi-VN")} ({pct.toFixed(1)}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
