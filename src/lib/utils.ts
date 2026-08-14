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
