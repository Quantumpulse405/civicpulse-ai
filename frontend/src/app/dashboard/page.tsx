"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  getDashboardSummary,
  getDashboardPriorities,
  getDashboardRegions,
  getDashboardSectors,
  getDashboardTrend,
  getRecommendations,
  DashboardSummary,
  PriorityTableEntry,
  RegionMapEntry,
  SectorDistributionEntry,
  TrendEntry,
  RecommendationEntry,
} from "@/lib/api";
import PriorityBadge from "@/components/PriorityBadge";

const HotspotMap = dynamic(() => import("@/components/HotspotMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] flex items-center justify-center text-slate-400 bg-slate-100 rounded-xl">
      Loading map…
    </div>
  ),
});

const BAND_COLORS: Record<string, string> = {
  Critical: "#dc2626",
  High: "#ea580c",
  Medium: "#ca8a04",
  Low: "#64748b",
};

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [priorities, setPriorities] = useState<PriorityTableEntry[]>([]);
  const [regions, setRegions] = useState<RegionMapEntry[]>([]);
  const [sectors, setSectors] = useState<SectorDistributionEntry[]>([]);
  const [trend, setTrend] = useState<TrendEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<RecommendationEntry[]>([]);

  useEffect(() => {
    Promise.all([
      getDashboardSummary(),
      getDashboardPriorities(20),
      getDashboardRegions(),
      getDashboardSectors(),
      getDashboardTrend(30),
      getRecommendations(5),
    ]).then(([summaryData, priorityData, regionData, sectorData, trendData, recData]) => {
      setSummary(summaryData);
      setPriorities(priorityData);
      setRegions(regionData);
      setSectors(sectorData);
      setTrend(trendData);
      setRecommendations(recData);
      setLoading(false);
    });
  }, []);

  // Derive priority band counts from the priorities list for the pie chart
  const bandCounts: Record<string, number> = {};
  for (const p of priorities) {
    bandCounts[p.priority_band] = (bandCounts[p.priority_band] || 0) + 1;
  }
  const bandData = Object.entries(bandCounts).map(([band, count]) => ({
    band,
    count,
  }));

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">CivicPulse AI</h1>
          <p className="text-slate-600 mt-1">National Development Intelligence</p>
        </header>

        {/* KPI cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KpiCard label="Total Citizen Requests" value={summary?.total_requests} loading={loading} />
          <KpiCard label="High Priority Regions" value={summary?.high_priority_regions} loading={loading} />
          <KpiCard label="Infrastructure Gaps" value={summary?.infrastructure_gaps} loading={loading} />
          <KpiCard label="Recommended Projects" value={summary?.recommended_projects} loading={loading} />
        </section>

        {/* Map */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
          <div className="px-2 pb-3">
            <h2 className="text-lg font-semibold text-slate-900">Development Hotspots</h2>
            <p className="text-sm text-slate-500">
              Marker size reflects request volume; color reflects top priority band.
            </p>
          </div>
          {loading ? (
            <div className="h-[420px] flex items-center justify-center text-slate-400 bg-slate-100 rounded-xl">
              Loading map…
            </div>
          ) : (
            <HotspotMap regions={regions} />
          )}
        </section>

        {/* Charts row */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Sector distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-4">
              Requests by Sector
            </h2>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-slate-400">Loading…</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={sectors} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="sector"
                    width={140}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar dataKey="request_count" fill="#2563eb" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Priority distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-4">
              Priority Distribution
            </h2>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-slate-400">Loading…</div>
            ) : bandData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-400">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={bandData}
                    dataKey="count"
                    nameKey="band"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {bandData.map((entry) => (
                      <Cell
                        key={entry.band}
                        fill={BAND_COLORS[entry.band] || "#94a3b8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Request trend */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-8">
          <h2 className="text-base font-semibold text-slate-900 mb-1">
            Citizen Request Trend
          </h2>
          <p className="text-sm text-slate-500 mb-4">Last 30 days</p>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-400">Loading…</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  interval={Math.floor(trend.length / 8)}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="request_count"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </section>
        {/* Top Recommendations */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-slate-950 mb-4">
            Top Recommended Projects
          </h2>
          {loading ? (
            <div className="text-slate-500 text-sm">Loading recommendations…</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-slate-950 text-sm leading-snug">
                      {rec.project_name}
                    </h3>
                    <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                      rec.priority_band === "Critical" ? "bg-red-100 text-red-800" :
                      rec.priority_band === "High" ? "bg-orange-100 text-orange-800" :
                      rec.priority_band === "Medium" ? "bg-yellow-100 text-yellow-800" :
                      "bg-slate-100 text-slate-700"
                    }`}>
                      {rec.priority_score}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-blue-700 mb-2">
                    {rec.region_name} · {rec.sector}
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                    {rec.reasoning}
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
                    <span className="text-slate-600">
                      <span className="font-bold text-slate-900">
                        {rec.estimated_beneficiaries.toLocaleString()}
                      </span> beneficiaries
                    </span>
                    <a href={`/region/${rec.region_id}`} className="text-blue-700 font-semibold hover:underline">
                      Details →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        {/* Priority table */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Priority Regions</h2>
            <p className="text-sm text-slate-500">
              Ranked by transparent priority score — see docs for the scoring formula.
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading priorities…</div>
          ) : priorities.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No priority data available yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Rank</th>
                    <th className="px-4 py-3 font-medium">Region</th>
                    <th className="px-4 py-3 font-medium">Sector</th>
                    <th className="px-4 py-3 font-medium">Demand</th>
                    <th className="px-4 py-3 font-medium">Infra Gap</th>
                    <th className="px-4 py-3 font-medium">Pop. Impact</th>
                    <th className="px-4 py-3 font-medium">Priority Score</th>
                    <th className="px-4 py-3 font-medium">Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {priorities.map((p) => (
                    <tr key={`${p.region_id}-${p.sector}`} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-500">{p.rank}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <Link href={`/region/${p.region_id}`} className="hover:underline">
                          {p.region_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{p.sector}</td>
                      <td className="px-4 py-3 text-slate-700">{p.citizen_demand_score}</td>
                      <td className="px-4 py-3 text-slate-700">{p.infrastructure_gap_score}</td>
                      <td className="px-4 py-3 text-slate-700">{p.population_impact_score}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{p.priority_score}</span>
                          <PriorityBadge band={p.priority_band} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{p.project_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function KpiCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: number | undefined;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-bold text-slate-900 mt-1">
        {loading ? "…" : value ?? 0}
      </p>
    </div>
  );
}