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
            <Popup>
              <div className="text-sm space-y-1">
                <p className="font-semibold text-slate-900">{region.name}</p>
                <p className="text-slate-600">
                  {region.request_count} citizen request(s)
                </p>
                {region.dominant_sector && (
                  <p className="text-slate-600">
                    Dominant issue: {region.dominant_sector}
                  </p>
                )}
                <p className="text-slate-600">
                  Population: {region.population.toLocaleString()}
                </p>
                {region.top_priority_score !== null && (
                  <p className="text-slate-600">
                    Top priority score: {region.top_priority_score} ({band})
                  </p>
                )}
                <Link
                  href={`/region/${region.id}`}
                  className="text-blue-600 hover:underline text-xs inline-block mt-1"
                >
                  View region details →
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}