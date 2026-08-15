"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { NotAvailable } from "@/components/dashboard/not-available";
import type { RadarAxisDatum } from "@/types/domain";

interface TooltipPayloadItem {
  payload: RadarAxisDatum;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  const first = payload?.[0];
  if (!active || !first) return null;
  const row = first.payload;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-[var(--viz-ink-primary)]">{row.axis}</p>
      <p style={{ color: "var(--viz-series-1)" }}>Nhân sự này: percentile {row.individual}</p>
      <p style={{ color: "var(--viz-series-2)" }}>Trung bình team: percentile {row.teamAverage}</p>
    </div>
  );
}

export function RadarComparisonChart({ data, teamSize }: { data: RadarAxisDatum[]; teamSize: number }) {
  if (teamSize < 2) {
    return (
      <NotAvailable reason={`Cần ít nhất 2 nhân sự có dữ liệu trong khoảng thời gian này để so sánh percentile (hiện có ${teamSize}).`} />
    );
  }

  return (
    <div style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="var(--viz-grid)" />
          <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: "var(--viz-ink-secondary)" }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "var(--viz-ink-muted)" }} tickCount={3} />
          <Tooltip content={<ChartTooltip />} />
          <Radar
            name="Nhân sự này"
            dataKey="individual"
            stroke="var(--viz-series-1)"
            fill="var(--viz-series-1)"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Radar
            name="Trung bình team"
            dataKey="teamAverage"
            stroke="var(--viz-series-2)"
            fill="var(--viz-series-2)"
            fillOpacity={0.12}
            strokeWidth={2}
            strokeDasharray="4 3"
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--viz-series-1)" }} />
          Nhân sự này
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border border-dashed" style={{ borderColor: "var(--viz-series-2)" }} />
          Trung bình team (percentile 50)
        </span>
      </div>
    </div>
  );
}
