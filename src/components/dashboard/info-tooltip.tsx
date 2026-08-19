"use client";

import { useId, useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  text: string;
  className?: string;
}

// Dependency-free hover/focus tooltip (no Radix in this project) — a small
// "i" icon next to a heading that reveals an explanation box, so first-time
// users can learn what a chart/number means without leaving the page.
export function InfoTooltip({ text, className }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-describedby={tooltipId}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Info className="h-3.5 w-3.5" />
        <span className="sr-only">Giải thích</span>
      </button>

      {open && (
        <span
          role="tooltip"
          id={tooltipId}
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-md border border-border bg-card p-2.5 text-xs leading-relaxed text-foreground shadow-md"
        >
          {text}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-border" />
          <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-px border-4 border-transparent border-t-card" />
        </span>
      )}
    </span>
  );
}
