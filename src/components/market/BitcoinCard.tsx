import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { useCoinMarkets } from "@/lib/hooks";
import { formatPrice, formatCompact, formatPercent, formatNumber, changeColorClass } from "@/lib/format";
import { trackCoinClick } from "@/lib/analytics";
import { PriceChart } from "./PriceChart";
import { CoinShareButton } from "@/components/share/CoinShareCard";
import { ErrorState } from "./ErrorState";

function Metric({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-mono-nums mt-0.5 text-sm font-semibold ${valueClass ?? "text-foreground"}`}>{value}</div>
    </div>
  );
}

export function BitcoinCard() {
  const { data: coins, isLoading, isError, dataUpdatedAt } = useCoinMarkets(["bitcoin"]);
  const btc = coins?.[0];

  return (
    <section className="card-glow relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 md:p-6">
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-warning/10 blur-3xl" />

      {isError ? (
        <ErrorState lastUpdated={dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString("pt-BR") : undefined} />
      ) : (
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {btc?.image ? (
                <img src={btc.image} alt="Bitcoin" className="h-10 w-10 rounded-full bg-card-secondary" />
              ) : (
                <span className="h-10 w-10 animate-pulse rounded-full bg-card-secondary" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-bold text-foreground">Bitcoin</h2>
                  <span className="rounded-md bg-card-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    BTC
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Link
                    to="/crypto/bitcoin"
                    onClick={() => trackCoinClick("bitcoin", "btc", "hero")}
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    Ver detalhes <ArrowUpRight className="h-3 w-3" />
                  </Link>
                  <span className="text-muted-foreground">
                    #{btc?.market_cap_rank ?? "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CoinShareButton coinId="bitcoin" coinName="Bitcoin" />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-3">
            <div>
              <div className="text-xs text-muted-foreground">Preço atual</div>
              <div className="font-mono-nums text-3xl font-bold text-foreground sm:text-4xl">
                {isLoading && !btc ? "—" : formatPrice(btc?.current_price)}
              </div>
            </div>
            <div className="flex items-center gap-2 pb-1">
              {isLoading && !btc ? (
                <span className="h-6 w-20 animate-pulse rounded bg-card-secondary" />
              ) : (
                <>
                  <span
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-mono-nums text-sm font-semibold ${
                      (btc?.price_change_percentage_24h ?? 0) >= 0
                        ? "bg-success/15 text-success"
                        : "bg-danger/15 text-danger"
                    }`}
                  >
                    {(btc?.price_change_percentage_24h ?? 0) >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {formatPercent(btc?.price_change_percentage_24h)}
                  </span>
                  <span className="text-xs text-muted-foreground">24h</span>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <Metric label="1h" value={formatPercent(btc?.price_change_percentage_1h_in_currency)} valueClass={changeColorClass(btc?.price_change_percentage_1h_in_currency)} />
            <Metric label="24h" value={formatPercent(btc?.price_change_percentage_24h)} valueClass={changeColorClass(btc?.price_change_percentage_24h)} />
            <Metric label="7d" value={formatPercent(btc?.price_change_percentage_7d_in_currency)} valueClass={changeColorClass(btc?.price_change_percentage_7d_in_currency)} />
            <Metric label="Market Cap" value={formatCompact(btc?.market_cap)} />
            <Metric label="Volume 24h" value={formatCompact(btc?.total_volume)} />
            <Metric label="ATH" value={formatPrice(btc?.ath)} valueClass="text-warning" />
          </div>

          <div className="mt-5">
            <PriceChart coinId="bitcoin" height={260} />
          </div>
        </div>
      )}
    </section>
  );
}
