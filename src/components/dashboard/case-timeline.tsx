"use client";

import { useState } from "react";
import { CheckSquare, FileCheck2, FileText, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const PAGE_SIZE = 10;

/** Caps the timeline to a handful of events at a time — a NKT hỗ trợ >30 lần would otherwise render one very long, hard-to-scan list. All events are already fetched, so "Xem thêm" just reveals more of what's in memory, no extra request. */
export function CaseTimeline({ events }: { events: TimelineEvent[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Chưa có sự kiện nào được ghi nhận cho NKT này.
      </div>
    );
  }

  const visibleEvents = events.slice(0, visibleCount);

  return (
    <div className="space-y-3">
      <ol className="relative space-y-4 border-l border-border pl-5">
        {visibleEvents.map((event, idx) => {
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

      {visibleCount < events.length ? (
        <div className="flex flex-col items-center gap-2 pl-5">
          <Button size="sm" variant="outline" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
            Xem thêm ({visibleEvents.length}/{events.length})
          </Button>
        </div>
      ) : events.length > PAGE_SIZE ? (
        <p className="pl-5 text-center text-xs text-muted-foreground">
          Đã hiển thị toàn bộ {events.length.toLocaleString("vi-VN")} sự kiện.
        </p>
      ) : null}
    </div>
  );
}
