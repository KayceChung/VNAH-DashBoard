import { NotAvailable } from "@/components/dashboard/not-available";
import type { FunnelStepDatum } from "@/types/domain";

const SEQUENTIAL_STEPS = [
  "var(--viz-sequential-250)",
  "var(--viz-sequential-450)",
  "var(--viz-sequential-650)",
];

export function FunnelSteps({ data }: { data: FunnelStepDatum[] }) {
  if (data.length === 0 || data[0]?.count === 0) {
    return <NotAvailable reason="Chưa có phiếu nào được tạo trong khoảng thời gian này." />;
  }

  const max = data[0]?.count ?? 1;

  return (
    <div className="space-y-3">
      {data.map((step, i) => {
        const pct = max > 0 ? (step.count / max) * 100 : 0;
        const dropFromPrev = i > 0 ? (data[i - 1]?.count ?? 0) - step.count : null;
        return (
          <div key={step.label}>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span className="font-medium text-[var(--viz-ink-primary)]">{step.label}</span>
              <span className="tabular-nums text-[var(--viz-ink-secondary)]">
                {step.count.toLocaleString("vi-VN")}
                {i > 0 && <span className="ml-1 text-xs text-muted-foreground">({pct.toFixed(0)}%)</span>}
              </span>
            </div>
            <div className="h-6 w-full overflow-hidden rounded-full bg-[var(--viz-grid)]">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: SEQUENTIAL_STEPS[Math.min(i, 2)] }}
              />
            </div>
            {dropFromPrev !== null && dropFromPrev > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                −{dropFromPrev.toLocaleString("vi-VN")} so với bước trước
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
