"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { submitFeedback, getAiStatus, FeedbackResponse } from "@/lib/api";
import { DISTRICTS, SECTORS, LANGUAGES, SAMPLE_TEXT } from "@/lib/constants";

type Language = "en" | "ta" | "hi";

export default function CitizenPortal() {
  const [language, setLanguage] = useState<Language>("en");
  const [text, setText] = useState("");
  const [district, setDistrict] = useState(DISTRICTS[0]);
  const [sector, setSector] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [hasUsedVoice, setHasUsedVoice] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FeedbackResponse | null>(null);
  const [aiLabel, setAiLabel] = useState<string>("Connecting to AI...");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    getAiStatus().then((status) => setAiLabel(status.label));

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.lang = language === "ta" ? "ta-IN" : language === "hi" ? "hi-IN" : "en-IN";
  }, [language]);

  function handleVoiceInput() {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    setError(null);
    setIsRecording(true);
    try {
      recognition.start();
    } catch {
      setIsRecording(false);
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setHasUsedVoice(true);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
  }

  function loadSampleText() {
    setText(SAMPLE_TEXT[language]);
    setHasUsedVoice(false);
    setError(null);
  }

  async function handleSubmit() {
    setError(null);
    setResult(null);

    if (!text.trim()) {
      setError("Please describe the issue before submitting.");
      return;
    }
    if (text.trim().length < 3) {
      setError("Please provide a bit more detail (at least 3 characters).");
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitFeedback({
        text: text.trim(),
        language,
        submitted_via: hasUsedVoice ? "voice" : "text",
        district_name: district,
        state_name: "Tamil Nadu",
        sector: sector || undefined,
      });
      setResult(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reach the server. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-300 text-blue-900 text-xs font-bold mb-3 shadow-2xs">
            <span>🏛️</span> Citizen Grievance & Intelligence Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Share Community Needs
          </h1>
          <p className="mt-2 text-slate-700 text-sm sm:text-base font-medium">
            Report infrastructure gaps in your district. AI analyzes urgency and integrates your voice into national policy priorities.
          </p>
          <div className="mt-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 text-slate-100 border border-slate-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-teal-400"></span>
              {aiLabel}
            </span>
          </div>
        </header>

        <div className="bg-white rounded-2xl shadow-md border border-slate-200/90 p-6 sm:p-8 space-y-6">
          {/* Language selector */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Select Language / மொழி / भाषा
            </label>
            <div className="flex gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                    language === lang.code
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-slate-50 text-slate-800 border-slate-300 hover:border-blue-400 hover:bg-slate-100"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="feedback-text" className="block text-sm font-bold text-slate-900">
                Describe the issue or development need
              </label>
              <button
                type="button"
                onClick={loadSampleText}
                className="text-xs text-blue-700 hover:text-blue-900 font-bold hover:underline bg-blue-50 px-2 py-0.5 rounded border border-blue-200 transition"
              >
                ✨ Load {LANGUAGES.find(l => l.code === language)?.label} sample
              </button>
            </div>
            <textarea
              id="feedback-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={2000}
              rows={5}
              placeholder="e.g. Our village has no primary health centre or clinic within 15 km..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3.5 text-sm text-slate-950 placeholder:text-slate-400 font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition leading-relaxed shadow-inner"
            />
            <div className="flex items-center justify-between mt-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">{text.length}/2000 chars</span>
                {hasUsedVoice && (
                  <span className="text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full">
                    🎙️ Voice Transcribed
                  </span>
                )}
              </div>

              {speechSupported ? (
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={isRecording}
                  className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-xl border transition-all ${
                    isRecording
                      ? "bg-red-600 border-red-700 text-white animate-pulse shadow-md"
                      : "bg-slate-100 border-slate-300 text-slate-900 hover:border-blue-500 hover:bg-white shadow-2xs"
                  }`}
                >
                  <span>{isRecording ? "🔴" : "🎤"}</span>
                  <span>{isRecording ? "Listening..." : "Speak Input"}</span>
                </button>
              ) : (
                <span className="text-xs text-slate-500">
                  Voice input available on Chrome / Edge browsers.
                </span>
              )}
            </div>
          </div>

          {/* District + Sector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="district-select" className="block text-sm font-bold text-slate-900 mb-2">
                District / மாவட்டம்
              </label>
              <select
                id="district-select"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition shadow-2xs"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sector-select" className="block text-sm font-bold text-slate-900 mb-2">
                Sector / துறை <span className="text-xs text-slate-500 font-normal">(optional)</span>
              </label>
              <select
                id="sector-select"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition shadow-2xs"
              >
                <option value="">🤖 Auto-Detect with AI</option>
                {SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="text-sm font-semibold text-red-950 bg-red-50 border border-red-300 rounded-xl p-4 flex items-start gap-2.5">
              <span className="text-base shrink-0">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-extrabold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed text-base flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Analysing with AI...</span>
              </>
            ) : (
              <span>Submit Citizen Feedback →</span>
            )}
          </button>
        </div>

        {/* AI Analysis Output Card */}
        {result && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-slate-300/90 p-6 sm:p-8 transition-all animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Verification & Extraction
                </span>
                <h2 className="text-xl font-bold text-slate-950">
                  AI Intelligence Report
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-900 border border-teal-300">
                Mode: {result.ai_mode_used}
              </span>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50/80 rounded-xl p-4 border border-slate-200">
              <AnalysisField label="Detected Language" value={result.input_language.toUpperCase()} />
              <AnalysisField label="Identified Sector" value={result.sector} />
              <AnalysisField label="Problem Category" value={result.problem_category} />
              <AnalysisField label="District Location" value={`${result.district_name}, ${result.state_name}`} />
              <AnalysisField label="Urgency Score" value={`${result.urgency_score} / 100`} />
              <AnalysisField label="Citizen Sentiment" value={result.sentiment.toUpperCase()} />
              <AnalysisField label="Key Signals" value={result.keywords ? result.keywords.split(",").join(", ") : "general"} />
              <AnalysisField label="Submission Mode" value={result.submitted_via.toUpperCase()} />
            </dl>

            {result.similar_count > 0 && (
              <div className="mt-5 bg-blue-50/90 border border-blue-300 rounded-xl p-4 text-sm text-blue-950 flex items-start gap-2.5">
                <span className="text-lg">📢</span>
                <div>
                  <strong>{result.similar_count} other citizen(s)</strong> in{" "}
                  <strong>{result.district_name}</strong> have voiced similar{" "}
                  <strong>{result.sector.toLowerCase()}</strong> concerns.
                  <p className="text-xs text-blue-900/90 mt-0.5">
                    Your submission amplifies community demand and raises the district&apos;s priority weight.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-600 font-medium text-center sm:text-left">
                Feedback successfully registered in priority engine.
              </p>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition shadow-2xs"
              >
                <span>View on Policymaker Dashboard</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function AnalysisField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-600 text-xs font-semibold uppercase tracking-wide">{label}</dt>
      <dd className="font-bold text-slate-950 text-sm sm:text-base mt-0.5">{value}</dd>
    </div>
  );
}