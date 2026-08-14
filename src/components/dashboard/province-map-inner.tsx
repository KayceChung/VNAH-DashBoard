"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { sequentialStep } from "@/lib/utils";
import type { ProvinceCount } from "@/types/domain";

const VIETNAM_CENTER: [number, number] = [16.0, 107.5];

function radiusFor(count: number, max: number) {
  if (max <= 0) return 6;
  return 6 + Math.sqrt(count / max) * 22;
}

export function ProvinceMapInner({ data }: { data: ProvinceCount[] }) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Chưa có dữ liệu vị trí.</p>;
  }

  const max = Math.max(...data.map((d) => d.count));

  return (
    <div>
      <div className="h-80 w-full overflow-hidden rounded-md border border-border">
        <MapContainer
          center={VIETNAM_CENTER}
          zoom={5.4}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {data.map((row) => (
            <CircleMarker
              key={row.code}
              center={[row.lat, row.lng]}
              radius={radiusFor(row.count, max)}
              pathOptions={{
                color: "var(--viz-sequential-650)",
                weight: 1,
                fillColor: sequentialStep(row.count, max),
                fillOpacity: 0.75,
              }}
            >
              <Popup>
                <span className="font-medium">{row.name}</span>
                <br />
                {row.count.toLocaleString("vi-VN")} NKT
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Table view — same data as the map, for accessibility and precise reading. */}
      <div className="mt-3 max-h-40 overflow-y-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-1.5 text-left font-medium">Tỉnh/thành</th>
              <th className="px-3 py-1.5 text-right font-medium">Số NKT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row) => (
              <tr key={row.code}>
                <td className="px-3 py-1.5">{row.name}</td>
                <td className="px-3 py-1.5 text-right tabular-nums">{row.count.toLocaleString("vi-VN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
