"use client";

import dynamic from "next/dynamic";
import type { ProvinceCount } from "@/types/domain";

// Leaflet touches `window` at import time, so it can only run in the
// browser — load it as a client-only dynamic import (no SSR pass).
const ProvinceMapInner = dynamic(() => import("./province-map-inner").then((m) => m.ProvinceMapInner), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">Đang tải bản đồ...</div>
  ),
});

export function ProvinceMap({ data }: { data: ProvinceCount[] }) {
  return <ProvinceMapInner data={data} />;
}
