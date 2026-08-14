import type { FormSupportCount } from "@/types/domain";

/** Compact "total by form type" summary — sits above the itemized reports table. */
export function FormCountSummary({ data }: { data: FormSupportCount[] }) {
  if (data.length === 0) return null;

  const total = data.reduce((sum, row) => sum + row.count, 0);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">Tổng lượt theo loại phiếu</h2>
        <span className="text-xs text-muted-foreground">
          {total.toLocaleString("vi-VN")} phiếu · {data.length} loại
        </span>
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((row) => (
          <div key={row.code} className="flex items-center justify-between gap-3 border-b border-border/60 py-1 text-sm">
            <span className="truncate text-[var(--viz-ink-secondary)]" title={row.name}>
              {row.name}
            </span>
            <span className="shrink-0 tabular-nums font-medium">{row.count.toLocaleString("vi-VN")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
