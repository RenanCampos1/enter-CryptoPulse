import { Globe, BarChart3, Bitcoin, Coins, Gauge, Activity } from "lucide-react";
import type { ReactNode } from "react";
import { useGlobalData, useFearGreedLatest, fearGreedClassification, fearGreedToneColor } from "@/lib/hooks";
import { formatCompact, formatPercent, changeColorClass } from "@/lib/format";

function StatCard({
  icon,
  label,
  value,
  sub,
  subClass,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  subClass?: string;
  tone?: string;
}) {
  return (
    <div className="card-glow rounded-2xl border border-border/60 bg-card p-4 transition-transform hover:-translate-y-0.5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-card-secondary text-foreground">
          {icon}
        </span>
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="mt-3 font-mono-nums text-xl font-bold text-foreground sm:text-2xl">{value}</div>
      {sub ? <div className={`mt-1 text-xs ${subClass ?? "text-muted-foreground"}`}>{sub}</div> : null}
      {tone ? (
        <div className="mt-1 text-xs" style={{ color: tone }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}

export function OverviewCards() {
  const { data: global, isError: globalError } = useGlobalData();
  const { current, previous } = useFearGreedLatest();

  const mcap = global?.total_market_cap?.usd;
  const volume = global?.total_volume?.usd;
  const btcDom = global?.market_cap_percentage?.btc;
  const ethDom = global?.market_cap_percentage?.eth;
  const mcapChange = global?.market_cap_change_percentage_24h_usd;
  const active = global?.active_cryptocurrencies;

  const fg = current ? Number(current.value) : undefined;
  const fgPrev = previous ? Number(previous.value) : undefined;
  const fgDelta = fg !== undefined && fgPrev !== undefined ? fg - fgPrev : undefined;
  const fgTone = fg !== undefined ? fearGreedClassification(fg) : undefined;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <StatCard
        icon={<Globe className="h-4 w-4" />}
        label="Total Market Cap"
        value={formatCompact(mcap)}
        sub={`24h ${formatPercent(mcapChange)}`}
        subClass={changeColorClass(mcapChange)}
      />
      <StatCard
        icon={<BarChart3 className="h-4 w-4" />}
        label="Volume 24h"
        value={formatCompact(volume)}
        sub={globalError ? "indisponível" : undefined}
      />
      <StatCard
        icon={<Bitcoin className="h-4 w-4" />}
        label="BTC Dominance"
        value={btcDom !== undefined ? `${btcDom.toFixed(1)}%` : "—"}
      />
      <StatCard
        icon={<Coins className="h-4 w-4" />}
        label="ETH Dominance"
        value={ethDom !== undefined ? `${ethDom.toFixed(1)}%` : "—"}
      />
      <StatCard
        icon={<Gauge className="h-4 w-4" />}
        label="Fear & Greed"
        value={fg !== undefined ? String(fg) : "—"}
        tone={fgTone ? fearGreedToneColor(fgTone.tone) : undefined}
        sub={
          fg !== undefined
            ? `${fgTone?.label ?? ""}${fgDelta !== undefined ? ` · ${fgDelta >= 0 ? "+" : ""}${fgDelta}` : ""}`
            : undefined
        }
      />
      <StatCard
        icon={<Activity className="h-4 w-4" />}
        label="Moedas monitoradas"
        value={active ? String(active) : "—"}
      />
    </div>
  );
}
