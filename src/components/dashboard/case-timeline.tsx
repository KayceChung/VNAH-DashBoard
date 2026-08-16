import { CheckSquare, FileCheck2, FileText, FolderOpen } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { TimelineEvent, TimelineEventType } from "@/types/domain";

const TYPE_ICON: Record<TimelineEventType, typeof FileText> = {
  assessment_form: FileText,
  consent: FileCheck2,
  ccdc_form: CheckSquare,
  case_opened: FolderOpen,
};

const TYPE_LABEL: Record<TimelineEventType, string> = {
  assessment_form: "Phiếu đánh giá",
  consent: "Đồng thuận",
  ccdc_form: "Cấp CCDC",
  case_opened: "Mở hồ sơ",
};

export function CaseTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Chưa có sự kiện nào được ghi nhận cho NKT này.
      </div>
    );
  }

  return (
    <ol className="relative space-y-4 border-l border-border pl-5">
      {events.map((event, idx) => {
        const Icon = TYPE_ICON[event.type];
        return (
          <li key={`${event.type}-${event.eventAt}-${idx}`} className="relative">
            <span className="absolute -left-[27px] flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-[var(--viz-series-1)]">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-sm font-medium">{TYPE_LABEL[event.type]}</span>
              <span className="text-xs text-muted-foreground">{event.label}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(event.eventAt)}
              {event.status ? ` · ${event.status}` : ""}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
