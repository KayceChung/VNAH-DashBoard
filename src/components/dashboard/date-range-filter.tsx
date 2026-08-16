"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");

  function apply(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (from) params.set("from", from);
    else params.delete("from");
    if (to) params.set("to", to);
    else params.delete("to");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function clear() {
    setFrom("");
    setTo("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("from");
    params.delete("to");
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const hasFilter = Boolean(searchParams.get("from") || searchParams.get("to"));

  return (
    <form onSubmit={apply} className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1">
        <label htmlFor="from-date" className="text-xs text-muted-foreground">
          Từ ngày
        </label>
        <input
          id="from-date"
          type="date"
          value={from}
          max={to || undefined}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none ring-primary focus:ring-2"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="to-date" className="text-xs text-muted-foreground">
          Đến ngày
        </label>
        <input
          id="to-date"
          type="date"
          value={to}
          min={from || undefined}
          onChange={(e) => setTo(e.target.value)}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none ring-primary focus:ring-2"
        />
      </div>
      <Button type="submit" size="sm" variant="outline">
        Áp dụng
      </Button>
      {hasFilter && (
        <Button type="button" size="sm" variant="ghost" onClick={clear} className="text-muted-foreground">
          <X className="h-3.5 w-3.5" />
          Xóa lọc
        </Button>
      )}
    </form>
  );
}
