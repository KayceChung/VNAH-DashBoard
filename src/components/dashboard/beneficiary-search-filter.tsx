"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BeneficiarySearchFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function apply(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = q.trim();
    if (trimmed) params.set("q", trimmed);
    else params.delete("q");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function clear() {
    setQ("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form onSubmit={apply} className="flex flex-1 items-end gap-2">
      <div className="flex min-w-[220px] flex-1 flex-col gap-1">
        <label htmlFor="beneficiary-search" className="text-xs text-muted-foreground">
          Tìm theo tên hoặc mã NKT
        </label>
        <input
          id="beneficiary-search"
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nguyễn Văn A hoặc NKT-0001"
          className="w-full max-w-xs rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none ring-primary focus:ring-2"
        />
      </div>
      <Button type="submit" size="sm" variant="outline">
        <Search className="h-3.5 w-3.5" />
        Tìm
      </Button>
      {searchParams.get("q") && (
        <Button type="button" size="sm" variant="ghost" onClick={clear} className="text-muted-foreground">
          <X className="h-3.5 w-3.5" />
          Xóa
        </Button>
      )}
    </form>
  );
}
