"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { StaffOption } from "@/types/domain";

export function StaffSelector({ options }: { options: StaffOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("staff") ?? "";

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("staff", value);
    else params.delete("staff");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="staff-select" className="text-xs text-muted-foreground">
        Nhân sự / CTV
      </label>
      <select
        id="staff-select"
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none ring-primary focus:ring-2"
      >
        <option value="">Tất cả (bảng xếp hạng)</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.fullName}
            {opt.title ? ` — ${opt.title}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
