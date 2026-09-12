import { useId } from "react";
import { fearGreedClassification, fearGreedToneColor } from "@/lib/hooks";

const ZONES = [
  { label: "0-24", color: "#EA3943", desc: "Extreme Fear" },
  { label: "25-44", color: "#F7931A", desc: "Fear" },
  { label: "45-54", color: "#8B98A8", desc: "Neutral" },
  { label: "55-75", color: "#16C784", desc: "Greed" },
  { label: "76-100", color: "#0FA568", desc: "Extreme Greed" },
];

export function FearGreedGauge({ value }: { value: number }) {
  const gradId = useId().replace(/:/g, "");
  const clamped = Math.max(0, Math.min(100, value));
  const angle = (clamped / 100 - 0.5) * 180;
  const tone = fearGreedClassification(clamped);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-[420px]">
        <svg viewBox="0 0 220 130" className="w-full">
          <defs>
            <radialGradient id={`needle-${gradId}`} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#F5F7FA" />
              <stop offset="100%" stopColor="#8B98A8" />
            </radialGradient>
          </defs>
          {ZONES.map((zone, i) => {
            const start = 180 - i * 36; // arco da esquerda para a direita
            const end = start - 36;
            const largeArc = 0;
            const x1 = 110 + 95 * Math.cos((start * Math.PI) / 180);
            const y1 = 115 - 95 * Math.sin((start * Math.PI) / 180);
            const x2 = 110 + 95 * Math.cos((end * Math.PI) / 180);
            const y2 = 115 - 95 * Math.sin((end * Math.PI) / 180);
            const color = zone.color;
            const brightness = i === 0 || i === 4 ? 1 : i === 2 ? 0.5 : 0.75;
            return (
              <path
                key={zone.label}
                d={`M ${x1} ${y1} A 95 95 0 ${largeArc} 0 ${x2} ${y2}`}
                fill="none"
                stroke={color}
                strokeOpacity={brightness}
                strokeWidth={18}
                strokeLinecap="butt"
              />
            );
          })}
          <circle cx="110" cy="115" r="12" fill={`url(#needle-${gradId})`} />
          <line
            x1="110"
            y1="115"
            x2="110"
            y2="30"
            stroke="#F5F7FA"
            strokeWidth={3}
            strokeLinecap="round"
            transform={`rotate(${angle} 110 115)`}
          />
          <circle cx="110" cy="115" r="5" fill="#080B10" />
        </svg>
        <div className="pointer-events-none absolute inset-x-0 bottom-6 text-center">
          <div className="font-mono-nums text-5xl font-bold text-foreground">{clamped}</div>
          <div className="mt-1 text-sm font-semibold" style={{ color: fearGreedToneColor(tone.tone) }}>
            {tone.label}
          </div>
        </div>
      </div>

      <div className="mt-4 grid w-full max-w-[420px] grid-cols-5 gap-1 text-center">
        {ZONES.map((zone) => (
          <div key={zone.label} className="rounded-md bg-card-secondary/60 px-1 py-1.5">
            <div className="h-1 w-full rounded-full" style={{ background: zone.color, opacity: 0.7 }} />
            <div className="mt-1 text-[9px] font-medium text-muted-foreground">{zone.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FearGreedHistory({ history }: { history: Array<{ value: string; timestamp: string }> }) {
  const values = [...history].reverse();
  return (
    <div className="flex h-20 items-end gap-[3px]">
      {values.map((v) => {
        const num = Number(v.value) || 0;
        const tone = fearGreedClassification(num);
        return (
          <div
            key={v.timestamp}
            className="flex-1 rounded-t-sm transition-all"
            title={`${v.timestamp} — ${num}`}
            style={{
              height: `${(num / 100) * 100}%`,
              background: fearGreedToneColor(tone.tone),
              opacity: 0.85,
              minHeight: 4,
            }}
          />
        );
      })}
    </div>
  );
}
