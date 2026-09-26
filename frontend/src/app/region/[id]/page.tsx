"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getRegionDetail, RegionDetail } from "@/lib/api";
import PriorityBadge from "@/components/PriorityBadge";

export default function RegionDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [region, setRegion] = useState<RegionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);

  const loadRegion = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    const wakeTimer = setTimeout(() => setIsWakingUp(true), 2000);

    try {
      const data = await getRegionDetail(id, 2);
      if (data === null) {
        setNotFound(true);
      } else {
        setRegion(data);
      }
    } finally {
      clearTimeout(wakeTimer);
      setIsWakingUp(false);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRegion();
  }, [loadRegion]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-8 text-center max-w-md w-full">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-base font-bold text-slate-950">Loading District Analysis…</p>
          {isWakingUp && (
            <p className="text-xs text-blue-800 bg-blue-50 border border-blue-200 rounded-lg p-2.5 mt-3 animate-pulse font-medium">
              Render cloud backend is waking from sleep. Data will load shortly...
            </p>
          )}
        </div>
      </main>
    );
  }

  if (notFound || !region) {
    return (
      <main className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 max-w-md w-full">
          <span className="text-3xl mb-2 block">🔍</span>
          <h2 className="text-xl font-bold text-slate-950">
            District Record Unavailable
          </h2>
          <p className="text-slate-600 text-sm mt-2 leading-relaxed">
            The requested district could not be reached. The cloud backend may be momentarily initializing.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={loadRegion}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 px-4 rounded-xl transition shadow-2xs"
            >
              🔄 Retry Connection
            </button>
            <Link
              href="/dashboard"
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm py-2.5 px-4 rounded-xl transition"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 md:px-8 text-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 border border-slate-300 px-3 py-1.5 rounded-lg transition shadow-2xs"
          >
            <span>←</span> Back to Command Dashboard
          </Link>
        </div>

        {/* District Header Banner */}
        <header className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 text-xs font-bold border border-blue-200 mb-1">
                <span>📍 District Assessment</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                {region.name}
              </h1>
              <p className="text-slate-600 text-sm font-semibold mt-0.5">
                {region.state}, {region.country} · Coordinates: [{region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}]
              </p>
            </div>
            <Link
              href="/citizen"
              className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow-2xs shrink-0"
            >
              <span>+ Log Feedback for {region.name}</span>
            </Link>
          </div>

          {/* Overview stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <StatCard label="Total Population" value={region.population.toLocaleString()} icon="👥" />
            <StatCard label="Citizen Demands Logged" value={`${region.request_count} reports`} icon="🗣️" />
            <StatCard label="Dominant Issue Sector" value={region.dominant_sector || "Pending"} icon="⚠️" highlight={true} />
          </div>
        </header>

        {/* Recommendations */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Targeted Project Recommendations
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Audited priority scoring and impact analysis for {region.name}
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-white border border-slate-300 px-3 py-1 rounded-full shadow-2xs">
              {region.recommendations.length} Action Plans
            </span>
          </div>

          {region.recommendations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-600 text-sm font-medium">
              No recommendations generated for this region yet. Submit citizen feedback to generate automated priorities.
            </div>
          ) : (
            <div className="space-y-6">
              {region.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 hover:border-blue-300 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-200 pb-3">
                    <div>
                      <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                        {rec.sector} Sector
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-950 mt-0.5">
                        {rec.project_name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Priority Score</p>
                        <span className="text-xl font-black text-slate-950">
                          {rec.priority_score}
                        </span>
                        <span className="text-xs text-slate-500"> / 100</span>
                      </div>
                      <PriorityBadge band={rec.priority_band} />
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                      AI Analytical Rationale
                    </p>
                    <p className="text-sm text-slate-800 leading-relaxed font-normal">
                      {rec.reasoning}
                    </p>
                  </div>

                  {/* Priority score breakdown */}
                  <div className="mt-5 space-y-2.5 bg-white rounded-xl p-4 border border-slate-200">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                        Transparent 5-Factor Score Breakdown
                      </p>
                      <span className="text-[11px] font-semibold text-slate-500">Weighted Total</span>
                    </div>
                    <ScoreBar label="Citizen Demand" score={rec.citizen_demand_score} weight="30%" />
                    <ScoreBar label="Infrastructure Gap" score={rec.infrastructure_gap_score} weight="25%" />
                    <ScoreBar label="Population Impact" score={rec.population_impact_score} weight="20%" />
                    <ScoreBar label="Report Urgency" score={rec.urgency_score} weight="15%" />
                    <ScoreBar label="Policy Alignment" score={rec.policy_alignment_score} weight="10%" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-100 text-sm">
                    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                      <p className="text-xs text-slate-500 font-bold uppercase">Estimated Direct Beneficiaries</p>
                      <p className="text-lg font-black text-slate-950 mt-0.5">
                        {rec.estimated_beneficiaries.toLocaleString()}{" "}
                        <span className="text-xs text-slate-600 font-semibold">citizens</span>
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                      <p className="text-xs text-slate-500 font-bold uppercase">Targeted Civic Outcome</p>
                      <p className="text-sm font-bold text-slate-950 mt-0.5">
                        {rec.expected_impact}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value, icon, highlight }: { label: string; value: string; icon: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${
      highlight ? "bg-blue-50/70 border-blue-200" : "bg-slate-50 border-slate-200"
    }`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span>{icon}</span>
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function ScoreBar({ label, score, weight }: { label: string; score: number; weight: string }) {
  const pct = Math.min(100, Math.max(0, Math.round(score)));
  const color =
    pct >= 75 ? "bg-red-600" :
    pct >= 50 ? "bg-orange-500" :
    pct >= 25 ? "bg-amber-500" : "bg-blue-500";

  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-44 text-slate-900 font-bold shrink-0">
        {label} <span className="text-slate-500 font-normal">({weight})</span>
      </span>
      <div className="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right font-black text-slate-950">{pct}</span>
    </div>
  );
}