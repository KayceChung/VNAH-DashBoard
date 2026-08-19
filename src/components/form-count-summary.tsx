import { InfoTooltip } from "@/components/dashboard/info-tooltip";
import type { FormSupportCount } from "@/types/domain";

const CATEGORY_LABEL: Record<string, string> = {
  CSTN: "CSTN — Công tác xã hội",
  PHCN: "PHCN — Phục hồi chức năng",
};
const CATEGORY_ORDER = ["CSTN", "PHCN"];

/** Compact "total by form type" summary — sits above the itemized reports table, grouped by chương trình (CSTN/PHCN) since the two programs' form sets are otherwise unrelated to each other. */
export function FormCountSummary({ data }: { data: FormSupportCount[] }) {
  if (data.length === 0) return null;

  const total = data.reduce((sum, row) => sum + row.count, 0);

  const categories = [...new Set(data.map((row) => row.category))].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b),
  );

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold">
          Tổng lượt theo loại phiếu
          <InfoTooltip text="Tổng số phiếu đã ghi nhận (chốt), gộp theo từng loại phiếu và chia theo 2 chương trình CSTN (Công tác xã hội) và PHCN (Phục hồi chức năng)." />
        </h2>
        <span className="text-xs text-muted-foreground">
          {total.toLocaleString("vi-VN")} phiếu · {data.length} loại
        </span>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {categories.map((category) => {
          const rows = data.filter((row) => row.category === category).sort((a, b) => b.count - a.count);
          const subtotal = rows.reduce((sum, row) => sum + row.count, 0);
          return (
            <div key={category}>
              <div className="mb-1.5 flex items-baseline justify-between border-b border-border pb-1">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--viz-ink-secondary)]">
                  {CATEGORY_LABEL[category] ?? category}
                </h3>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {subtotal.toLocaleString("vi-VN")} phiếu
                </span>
              </div>
              <div className="space-y-1">
                {rows.map((row) => (
                  <div key={row.code} className="flex items-center justify-between gap-3 py-1 text-sm">
                    <span className="truncate text-[var(--viz-ink-secondary)]" title={row.name}>
                      {row.name}
                    </span>
                    <span className="shrink-0 tabular-nums font-medium">{row.count.toLocaleString("vi-VN")}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
