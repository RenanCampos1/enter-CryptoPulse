import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGlobalData, useMarkets, useFearGreedLatest } from "@/lib/hooks";
import { formatPercent, formatCompact } from "@/lib/format";

function clamp(v: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, v));
}

interface Factor {
  label: string;
  detail: string;
  score: number; // 0-100
  weight: number;
}

export function MarketBias() {
  const { t } = useTranslation();
  const { data: global } = useGlobalData();
  const { data: coins } = useMarkets(100);
  const { current } = useFearGreedLatest();

  const factors = useMemo<Factor[]>(() => {
    const btc = coins?.find((c) => c.id === "bitcoin");
    const fg = current ? Number(current.value) : undefined;

    const breadthList = coins ?? [];
    const breadth = breadthList.length
      ? breadthList.filter((c) => (c.price_change_percentage_24h ?? 0) >= 0).length / breadthList.length
      : 0.5;

    const price7d = btc?.price_change_percentage_7d_in_currency ?? 0;
    const priceScore = clamp(50 + price7d * 3);

    const mcapChange = global?.market_cap_change_percentage_24h_usd ?? 0;
    const mcapScore = clamp(50 + mcapChange * 5);

    const volAvg = breadthList.length
      ? breadthList.reduce((acc, c) => acc + Math.abs(c.price_change_percentage_1h_in_currency ?? 0), 0) /
        breadthList.length
      : 0;

    return [
      { label: t("bias.factorPrice"), detail: formatPercent(price7d), score: priceScore, weight: 0.25 },
      { label: t("bias.factorBreadth"), detail: t("bias.breadthDetail", { value: Math.round(breadth * 100) }), score: breadth * 100, weight: 0.25 },
      { label: t("bias.factorFearGreed"), detail: fg !== undefined ? `${fg}/100` : "—", score: fg ?? 50, weight: 0.25 },
      { label: t("bias.factorMomentum"), detail: formatPercent(mcapChange), score: mcapScore, weight: 0.25 },
    ];
  }, [coins, global, current, t]);

  const volatility = useMemo(() => {
    const coinsList = coins ?? [];
    if (!coinsList.length) return 0;
    return (
      coinsList.reduce((acc, c) => acc + Math.abs(c.price_change_percentage_1h_in_currency ?? 0), 0) /
      coinsList.length
    );
  }, [coins]);

  const rawScore = factors.reduce((acc, f) => acc + f.score * f.weight, 0);
  // Alta volatilidade puxa o score em direção ao neutro (50).
  const score = volatility > 4 ? rawScore * 0.85 + 50 * 0.15 : rawScore;

  const bias = score >= 60 ? "bullish" : score <= 40 ? "bearish" : "neutral";

  return (
    <section className="card-glow rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold text-foreground">{t("bias.title")}</h2>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Info className="h-3 w-3" />
          {t("bias.info")}
        </span>
      </div>

      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="text-center">
          <div
            className={`flex h-24 w-24 items-center justify-center rounded-2xl border font-display text-sm font-bold ${
              bias === "bullish"
                ? "border-success/40 bg-success/10 text-success"
                : bias === "bearish"
                ? "border-danger/40 bg-danger/10 text-danger"
                : "border-warning/40 bg-warning/10 text-warning"
            }`}
          >
            {bias === "bullish" ? (
              <span className="flex flex-col items-center">
                <TrendingUp className="h-6 w-6" />
                {t("bias.bullish")}
              </span>
            ) : bias === "bearish" ? (
              <span className="flex flex-col items-center">
                <TrendingDown className="h-6 w-6" />
                {t("bias.bearish")}
              </span>
            ) : (
              <span className="flex flex-col items-center">
                <Minus className="h-6 w-6" />
                {t("bias.neutral")}
              </span>
            )}
          </div>
        </div>

        <div className="w-full flex-1 space-y-2">
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t("bias.score", { value: score.toFixed(0) })}</span>
              <span>{t("bias.volatility", { value: volatility.toFixed(2) })}</span>
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-card-secondary">
              <div
                className={`h-full rounded-full transition-all ${
                  bias === "bullish" ? "bg-success" : bias === "bearish" ? "bg-danger" : "bg-warning"
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {factors.map((f) => (
            <div key={f.label} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {f.label}
                <span className="ml-1 font-mono-nums text-foreground/80">({f.detail})</span>
              </span>
              <span className="font-mono-nums font-semibold text-foreground">{Math.round(f.score)}/100</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-card-secondary/60 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">{t("bias.how")}</strong> {t("bias.calc", { mcap: formatCompact(global?.total_market_cap?.usd) })}
      </div>
    </section>
  );
}
