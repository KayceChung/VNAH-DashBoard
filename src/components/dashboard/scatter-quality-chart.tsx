"use client";

import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { NotAvailable } from "@/components/dashboard/not-available";
import type { ScatterDatum } from "@/types/domain";

interface TooltipPayloadItem {
  payload: ScatterDatum;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  const first = payload?.[0];
  if (!active || !first) return null;
  const row = first.payload;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-[var(--viz-ink-primary)]">{row.label}</p>
      <p className="text-[var(--viz-ink-secondary)]">{row.volume.toLocaleString("vi-VN")} phiếu</p>
      <p className="text-[var(--viz-ink-secondary)]">{row.revisions.toFixed(1)} lần chỉnh sửa/phiếu (TB)</p>
    </div>
  );
}

export function ScatterQualityChart({ data }: { data: ScatterDatum[] }) {
  if (data.length === 0) {
    return (
      <NotAvailable reason="Chưa có nhân sự nào có phiếu đã ghi nhận với dữ liệu lịch sử chỉnh sửa trong khoảng thời gian này." />
    );
  }

  return (
    <div style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="var(--viz-grid)" />
          <XAxis
            type="number"
            dataKey="volume"
            name="Khối lượng"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "var(--viz-ink-muted)" }}
            axisLine={{ stroke: "var(--viz-baseline)" }}
            tickLine={false}
            label={{ value: "Số phiếu đã ghi nhận", position: "insideBottom", offset: -4, fontSize: 11, fill: "var(--viz-ink-muted)" }}
          />
          <YAxis
            type="number"
            dataKey="revisions"
            name="Chỉnh sửa"
            tick={{ fontSize: 11, fill: "var(--viz-ink-muted)" }}
            axisLine={false}
            tickLine={false}
            width={32}
            label={{ value: "Số lần chỉnh sửa TB", angle: -90, position: "insideLeft", fontSize: 11, fill: "var(--viz-ink-muted)" }}
          />
          <ZAxis range={[80, 80]} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<ChartTooltip />} />
          <Scatter data={data} fill="var(--viz-sequential-450)" fillOpacity={0.8} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
