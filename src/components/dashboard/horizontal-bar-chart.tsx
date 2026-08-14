"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { sequentialStep } from "@/lib/utils";

export interface HorizontalBarDatum {
  key: string;
  label: string;
  count: number;
}

interface HorizontalBarChartProps {
  data: HorizontalBarDatum[];
  emptyLabel: string;
  unitLabel: string;
  labelWidth?: number;
}

const BAR_HEIGHT = 32;
const CHART_MARGIN = { top: 8, right: 32, bottom: 8, left: 8 };

interface TooltipPayloadItem {
  payload: HorizontalBarDatum;
}

function ChartTooltip({
  active,
  payload,
  unitLabel,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  unitLabel: string;
}) {
  const first = payload?.[0];
  if (!active || !first) return null;
  const row = first.payload;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-[var(--viz-ink-primary)]">{row.label}</p>
      <p className="text-[var(--viz-ink-secondary)]">
        {row.count.toLocaleString("vi-VN")} {unitLabel}
      </p>
    </div>
  );
}

export function HorizontalBarChart({ data, emptyLabel, unitLabel, labelWidth = 220 }: HorizontalBarChartProps) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  const max = Math.max(...data.map((d) => d.count));

  return (
    <div style={{ height: data.length * BAR_HEIGHT + 24 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={CHART_MARGIN} barCategoryGap={6}>
          <CartesianGrid horizontal={false} stroke="var(--viz-grid)" />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "var(--viz-ink-muted)" }}
            axisLine={{ stroke: "var(--viz-baseline)" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={labelWidth}
            tick={{ fontSize: 12, fill: "var(--viz-ink-secondary)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip cursor={{ fill: "var(--viz-grid)" }} content={<ChartTooltip unitLabel={unitLabel} />} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
            {data.map((row) => (
              <Cell key={row.key} fill={sequentialStep(row.count, max)} />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              formatter={(value) => Number(value).toLocaleString("vi-VN")}
              style={{ fill: "var(--viz-ink-secondary)", fontSize: 11 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
