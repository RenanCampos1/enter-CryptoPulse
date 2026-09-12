import { Link, useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { formatPrice, formatCompact, formatPercent, changeColorClass } from "@/lib/format";
import { trackCoinClick } from "@/lib/analytics";
import { Sparkline } from "./Sparkline";
import type { MarketCoin } from "@/lib/api/types";
import { MarketShareButton } from "@/components/share/MarketShareCard";

interface RankingTableProps {
  title: string;
  direction: "up" | "down";
  coins: MarketCoin[];
  limit?: number;
  showAllTo?: string;
  shareLabel?: string;
}

export function RankingTable({ title, direction, coins, limit, showAllTo, shareLabel }: RankingTableProps) {
  const navigate = useNavigate();
  const sorted = [...coins].sort((a, b) =>
    direction === "up"
      ? b.price_change_percentage_24h - a.price_change_percentage_24h
      : a.price_change_percentage_24h - b.price_change_percentage_24h
  );
  const rows = limit ? sorted.slice(0, limit) : sorted;
  const Icon = direction === "up" ? TrendingUp : TrendingDown;

  return (
    <section className="card-glow rounded-2xl border border-border/60 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-4">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              direction === "up" ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
            }`}
          >
            <Icon className="h-4 w-4" />
          </span>
          <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {shareLabel ? <MarketShareButton label={shareLabel} /> : null}
          {showAllTo ? (
            <Link
              to={showAllTo}
              className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              Ver todas <ArrowUpRight className="h-3 w-3" />
            </Link>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[344px] text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-2 py-3 font-medium">#</th>
              <th className="px-1.5 py-3 font-medium">Moeda</th>
              <th className="px-1.5 py-3 text-right font-medium">Preço</th>
              <th className="px-1.5 py-3 text-right font-medium">24h</th>
              <th className="hidden px-4 py-3 text-right font-medium md:table-cell">Volume 24h</th>
              <th className="hidden px-4 py-3 text-right font-medium lg:table-cell">Market Cap</th>
              <th className="hidden px-4 py-3 text-right font-medium xl:table-cell">7d</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((coin, i) => {
              const positive = (coin.price_change_percentage_24h ?? 0) >= 0;
              return (
                <tr
                  key={coin.id}
                  onClick={() => {
                    trackCoinClick(coin.id, coin.symbol, direction === "up" ? "gainers" : "losers");
                    navigate(`/crypto/${coin.id}`);
                  }}
                  className="cursor-pointer border-b border-border/40 transition-colors last:border-0 hover:bg-accent/50"
                >
                  <td className="px-2 py-3 font-mono-nums text-xs text-muted-foreground">{i + 1}</td>
                  <td className="px-1.5 py-3">
                    <div className="flex items-center gap-2">
                      {coin.image ? (
                        <img src={coin.image} alt={coin.name} className="h-6 w-6 shrink-0 rounded-full bg-card-secondary" loading="lazy" />
                      ) : (
                        <span className="h-6 w-6 shrink-0 rounded-full bg-card-secondary" />
                      )}
                      <div className="min-w-0 leading-tight">
                        <div className="max-w-[96px] truncate font-medium text-foreground">{coin.name}</div>
                        <div className="text-xs uppercase text-muted-foreground">{coin.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-1.5 py-3 text-right font-mono-nums">{formatPrice(coin.current_price)}</td>
                  <td className="px-1.5 py-3 text-right">
                    <span
                      className={`inline-block min-w-[62px] rounded-lg px-1.5 py-1 text-right font-mono-nums text-xs font-semibold ${
                        positive ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
                      }`}
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
                    <div className="flex items-center justify-end gap-2">
                      <Sparkline data={coin.sparkline_in_7d?.price ?? []} width={90} height={30} />
                      <span className={`font-mono-nums text-xs ${changeColorClass(coin.price_change_percentage_7d_in_currency)}`}>
                        {formatPercent(coin.price_change_percentage_7d_in_currency)}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
