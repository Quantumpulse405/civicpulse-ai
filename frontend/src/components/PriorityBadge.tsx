const BAND_STYLES: Record<string, string> = {
  Critical: "bg-red-100 text-red-800",
  High: "bg-orange-100 text-orange-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-slate-100 text-slate-700",
};

export default function PriorityBadge({ band }: { band: string }) {
  const style = BAND_STYLES[band] || BAND_STYLES.Low;
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${style}`}>
      {band}
    </span>
  );
}