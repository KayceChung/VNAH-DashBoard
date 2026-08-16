import type { LucideIcon } from "lucide-react";

interface InfoTileProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

/** Text-valued sibling of StatTile, for quick-stat tiles whose value isn't a number (staff name, appointment date). */
export function InfoTile({ icon: Icon, label, value }: InfoTileProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-base font-semibold leading-tight" title={value}>
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
