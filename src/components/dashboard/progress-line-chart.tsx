"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { NotAvailable } from "@/components/dashboard/not-available";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import type { ImprovementStatus, ProgressSeries } from "@/types/domain";

const STATUS_LABEL: Record<ImprovementStatus, string> = {
  cai_thien: "Cải thiện",
  on_dinh: "Ổn định",
  khong_cai_thien: "Không cải thiện",
  "-": "Chưa đủ dữ liệu",
};

const STATUS_VARIANT: Record<ImprovementStatus, BadgeProps["variant"]> = {
  cai_thien: "success",
  on_dinh: "outline",
  khong_cai_thien: "destructive",
  "-": "muted",
};

interface ChartDatum {
  createdAt: string;
  score: number;
  dateLabel: string;
}

interface TooltipPayloadItem {
  payload: ChartDatum;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  const first = payload?.[0];
  if (!active || !first) return null;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-[var(--viz-ink-primary)]">{formatDateTime(first.payload.createdAt)}</p>
      <p className="text-[var(--viz-ink-secondary)]">Điểm: {first.payload.score}</p>
    </div>
  );
}

function SeriesChart({ series }: { series: ProgressSeries }) {
  const data: ChartDatum[] = series.points.map((p) => ({
    createdAt: p.createdAt,
    score: p.score,
    dateLabel: new Date(p.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">{series.seriesLabel}</p>
          <p className="text-xs text-muted-foreground">↓ điểm càng thấp = càng tốt</p>
        </div>
        <Badge variant={STATUS_VARIANT[series.latestStatus]}>{STATUS_LABEL[series.latestStatus]}</Badge>
      </div>
      {data.length < 2 ? (
        <NotAvailable
          reason={`Cần ít nhất 2 lần ghi nhận ${series.seriesLabel} để vẽ xu hướng (hiện có ${data.length}).`}
        />
      ) : (
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 11, fill: "var(--viz-ink-muted)" }}
                axisLine={{ stroke: "var(--viz-baseline)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--viz-ink-muted)" }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--viz-series-1)"
                strokeWidth={2}
                dot={{ r: 3, fill: "var(--viz-series-1)", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export function ProgressLineChart({ series }: { series: ProgressSeries[] }) {
  if (series.length === 0) {
    return (
      <NotAvailable reason="NKT này chưa có phiếu VietPOS (CSTN) hoặc WHODAS/WHODAS-TETN (PHCN) nào được ghi nhận." />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {series.map((s) => (
        <SeriesChart key={s.formCode} series={s} />
      ))}
    </div>
  );
}
