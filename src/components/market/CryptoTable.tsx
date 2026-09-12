import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { useMarkets } from "@/lib/hooks";
import { formatPrice, formatCompact, formatPercent, formatNumber, changeColorClass } from "@/lib/format";
import { trackCoinClick } from "@/lib/analytics";
import { Sparkline } from "./Sparkline";
import { ErrorState } from "./ErrorState";
import { cn } from "@/lib/utils";

const FILTERS = [
  { label: "Todas", key: "all" },
  { label: "Top 10", key: "top10" },
  { label: "Top 50", key: "top50" },
  { label: "Top 100", key: "top100" },
  { label: "Favoritas", key: "favorites" },
  { label: "DeFi", key: "decentralized-finance-defi" },
  { label: "Memecoins", key: "meme-token" },
  { label: "AI", key: "artificial-intelligence" },
  { label: "Gaming", key: "gaming" },
  { label: "Layer 1", key: "layer-1" },
  { label: "Layer 2", key: "layer-2" },
  { label: "RWA", key: "real-world-assets-rwa" },
];

const FAV_KEY = "cryptopulse-favorites";

function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (raw) setFavorites(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      try {
        localStorage.setItem(FAV_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { favorites, toggle };
}

export function CryptoTable() {
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const { favorites, toggle } = useFavorites();

  const isCategory = !["all", "top10", "top50", "top100", "favorites"].includes(filter);
  const { data, isLoading, isError, dataUpdatedAt } = useMarkets(isCategory ? 60 : 100, isCategory ? filter : undefined);

  const rows = useMemo(() => {
    const list = data ?? [];
    switch (filter) {
      case "top10":
        return list.slice(0, 10);
      case "top50":
        return list.slice(0, 50);
      case "top100":
        return list.slice(0, 100);
      case "favorites":
        return list.filter((c) => favorites.includes(c.id));
      default:
        return list;
    }
  }, [data, filter, favorites]);

  return (
    <div className="card-glow overflow-hidden rounded-2xl border border-border/60 bg-card">
      <div className="flex items-center gap-2 overflow-x-auto border-b border-border/60 p-3 no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-card-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isError ? (
        <div className="p-4">
          <ErrorState lastUpdated={dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString("pt-BR") : undefined} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="w-10 px-4 py-3"></th>
                <th className="px-2 py-3 font-medium">#</th>
                <th className="px-2 py-3 font-medium">Moeda</th>
                <th className="px-2 py-3 text-right font-medium">Preço</th>
                <th className="px-2 py-3 text-right font-medium">1h</th>
                <th className="px-2 py-3 text-right font-medium">24h</th>
                <th className="px-2 py-3 text-right font-medium">7d</th>
                <th className="hidden px-2 py-3 text-right font-medium md:table-cell">Market Cap</th>
                <th className="hidden px-2 py-3 text-right font-medium lg:table-cell">Volume 24h</th>
                <th className="hidden px-2 py-3 text-right font-medium xl:table-cell">Circulating Supply</th>
                <th className="hidden px-2 py-3 text-right font-medium lg:table-cell">7d</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !data
                ? Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/40">
                      <td className="px-4 py-3" colSpan={11}>
                        <div className="h-9 animate-pulse rounded-lg bg-card-secondary/60" />
                      </td>
                    </tr>
                  ))
                : rows.map((coin) => (
                    <tr
                      key={coin.id}
                      onClick={() => {
                        trackCoinClick(coin.id, coin.symbol, "market");
                        navigate(`/crypto/${coin.id}`);
                      }}
                      className="cursor-pointer border-b border-border/40 transition-colors last:border-0 hover:bg-accent/50"
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggle(coin.id)}
                          className={cn(
                            "transition-colors",
                            favorites.includes(coin.id) ? "text-warning" : "text-muted-foreground/40 hover:text-muted-foreground"
                          )}
                          aria-label={favorites.includes(coin.id) ? "Remover favorita" : "Adicionar favorita"}
                        >
                          <Star className={cn("h-4 w-4", favorites.includes(coin.id) && "fill-current")} />
                        </button>
                      </td>
                      <td className="px-2 py-3 font-mono-nums text-xs text-muted-foreground">{coin.market_cap_rank}</td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2.5">
                          <img src={coin.image} alt={coin.name} className="h-7 w-7 rounded-full bg-card-secondary" loading="lazy" />
                          <div className="leading-tight">
                            <div className="max-w-[140px] truncate font-medium text-foreground">{coin.name}</div>
                            <div className="text-xs uppercase text-muted-foreground">{coin.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-right font-mono-nums">{formatPrice(coin.current_price)}</td>
                      <td className={cn("px-2 py-3 text-right font-mono-nums text-xs", changeColorClass(coin.price_change_percentage_1h_in_currency))}>
                        {formatPercent(coin.price_change_percentage_1h_in_currency)}
                      </td>
                      <td className="px-2 py-3 text-right">
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
                      <td className={cn("px-2 py-3 text-right font-mono-nums text-xs", changeColorClass(coin.price_change_percentage_7d_in_currency))}>
                        {formatPercent(coin.price_change_percentage_7d_in_currency)}
                      </td>
                      <td className="hidden px-2 py-3 text-right font-mono-nums md:table-cell">{formatCompact(coin.market_cap)}</td>
                      <td className="hidden px-2 py-3 text-right font-mono-nums lg:table-cell">{formatCompact(coin.total_volume)}</td>
                      <td className="hidden px-2 py-3 text-right font-mono-nums xl:table-cell">
                        {coin.circulating_supply ? formatNumber(coin.circulating_supply) : "—"}
                      </td>
                      <td className="hidden px-2 py-3 lg:table-cell">
                        <div className="flex justify-end">
                          <Sparkline data={coin.sparkline_in_7d?.price ?? []} width={90} height={30} />
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
