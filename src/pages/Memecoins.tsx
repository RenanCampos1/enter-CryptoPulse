import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Frog } from "lucide-react";
import { useSeo } from "@/lib/seo";
import { useMarkets, useTrending } from "@/lib/hooks";
import { formatPrice, formatCompact, formatPercent } from "@/lib/format";
import { trackCoinClick } from "@/lib/analytics";
import { PageHeader } from "@/components/market/PageHeader";
import { ErrorState } from "@/components/market/ErrorState";
import { Sparkline } from "@/components/market/Sparkline";
import { cn } from "@/lib/utils";

const SORTS = [
  { key: "cap", label: "Top Market Cap" },
  { key: "gainers", label: "Maiores altas" },
  { key: "volume", label: "Maior volume" },
  { key: "trending", label: "Trending" },
];

export default function Memecoins() {
  useSeo({
    title: "Memecoin Radar — DOGE, SHIB, PEPE e mais | CryptoPulse",
    description:
      "As principais memecoins do mercado: DOGE, SHIB, PEPE, BONK, FLOKI e WIF com preço, variação, volume e market cap em tempo real.",
    path: "/memecoins",
  });

  const [sort, setSort] = useState("cap");
  const navigate = useNavigate();
  const { data: coins, isError, dataUpdatedAt } = useMarkets(60, "memes");
  const { data: trending } = useTrending();

  const rows = useMemo(() => {
    const list = [...(coins ?? [])];
    if (sort === "gainers") {
      return list.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
    }
    if (sort === "volume") {
      return list.sort((a, b) => b.total_volume - a.total_volume);
    }
    if (sort === "trending") {
      const trendIds = new Set((trending?.coins ?? []).map((t) => t.item.id));
      return list
        .filter((c) => trendIds.has(c.id))
        .concat(list.filter((c) => !trendIds.has(c.id)));
    }
    return list.sort((a, b) => a.market_cap_rank - b.market_cap_rank);
  }, [coins, sort, trending]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Memecoin Radar"
        subtitle="As memecoins mais relevantes do mercado, com preço, variação, volume e ranking."
      />

      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {SORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSort(s.key)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              sort === s.key
                ? "bg-primary text-primary-foreground"
                : "bg-card-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {isError ? (
        <ErrorState lastUpdated={dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString("pt-BR") : undefined} />
      ) : (
        <div className="card-glow overflow-x-auto rounded-2xl border border-border/60 bg-card">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Moeda</th>
                <th className="px-4 py-3 text-right font-medium">Preço</th>
                <th className="px-4 py-3 text-right font-medium">24h</th>
                <th className="hidden px-4 py-3 text-right font-medium md:table-cell">Volume 24h</th>
                <th className="hidden px-4 py-3 text-right font-medium lg:table-cell">Market Cap</th>
                <th className="hidden px-4 py-3 text-right font-medium xl:table-cell">7d</th>
                <th className="hidden px-4 py-3 text-right font-medium xl:table-cell">Ranking</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((coin, i) => {
                const trend = new Set((trending?.coins ?? []).map((t) => t.item.id)).has(coin.id);
                return (
                  <tr
                    key={coin.id}
                    onClick={() => {
                      trackCoinClick(coin.id, coin.symbol, "memecoins");
                      navigate(`/crypto/${coin.id}`);
                    }}
                    className="cursor-pointer border-b border-border/40 transition-colors last:border-0 hover:bg-accent/50"
                  >
                    <td className="px-4 py-3 font-mono-nums text-xs text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <img src={coin.image} alt={coin.name} className="h-7 w-7 rounded-full bg-card-secondary" loading="lazy" />
                        <div className="leading-tight">
                          <div className="flex items-center gap-1.5 font-medium text-foreground">
                            {coin.name}
                            {trend ? (
                              <span className="flex items-center gap-0.5 rounded-md bg-warning/15 px-1 py-0.5 text-[10px] font-semibold text-warning">
                                <Frog className="h-2.5 w-2.5" /> Trending
                              </span>
                            ) : null}
                          </div>
                          <div className="text-xs uppercase text-muted-foreground">{coin.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono-nums">{formatPrice(coin.current_price)}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={cn(
                          "inline-block min-w-[72px] rounded-lg px-2 py-1 text-right font-mono-nums text-xs font-semibold",
                          (coin.price_change_percentage_24h ?? 0) >= 0
                            ? "bg-success/15 text-success"
                            : "bg-danger/15 text-danger"
                        )}
                      >
                        {formatPercent(coin.price_change_percentage_24h)}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-right font-mono-nums text-muted-foreground md:table-cell">
                      {formatCompact(coin.total_volume)}
                    </td>
                    <td className="hidden px-4 py-3 text-right font-mono-nums text-muted-foreground lg:table-cell">
                      {formatCompact(coin.market_cap)}
                    </td>
                    <td className="hidden px-4 py-3 xl:table-cell">
                      <div className="flex justify-end">
                        <Sparkline data={coin.sparkline_in_7d?.price ?? []} width={90} height={30} />
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-right font-mono-nums text-xs text-muted-foreground xl:table-cell">
                      #{coin.market_cap_rank}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
