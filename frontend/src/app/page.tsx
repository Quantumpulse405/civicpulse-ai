import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center px-6 py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
          CivicPulse AI
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Turning citizen voices into smarter development priorities. A
          multilingual, AI-powered civic intelligence platform that helps
          policymakers identify infrastructure gaps and prioritize what
          matters most.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/citizen"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition"
          >
            Submit Feedback as a Citizen
          </Link>
          <Link
            href="/dashboard"
            className="bg-white border border-slate-300 hover:border-blue-400 text-slate-700 font-medium px-6 py-3 rounded-lg transition"
          >
            View Policymaker Dashboard
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Step
            number="1"
            title="Citizens share feedback"
            description="In English, Tamil, or Hindi — by text or voice."
          />
          <Step
            number="2"
            title="AI analyses it"
            description="Detects sector, urgency, sentiment, and keywords automatically."
          />
          <Step
            number="3"
            title="Priorities are scored"
            description="A transparent formula ranks development needs by region."
          />
          <Step
            number="4"
            title="Policymakers act"
            description="A live dashboard surfaces hotspots and recommended projects."
          />
        </div>
      </section>

      {/* Data disclosure */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-900">
          <strong>Prototype notice:</strong> This MVP uses synthetic/demo data
          for a 10-district Tamil Nadu pilot to demonstrate the platform
          concept. It is not official government data. The architecture is
          designed to scale to real datasets and additional BRICS nations in
          future phases.
        </div>
      </section>
    </main>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
      <div className="w-8 h-8 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
        {number}
      </div>
      <h3 className="font-semibold text-slate-900 mt-3">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
    </div>
  );
}