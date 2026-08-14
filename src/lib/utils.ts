import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Masks all but the last `visible` characters of a sensitive value, e.g. a
 * beneficiary phone number: "0901234567" -> "******4567".
 */
export function maskSensitive(value: string | null | undefined, visible = 4): string {
  if (!value) return "—";
  const trimmed = value.trim();
  if (trimmed.length <= visible) return "*".repeat(trimmed.length);
  return "*".repeat(trimmed.length - visible) + trimmed.slice(-visible);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

/** Sequential blue ramp (magnitude encoding) — light -> dark, see globals.css. */
export const SEQUENTIAL_BLUE_STEPS: readonly [string, string, string, string] = [
  "var(--viz-sequential-100)",
  "var(--viz-sequential-250)",
  "var(--viz-sequential-450)",
  "var(--viz-sequential-650)",
];

/** Picks a step of the sequential ramp proportional to `value` within [0, max]. */
export function sequentialStep(value: number, max: number): string {
  if (max <= 0) return SEQUENTIAL_BLUE_STEPS[2];
  const ratio = value / max;
  const idx = Math.min(SEQUENTIAL_BLUE_STEPS.length - 1, Math.floor(ratio * SEQUENTIAL_BLUE_STEPS.length));
  return SEQUENTIAL_BLUE_STEPS[Math.max(idx, 1) as 0 | 1 | 2 | 3];
}
