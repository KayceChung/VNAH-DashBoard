"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { NotAvailable } from "@/components/dashboard/not-available";
import type { TrendPoint } from "@/types/domain";

interface TrendLineChartProps {
  data: TrendPoint[];
  unitLabel: string;
}

interface TooltipPayloadItem {
  payload: TrendPoint;
}

function ChartTooltip({ active, payload, unitLabel }: { active?: boolean; payload?: TooltipPayloadItem[]; unitLabel: string }) {
  const first = payload?.[0];
  if (!active || !first) return null;
  const row = first.payload;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-[var(--viz-ink-primary)]">{row.monthLabel}</p>
      <p className="text-[var(--viz-ink-secondary)]">
        {row.count.toLocaleString("vi-VN")} {unitLabel}
      </p>
    </div>
  );
}

export function TrendLineChart({ data, unitLabel }: TrendLineChartProps) {
  if (data.length < 2) {
    return (
      <NotAvailable reason="Cần ít nhất 2 tháng có dữ liệu để vẽ xu hướng — khoảng thời gian đang chọn chưa đủ." />
    );
  }

  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--viz-sequential-450)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--viz-sequential-450)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
          <XAxis
            dataKey="monthLabel"
            tick={{ fontSize: 11, fill: "var(--viz-ink-muted)" }}
            axisLine={{ stroke: "var(--viz-baseline)" }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "var(--viz-ink-muted)" }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip content={<ChartTooltip unitLabel={unitLabel} />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--viz-sequential-450)"
            strokeWidth={2}
            fill="url(#trendFill)"
            dot={{ r: 3, fill: "var(--viz-sequential-450)", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
