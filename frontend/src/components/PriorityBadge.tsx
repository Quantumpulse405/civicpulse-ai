const BAND_STYLES: Record<string, string> = {
  Critical: "bg-rose-50 text-rose-900 border border-rose-300 font-bold",
  High: "bg-amber-50 text-amber-950 border border-amber-300 font-bold",
  Medium: "bg-yellow-50 text-yellow-950 border border-yellow-300 font-semibold",
  Low: "bg-slate-100 text-slate-800 border border-slate-300 font-medium",
};

export default function PriorityBadge({ band }: { band: string }) {
  const style = BAND_STYLES[band] || BAND_STYLES.Low;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs shadow-2xs ${style}`}>
      {band}
    </span>
  );
}