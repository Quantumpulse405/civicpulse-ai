"use client";

import { useEffect } from "react";
import Link from "next/link";
import { wakeUpBackend } from "@/lib/api";

export default function Home() {
  useEffect(() => {
    // Proactively ping backend to wake up sleeping Render instance in background
    wakeUpBackend();
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-slate-800 bg-radial-[at_top_center] from-slate-800/80 to-slate-950">
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-700/60 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            National Infrastructure Intelligence · India Pilot
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Turning Citizen Voices Into{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-sky-300 to-teal-300">
              Smarter Development Priorities
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            A multilingual, AI-powered civic intelligence platform that collects community infrastructure needs via voice and text, extracts civic signals using Google Gemini, and computes transparent, explainable priority scores for national policymakers.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/citizen"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-600/25 transition-all text-base hover:-translate-y-0.5"
            >
              <span>🗣️</span> Submit Citizen Feedback
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800/90 hover:bg-slate-700 text-white font-semibold px-7 py-3.5 rounded-xl border border-slate-600 hover:border-slate-500 transition-all text-base hover:-translate-y-0.5"
            >
              <span>📊</span> Open Policymaker Dashboard
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-8 border-t border-slate-800/80 text-left">
            <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
              <p className="text-xs text-slate-400 font-medium">Linguistic Coverage</p>
              <p className="text-base font-bold text-white mt-0.5">EN · தமிழ் · हिंदी</p>
            </div>
            <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
              <p className="text-xs text-slate-400 font-medium">Input Modalities</p>
              <p className="text-base font-bold text-white mt-0.5">Voice & Text</p>
            </div>
            <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
              <p className="text-xs text-slate-400 font-medium">Scoring Mechanism</p>
              <p className="text-base font-bold text-white mt-0.5">5-Factor Transparent</p>
            </div>
            <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
              <p className="text-xs text-slate-400 font-medium">Pilot Geography</p>
              <p className="text-base font-bold text-white mt-0.5">10 TN Districts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="bg-slate-950 py-16 px-4 sm:px-6 md:px-8">
        {/* How it works */}
        <section className="max-w-6xl mx-auto mb-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              End-to-End Civic Intelligence Pipeline
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              From raw vernacular voice feedback in rural villages to actionable capital investment priorities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <StepCard
              number="01"
              title="Citizen Voice Input"
              description="Citizens share grievances in English, Tamil, or Hindi using speech recognition or text."
              icon="🎙️"
            />
            <StepCard
              number="02"
              title="Multilingual AI Analysis"
              description="Google Gemini classifies sector, detects urgency, determines sentiment, and tags key terms."
              icon="🤖"
            />
            <StepCard
              number="03"
              title="Transparent Scoring"
              description="A deterministic 5-component formula calculates priority scores with zero black-box bias."
              icon="⚖️"
            />
            <StepCard
              number="04"
              title="Policy Recommendation"
              description="Policymakers receive targeted project proposals with beneficiary estimates and live maps."
              icon="📈"
            />
          </div>
        </section>

        {/* Priority Formula Featurette */}
        <section className="max-w-5xl mx-auto mb-16 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="md:w-1/2">
              <div className="inline-block text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">
                Explainable AI & Governance
              </div>
              <h3 className="text-2xl font-bold text-white leading-snug">
                Transparent Priority Formula
              </h3>
              <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                Unlike opaque neural rankings, CivicPulse AI uses a weighted mathematical formula where every variable is audited against ground infrastructure metrics and demographic datasets.
              </p>
              <div className="mt-5">
                <Link
                  href="/dashboard"
                  className="text-blue-400 hover:text-blue-300 font-semibold text-sm inline-flex items-center gap-1 group"
                >
                  Explore live rankings on dashboard <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>

            <div className="md:w-1/2 w-full bg-slate-950 rounded-xl p-5 border border-slate-800/90 font-mono text-xs text-slate-300 space-y-2.5">
              <div className="flex justify-between items-center text-slate-400 font-semibold pb-1 border-b border-slate-800">
                <span>COMPONENT</span>
                <span>WEIGHT</span>
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span>Citizen Demand Intensity</span>
                <span className="font-bold text-blue-400">30%</span>
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span>Infrastructure Gap Severity</span>
                <span className="font-bold text-blue-400">25%</span>
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span>Population Benefited Impact</span>
                <span className="font-bold text-blue-400">20%</span>
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span>Report Urgency & Safety Score</span>
                <span className="font-bold text-blue-400">15%</span>
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span>Policy Alignment / Investment Lag</span>
                <span className="font-bold text-blue-400">10%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Prototype Data Disclosure */}
        <section className="max-w-5xl mx-auto">
          <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-5 text-sm text-amber-200 flex items-start gap-3.5">
            <span className="text-xl shrink-0">⚠️</span>
            <div>
              <p className="font-bold text-amber-100 text-sm">
                Hackathon Prototype Disclosure
              </p>
              <p className="text-xs sm:text-sm text-amber-300/90 mt-1 leading-relaxed">
                This MVP platform operates on synthetic demonstration data for a 10-district Tamil Nadu pilot. The architecture is engineered to ingest official Open Government Data (data.gov.in) and scale across all Indian states and BRICS partner nations.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl">{icon}</span>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded">
            {number}
          </span>
        </div>
        <h3 className="font-bold text-white text-base">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}