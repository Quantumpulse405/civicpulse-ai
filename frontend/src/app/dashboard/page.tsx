"use client";

import { useEffect, useState, useCallback } from "react";
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
    <div className="h-[420px] flex flex-col items-center justify-center text-slate-500 bg-slate-100 rounded-xl">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
      <p className="text-sm font-semibold text-slate-700">Loading Hotspot Map…</p>
    </div>
  ),
});

const BAND_COLORS: Record<string, string> = {
  Critical: "#dc2626",
  High: "#ea580c",
  Medium: "#d97706",
  Low: "#475569",
};

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [priorities, setPriorities] = useState<PriorityTableEntry[]>([]);
  const [regions, setRegions] = useState<RegionMapEntry[]>([]);
  const [sectors, setSectors] = useState<SectorDistributionEntry[]>([]);
  const [trend, setTrend] = useState<TrendEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationEntry[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);
    const wakeTimer = setTimeout(() => {
      setIsWakingUp(true);
    }, 2000);

    try {
      const [summaryData, priorityData, regionData, sectorData, trendData, recData] =
        await Promise.all([
          getDashboardSummary(),
          getDashboardPriorities(50),
          getDashboardRegions(),
          getDashboardSectors(),
          getDashboardTrend(30),
          getRecommendations(6),
        ]);

      setSummary(summaryData);
      setPriorities(priorityData);
      setRegions(regionData);
      setSectors(sectorData);
      setTrend(trendData);
      setRecommendations(recData);
      setLastUpdated(new Date());
    } finally {
      clearTimeout(wakeTimer);
      setIsWakingUp(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derive priority band counts from priorities for the distribution chart
  const bandCounts: Record<string, number> = {};
  for (const p of priorities) {
    bandCounts[p.priority_band] = (bandCounts[p.priority_band] || 0) + 1;
  }
  const bandData = Object.entries(bandCounts).map(([band, count]) => ({
    band,
    count,
  }));

  const isDataEmpty = !loading && summary?.total_requests === 0 && priorities.length === 0;

  return (
    <main className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 md:px-8 text-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header with Title & Refresh CTA */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-300 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue-100 border border-blue-300 text-blue-900 text-xs font-bold mb-1 shadow-2xs">
              <span>🇮🇳</span> National Priority Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Policymaker Command Dashboard
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm font-medium mt-0.5">
              Live aggregation of citizen demands, infrastructure deficit metrics, and priority rankings.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-slate-500 hidden md:inline">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition shadow-2xs hover:border-slate-400 disabled:opacity-50"
            >
              <span className={loading ? "animate-spin" : ""}>🔄</span>
              <span>{loading ? "Refreshing..." : "Refresh Data"}</span>
            </button>
            <Link
              href="/citizen"
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition shadow-2xs"
            >
              <span>+ Add Feedback</span>
            </Link>
          </div>
        </header>

        {/* Cold Start Notice (Render free tier wake-up) */}
        {isWakingUp && (
          <div className="mb-6 bg-blue-50 border-2 border-blue-400 rounded-xl p-4 text-blue-950 flex items-center gap-3 shadow-md animate-pulse">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="font-bold text-sm">Connecting to CivicPulse cloud backend...</p>
              <p className="text-xs text-blue-900 mt-0.5">
                Render free-tier service is spinning up. Data will populate automatically in a few seconds.
              </p>
            </div>
          </div>
        )}

        {/* Empty State Banner if Cloud Backend is still waking */}
        {isDataEmpty && (
          <div className="mb-6 bg-amber-50 border border-amber-300 rounded-xl p-5 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <p className="font-bold text-sm text-amber-950">No priority data detected yet</p>
                <p className="text-xs text-amber-900 mt-0.5">
                  If the server just started or woke from sleep, data may still be initializing.
                </p>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-2xs shrink-0"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard
            label="Total Citizen Demands"
            value={summary?.total_requests}
            loading={loading}
            icon="👥"
            badge="Aggregated"
          />
          <KpiCard
            label="High Priority Districts"
            value={summary?.high_priority_regions}
            loading={loading}
            icon="🚨"
            badge="Score ≥ 60"
            highlight={true}
          />
          <KpiCard
            label="Infrastructure Gaps"
            value={summary?.infrastructure_gaps}
            loading={loading}
            icon="⚠️"
            badge="Deficit ≥ 50%"
          />
          <KpiCard
            label="Proposed Projects"
            value={summary?.recommended_projects}
            loading={loading}
            icon="🏗️"
            badge="AI Evaluated"
          />
        </section>

        {/* Hotspot Map Card */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 mb-4 gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                District Development Hotspots
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Circle radius denotes citizen volume; marker color reflects top priority severity.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-600"></span> Critical</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500"></span> High</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Medium</span>
            </div>
          </div>
          {loading ? (
            <div className="h-[420px] flex items-center justify-center text-slate-500 bg-slate-50 rounded-xl">
              <div className="text-center space-y-2">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-semibold text-slate-600">Rendering Geographic Hotspots...</p>
              </div>
            </div>
          ) : (
            <HotspotMap regions={regions} />
          )}
        </section>

        {/* Charts Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sector distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 sm:p-6">
            <div className="border-b border-slate-200 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-950">
                Citizen Demands by Sector
              </h2>
              <p className="text-xs text-slate-600 font-medium">Categorized volume across all 10 pilot districts</p>
            </div>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-slate-400 text-xs">Loading chart…</div>
            ) : sectors.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-400 text-xs">No sector data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={sectors} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" allowDecimals={false} tick={{ fill: "#475569", fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="sector"
                    width={130}
                    tick={{ fill: "#0f172a", fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#fff",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="request_count" name="Demands" fill="#2563eb" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Priority distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 sm:p-6">
            <div className="border-b border-slate-200 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-950">
                Priority Tier Distribution
              </h2>
              <p className="text-xs text-slate-600 font-medium">Severity classification of all evaluated project areas</p>
            </div>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-slate-400 text-xs">Loading chart…</div>
            ) : bandData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
                No priority tiers computed yet
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
                    paddingAngle={3}
                  >
                    {bandData.map((entry) => (
                      <Cell
                        key={entry.band}
                        fill={BAND_COLORS[entry.band] || "#64748b"}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#fff",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                      border: "none",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Request Trend */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 sm:p-6 mb-8">
          <div className="border-b border-slate-200 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h2 className="text-base font-bold text-slate-950">
                Citizen Feedback Trend
              </h2>
              <p className="text-xs text-slate-600 font-medium">Daily submission trajectory over the past 30 days</p>
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              30-Day Window
            </span>
          </div>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs">Loading trend…</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#475569", fontSize: 11 }}
                  interval={Math.floor(trend.length / 8)}
                />
                <YAxis allowDecimals={false} tick={{ fill: "#475569", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    color: "#fff",
                    borderRadius: "0.5rem",
                    fontSize: "12px",
                    border: "none",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="request_count"
                  name="Daily Requests"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#2563eb" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* Top Recommended Projects Grid */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Top Recommended Capital Projects
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Highest ranked interventions generated from multi-factor analysis
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-200 px-2.5 py-1 rounded-full">
              {recommendations.length} Projects Surfaced
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse h-48"></div>
              ))}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-600 text-sm">
              No recommendations available. Please refresh or seed data.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-slate-950 text-sm leading-snug">
                        {rec.project_name}
                      </h3>
                      <PriorityBadge band={rec.priority_band} />
                    </div>
                    <p className="text-xs font-bold text-blue-700 mb-2.5 flex items-center gap-1.5">
                      <span>📍 {rec.region_name}</span>
                      <span>·</span>
                      <span className="text-slate-600 font-medium">{rec.sector}</span>
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                      {rec.reasoning}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Impact</p>
                      <span className="font-black text-slate-950">
                        {rec.estimated_beneficiaries.toLocaleString()}
                      </span>{" "}
                      <span className="text-slate-600">citizens</span>
                    </div>
                    <Link
                      href={`/region/${rec.region_id}`}
                      className="bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold px-3 py-1.5 rounded-lg border border-blue-200 hover:border-blue-600 transition text-xs shadow-2xs"
                    >
                      Audit Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Priority Table */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Transparent Priority Rankings
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Auditable formula breakdown: Demand (30%) + Gap (25%) + Pop (20%) + Urgency (15%) + Alignment (10%)
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Ranked descending by score
            </span>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500 text-sm">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading priority tables…
            </div>
          ) : priorities.length === 0 ? (
            <div className="p-10 text-center text-slate-600 text-sm">
              No priority data available.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900 text-slate-200 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Rank</th>
                    <th className="px-4 py-3.5">District</th>
                    <th className="px-4 py-3.5">Sector</th>
                    <th className="px-4 py-3.5">Demand (30%)</th>
                    <th className="px-4 py-3.5">Infra Gap (25%)</th>
                    <th className="px-4 py-3.5">Pop. Impact (20%)</th>
                    <th className="px-4 py-3.5">Score</th>
                    <th className="px-4 py-3.5">Target Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                  {priorities.map((p) => (
                    <tr key={`${p.region_id}-${p.sector}`} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3.5 font-bold text-slate-600">#{p.rank}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-950">
                        <Link href={`/region/${p.region_id}`} className="text-blue-700 hover:text-blue-900 hover:underline">
                          {p.region_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800">{p.sector}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-800">{p.citizen_demand_score}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-800">{p.infrastructure_gap_score}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-800">{p.population_impact_score}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-950 text-sm">{p.priority_score}</span>
                          <PriorityBadge band={p.priority_band} />
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900 max-w-xs truncate">
                        {p.project_name}
                      </td>
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
  icon,
  badge,
  highlight,
}: {
  label: string;
  value: number | undefined;
  loading: boolean;
  icon: string;
  badge?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-xs border ${
      highlight ? "border-red-300 ring-1 ring-red-200" : "border-slate-200/90"
    } p-5 flex flex-col justify-between hover:shadow-md transition`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{icon}</span>
        {badge && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">{label}</p>
        <p className="text-3xl sm:text-4xl font-black text-slate-950 mt-1">
          {loading ? "…" : (value ?? 0).toLocaleString()}
        </p>
      </div>
    </div>
  );
}