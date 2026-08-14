"use client";

import "leaflet/dist/leaflet.css";
import { latLngBounds } from "leaflet";
import { AttributionControl, CircleMarker, MapContainer, Popup, TileLayer, ZoomControl } from "react-leaflet";
import { sequentialStep } from "@/lib/utils";
import type { ProvinceCount } from "@/types/domain";

// Fixed bounding box around Vietnam (not derived from data) so the map
// always frames the whole country consistently, regardless of which
// provinces currently have beneficiaries.
const VIETNAM_BOUNDS = latLngBounds([8.2, 101.8], [23.5, 110.0]);

function radiusFor(count: number, max: number) {
  if (max <= 0) return 6;
  return 6 + Math.sqrt(count / max) * 20;
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
          bounds={VIETNAM_BOUNDS}
          maxBounds={VIETNAM_BOUNDS.pad(0.3)}
          minZoom={5}
          maxZoom={9}
          scrollWheelZoom={false}
          zoomControl={false}
          attributionControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          {/* CARTO Positron — a light, low-clutter basemap that keeps the
              beneficiary bubbles as the visual focus instead of dense OSM
              road/label styling. */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={19}
          />
          <AttributionControl position="bottomright" prefix={false} />
          <ZoomControl position="topright" />
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
