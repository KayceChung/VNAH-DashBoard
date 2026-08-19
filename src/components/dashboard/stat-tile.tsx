import type { LucideIcon } from "lucide-react";
import { InfoTooltip } from "@/components/dashboard/info-tooltip";

interface StatTileProps {
  icon: LucideIcon;
  label: string;
  value: number | null;
  suffix?: string;
  info?: string;
}

export function StatTile({ icon: Icon, label, value, suffix, info }: StatTileProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold tabular-nums leading-tight">
          {value !== null ? `${value.toLocaleString("vi-VN")}${suffix ?? ""}` : "N/A"}
        </p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {label}
          {info && <InfoTooltip text={info} />}
        </p>
      </div>
    </div>
  );
}
