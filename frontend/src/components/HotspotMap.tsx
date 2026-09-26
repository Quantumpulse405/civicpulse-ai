"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import Link from "next/link";
import { RegionMapEntry } from "@/lib/api";

const BAND_COLORS: Record<string, string> = {
  Critical: "#dc2626",
  High: "#ea580c",
  Medium: "#ca8a04",
  Low: "#64748b",
};

// Tamil Nadu's approximate center, used as the map's initial view.
const TAMIL_NADU_CENTER: [number, number] = [11.1271, 78.6569];

export default function HotspotMap({ regions }: { regions: RegionMapEntry[] }) {
  return (
    <MapContainer
      center={TAMIL_NADU_CENTER}
      zoom={7}
      scrollWheelZoom={false}
      style={{ height: "420px", width: "100%", borderRadius: "0.75rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {regions.map((region) => {
        const band = region.top_priority_band || "Low";
        const color = BAND_COLORS[band] || BAND_COLORS.Low;
        // Marker radius scales gently with request volume so busier
        // districts are visually larger, capped for readability.
        const radius = 8 + Math.min(region.request_count, 10) * 1.5;

        return (
          <CircleMarker
            key={region.id}
            center={[region.latitude, region.longitude]}
            radius={radius}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.55,
              weight: 2,
            }}
          >
            <Popup className="custom-popup">
              <div className="text-sm p-1 space-y-1.5 min-w-[190px]">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-950 text-base">{region.name}</span>
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${color}20`,
                      color: color,
                      border: `1px solid ${color}40`,
                    }}
                  >
                    {band}
                  </span>
                </div>
                <div className="text-xs text-slate-700 space-y-0.5 pt-0.5">
                  <p>
                    <strong className="text-slate-900">Requests:</strong> {region.request_count} citizen voice(s)
                  </p>
                  {region.dominant_sector && (
                    <p>
                      <strong className="text-slate-900">Top Issue:</strong> {region.dominant_sector}
                    </p>
                  )}
                  <p>
                    <strong className="text-slate-900">Population:</strong> {region.population.toLocaleString()}
                  </p>
                  {region.top_priority_score !== null && (
                    <p>
                      <strong className="text-slate-900">Priority Score:</strong>{" "}
                      <span className="font-bold text-slate-950">{region.top_priority_score}</span> / 100
                    </p>
                  )}
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <Link
                    href={`/region/${region.id}`}
                    className="inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-1.5 px-3 rounded-md transition shadow-2xs"
                  >
                    View District Breakdown →
                  </Link>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}