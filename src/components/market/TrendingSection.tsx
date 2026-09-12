import { useNavigate } from "react-router-dom";
import { Flame, ArrowUpRight } from "lucide-react";
import { useTrending } from "@/lib/hooks";
import { formatPrice, formatPercent, changeColorClass } from "@/lib/format";
import { trackCoinClick } from "@/lib/analytics";
import { ErrorState } from "./ErrorState";

export function TrendingSection({ limit }: { limit?: number }) {
  const { data, isLoading, isError, dataUpdatedAt } = useTrending();
  const navigate = useNavigate();
  const items = limit ? (data?.coins ?? []).slice(0, limit) : (data?.coins ?? []);

  if (isError) {
    return <ErrorState lastUpdated={dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString("pt-BR") : undefined} />;
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/15 text-warning">
          <Flame className="h-4 w-4" />
        </span>
        <h2 className="font-display text-lg font-bold text-foreground">Trending Crypto</h2>
        <span className="text-xs text-muted-foreground">mais procuradas agora</span>
      </div>

      {isLoading && !data ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-card-secondary/70" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {items.map((t, i) => (
            <button
              key={t.item.id}
              onClick={() => {
                trackCoinClick(t.item.id, t.item.symbol, "trending");
                navigate(`/crypto/${t.item.id}`);
              }}
              className="card-glow group rounded-2xl border border-border/60 bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-warning/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={t.item.small} alt={t.item.name} className="h-8 w-8 rounded-full bg-card-secondary" loading="lazy" />
                  <div className="leading-tight">
                    <div className="max-w-[110px] truncate text-sm font-semibold text-foreground">{t.item.name}</div>
                    <div className="text-xs uppercase text-muted-foreground">{t.item.symbol}</div>
                  </div>
                </div>
                <span className="flex items-center gap-1 rounded-md bg-warning/15 px-1.5 py-0.5 text-[10px] font-semibold text-warning">
                  <Flame className="h-2.5 w-2.5" />
                  #{i + 1}
                </span>
              </div>

              <div className="mt-3 flex items-end justify-between">
                <div>
                  <div className="font-mono-nums text-sm font-bold text-foreground">
                    {formatPrice(t.item.data.price)}
                  </div>
                  <div className={`font-mono-nums text-xs ${changeColorClass(t.item.data.price_change_percentage_24h?.usd)}`}>
                    {formatPercent(t.item.data.price_change_percentage_24h?.usd)}
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Abrir <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
