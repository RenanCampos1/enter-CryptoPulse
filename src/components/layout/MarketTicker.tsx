import { Link, useNavigate } from "react-router-dom";
import { formatPrice, formatPercent, changeColorClass } from "@/lib/format";
import { useCoinMarkets } from "@/lib/hooks";
import { trackCoinClick } from "@/lib/analytics";

const TICKER_IDS = ["bitcoin", "ethereum", "bnb", "solana", "xrp", "dogecoin", "cardano", "avalanche-2", "chainlink"];

export function MarketTicker() {
  const { data: coins } = useCoinMarkets(TICKER_IDS);
  const navigate = useNavigate();

  if (!coins || coins.length === 0) return null;

  const items = [...coins, ...coins];

  return (
    <div className="relative h-9 overflow-hidden border-b border-border/60 bg-card-secondary/70 backdrop-blur-xl">
      <div className="flex h-full w-max animate-ticker-scroll items-center gap-0 hover:[animation-play-state:paused]">
        {items.map((coin, i) => (
          <button
            key={`${coin.id}-${i}`}
            onClick={() => {
              trackCoinClick(coin.id, coin.symbol, "ticker");
              navigate(`/crypto/${coin.id}`);
            }}
            className="group flex h-full shrink-0 items-center gap-2 border-r border-border/40 px-5 transition-colors hover:bg-accent"
          >
            <span className="font-mono-nums text-xs font-semibold uppercase text-foreground">{coin.symbol}</span>
            <span className="font-mono-nums text-xs text-muted-foreground">{formatPrice(coin.current_price)}</span>
            <span className={`font-mono-nums text-xs ${changeColorClass(coin.price_change_percentage_24h)}`}>
              {formatPercent(coin.price_change_percentage_24h)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function TickerLink() {
  return <Link to="/" className="sr-only">CryptoPulse</Link>;
}
