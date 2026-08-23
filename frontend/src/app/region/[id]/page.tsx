"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    getRegionDetail(id).then((data) => {
      if (data === null) {
        setNotFound(true);
      } else {
        setRegion(data);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400">Loading region details…</p>
      </main>
    );
  }

  if (notFound || !region) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
        <p className="text-slate-600 text-lg font-medium">
          We couldn't find that region.
        </p>
        <p className="text-slate-400 text-sm mt-1">
          It may not exist, or the backend may be unavailable right now.
        </p>
        <Link href="/dashboard" className="mt-4 text-blue-600 hover:underline text-sm">
          ← Back to dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
          ← Back to dashboard
        </Link>

        <header className="mt-3 mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{region.name}</h1>
          <p className="text-slate-500">
            {region.state}, {region.country}
          </p>
        </header>

        {/* Overview stats */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard label="Population" value={region.population.toLocaleString()} />
          <StatCard label="Citizen Requests" value={region.request_count.toString()} />
          <StatCard label="Dominant Issue" value={region.dominant_sector || "—"} />
        </section>

        {/* Recommendations */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Recommended Projects
          </h2>

          {region.recommendations.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
              No recommendations generated for this region yet.
            </div>
          ) : (
            <div className="space-y-4">
              {region.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white rounded-xl border border-slate-200 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {rec.project_name}
                      </h3>
                      <p className="text-sm text-slate-500">{rec.sector}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-slate-900">
                        {rec.priority_score}
                      </span>
                      <PriorityBadge band={rec.priority_band} />
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 mt-3">{rec.reasoning}</p>

                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <p className="text-slate-500">Estimated Beneficiaries</p>
                      <p className="font-medium text-slate-900">
                        {rec.estimated_beneficiaries.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Expected Impact</p>
                      <p className="font-medium text-slate-900">{rec.expected_impact}</p>
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}