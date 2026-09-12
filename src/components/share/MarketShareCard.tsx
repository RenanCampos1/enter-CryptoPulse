import { Share2, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGlobalData, useMarkets, useFearGreedLatest } from "@/lib/hooks";
import { formatCompact, formatPrice, formatPercent, changeColorClass } from "@/lib/format";
import { trackMarketShare } from "@/lib/analytics";
import { Logo } from "@/components/layout/Logo";
import { ShareCard, type ShareFormat } from "./ShareCard";
import type { MarketCoin } from "@/lib/api/types";

function Stat({ label, value, sub, subClass }: { label: string; value: string; sub?: string; subClass?: string }) {
  return (
    <div className="rounded-xl bg-card-secondary/80 px-4 py-3">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono-nums mt-0.5 truncate text-lg font-semibold text-foreground">{value}</div>
      {sub ? <div className={subClass ?? "text-xs text-muted-foreground"}>{sub}</div> : null}
    </div>
  );
}

export function MarketShareCardContent({ format }: { format: ShareFormat }) {
  const { data: global } = useGlobalData();
  const { data: coins } = useMarkets(100);
  const { current } = useFearGreedLatest();

  const btc = coins?.find((c) => c.id === "bitcoin");
  const eth = coins?.find((c) => c.id === "ethereum");
  const gainer = [...(coins ?? [])].sort(
    (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
  )[0];
  const loser = [...(coins ?? [])].sort(
    (a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h
  )[0];

  const mcap = global?.total_market_cap?.usd;
  const dominance = global?.market_cap_percentage?.btc;
  const fg = current ? Number(current.value) : undefined;
  const now = new Date();

  const isStory = format === "9:16";
  const isWide = format === "16:9";

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#080B10] p-5 text-foreground">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-[#16C784]/10 blur-3xl" />

      <div className="relative flex items-start justify-between">
        <Logo />
        <div className="text-right text-[11px] leading-tight text-muted-foreground">
          <div className="font-medium text-foreground">
            {now.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
          </div>
          <div>{now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
      </div>

      <div className="relative mt-3 flex items-baseline justify-between gap-2">
        <div>
          <div className="text-xs text-muted-foreground">Total Market Cap</div>
          <div className="font-mono-nums text-2xl font-bold">{formatCompact(mcap)}</div>
        </div>
        <div className="rounded-lg bg-card-secondary px-3 py-1.5 text-right">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Fear & Greed</div>
          <div className="font-mono-nums text-lg font-semibold">
            {fg !== undefined ? `${fg} / 100` : "—"}
          </div>
        </div>
      </div>

      <div className={isStory ? "relative mt-3 flex flex-1 flex-col gap-2" : "relative mt-3 grid grid-cols-2 gap-2"}>
        <Stat
          label="BTC"
          value={formatPrice(btc?.current_price)}
          sub={`24h ${formatPercent(btc?.price_change_percentage_24h)}`}
          subClass={`text-xs ${changeColorClass(btc?.price_change_percentage_24h)}`}
        />
        <Stat
          label="ETH"
          value={formatPrice(eth?.current_price)}
          sub={`24h ${formatPercent(eth?.price_change_percentage_24h)}`}
          subClass={`text-xs ${changeColorClass(eth?.price_change_percentage_24h)}`}
        />

        <div className="rounded-xl bg-card-secondary/80 px-4 py-3">
          <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-success" /> Top Gainer
          </div>
          <div className="mt-0.5 truncate text-sm font-semibold text-foreground">
            {gainer ? `${gainer.symbol.toUpperCase()}` : "—"}
          </div>
          <div className={`text-xs ${changeColorClass(gainer?.price_change_percentage_24h)}`}>
            {formatPercent(gainer?.price_change_percentage_24h)}
          </div>
        </div>

        <div className="rounded-xl bg-card-secondary/80 px-4 py-3">
          <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <TrendingDown className="h-3 w-3 text-danger" /> Top Loser
          </div>
          <div className="mt-0.5 truncate text-sm font-semibold text-foreground">
            {loser ? `${loser.symbol.toUpperCase()}` : "—"}
          </div>
          <div className={`text-xs ${changeColorClass(loser?.price_change_percentage_24h)}`}>
            {formatPercent(loser?.price_change_percentage_24h)}
          </div>
        </div>
      </div>

      <div
        className={`relative mt-3 flex items-center justify-between text-[11px] ${
          isWide ? "" : "mt-auto"
        } text-muted-foreground`}
      >
        <span className="font-mono-nums font-semibold text-foreground">
          BTC Dominance {dominance !== undefined ? `${dominance.toFixed(1)}%` : "—"}
        </span>
        <span className="font-display font-semibold text-primary">CryptoPulse.com</span>
      </div>
    </div>
  );
}

export function MarketShareButton({ label = "Compartilhar mercado" }: { label?: string }) {
  return (
    <ShareCard
      trigger={
        <Button variant="default" data-analytics-share="market">
          <Share2 className="h-4 w-4" />
          {label}
        </Button>
      }
      dialogTitle="Compartilhar mercado"
      dialogDescription="Baixe o card e publique no WhatsApp, Instagram, Telegram, X, Facebook ou Discord."
      fileName="cryptopulse-mercado"
      shareText="Mercado cripto agora: BTC, ETH, Market Cap e Fear & Greed — via CryptoPulse"
      analyticsKind="market"
      onShared={() => trackMarketShare("1:1")}
      onDownloaded={() => trackMarketShare("1:1")}
    >
      {(format) => <MarketShareCardContent format={format} />}
    </ShareCard>
  );
}

export type { MarketCoin };
