import { AlertTriangle, Info, TriangleAlert } from "lucide-react";
import type { AlertSeverity, CaseAlert } from "@/types/domain";

const SEVERITY_STYLE: Record<AlertSeverity, string> = {
  critical: "border-destructive/30 bg-destructive/5 text-destructive",
  warning: "border-amber-300 bg-amber-50 text-amber-800",
  info: "border-border bg-muted/50 text-muted-foreground",
};

const SEVERITY_ICON: Record<AlertSeverity, typeof AlertTriangle> = {
  critical: AlertTriangle,
  warning: TriangleAlert,
  info: Info,
};

export function CaseAlerts({ alerts }: { alerts: CaseAlert[] }) {
  if (alerts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Không có cảnh báo nào đang hoạt động cho NKT này.</p>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert) => {
        const Icon = SEVERITY_ICON[alert.severity];
        return (
          <div
            key={alert.key}
            className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${SEVERITY_STYLE[alert.severity]}`}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{alert.label}</span>
          </div>
        );
      })}
    </div>
  );
}
