"use client";

import { useState, useRef, useEffect } from "react";
import { submitFeedback, getAiStatus, FeedbackResponse } from "@/lib/api";
import { DISTRICTS, SECTORS, LANGUAGES, SAMPLE_TEXT } from "@/lib/constants";

type Language = "en" | "ta" | "hi";

export default function CitizenPortal() {
  const [language, setLanguage] = useState<Language>("en");
  const [text, setText] = useState("");
  const [district, setDistrict] = useState(DISTRICTS[0]);
  const [sector, setSector] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FeedbackResponse | null>(null);
  const [aiLabel, setAiLabel] = useState<string>("Demo AI Mode");
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

    setIsRecording(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
  }

  function loadSampleText() {
    setText(SAMPLE_TEXT[language]);
  }

  async function handleSubmit() {
    setError(null);
    setResult(null);

    if (!text.trim()) {
      setError("Please describe the issue before submitting.");
      return;
    }
    if (text.trim().length < 3) {
      setError("Please provide a bit more detail.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitFeedback({
        text: text.trim(),
        language,
        submitted_via: isRecording ? "voice" : "text",
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
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">CivicPulse AI</h1>
          <p className="mt-2 text-slate-600">
            Tell us what your community needs. AI helps identify development
            priorities.
          </p>
          <span className="inline-block mt-3 text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-800">
            {aiLabel}
          </span>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
          {/* Language selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Language
            </label>
            <div className="flex gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                    language === lang.code
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-700 border-slate-300 hover:border-blue-400"
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
              <label htmlFor="feedback-text" className="block text-sm font-medium text-slate-700">
                Describe the issue
              </label>
              <button
                type="button"
                onClick={loadSampleText}
                className="text-xs text-blue-600 hover:underline"
              >
                Load sample
              </button>
            </div>
            <textarea
              id="feedback-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={2000}
              rows={5}
              placeholder="e.g. Our village has no nearby hospital..."
              className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-400">{text.length}/2000</span>

              {speechSupported ? (
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={isRecording}
                  className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border ${
                    isRecording
                      ? "bg-red-50 border-red-300 text-red-700"
                      : "bg-white border-slate-300 text-slate-700 hover:border-blue-400"
                  }`}
                >
                  🎤 {isRecording ? "Listening..." : "Speak"}
                </button>
              ) : (
                <span className="text-xs text-slate-400">
                  Voice input isn't supported in this browser — text works fine.
                </span>
              )}
            </div>
          </div>

          {/* District + Sector */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sector <span className="text-slate-400">(optional)</span>
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Let AI decide</option>
                {SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 rounded-lg transition"
          >
            {submitting ? "Analysing..." : "Submit Feedback"}
          </button>
        </div>

        {result && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              AI Analysis
            </h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <AnalysisField label="Detected Language" value={result.input_language.toUpperCase()} />
              <AnalysisField label="Sector" value={result.sector} />
              <AnalysisField label="Problem Category" value={result.problem_category} />
              <AnalysisField label="Location" value={`${result.district_name}, ${result.state_name}`} />
              <AnalysisField label="Urgency" value={`${result.urgency_score}/100`} />
              <AnalysisField label="Sentiment" value={result.sentiment} />
              <AnalysisField label="Keywords" value={result.keywords.replaceAll(",", ", ")} />
              <AnalysisField label="AI Mode" value={result.ai_mode_used} />
            </dl>

            {result.similar_count > 0 && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
                <strong>{result.similar_count} other citizen(s)</strong> in{" "}
                {result.district_name} have reported similar{" "}
                {result.sector.toLowerCase()} issues. Your voice strengthens this priority.
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-700">
              Your feedback has been recorded and will contribute to the development
              priority score for{" "}
              <strong className="text-slate-900">{result.district_name}</strong>.
            </div>

            <div className="mt-3">
              <a
                href="/dashboard"
                className="text-sm text-blue-700 hover:underline font-semibold"
              >
                View how this impacts development priorities on the dashboard →
              </a>
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
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900 mt-0.5">{value}</dd>
    </div>
  );
}