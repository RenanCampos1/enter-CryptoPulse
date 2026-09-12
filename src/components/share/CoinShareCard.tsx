import { useMemo } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCoinMarkets, useMarketChart } from "@/lib/hooks";
import { formatCompact, formatPrice, formatPercent, changeColorClass } from "@/lib/format";
import { trackCardDownload } from "@/lib/analytics";
import { Logo } from "@/components/layout/Logo";
import { ShareCard, type ShareFormat } from "./ShareCard";
import { Sparkline } from "@/components/market/Sparkline";

export function CoinShareCardContent({ coinId, format }: { coinId: string; format: ShareFormat }) {
  const { data: coins } = useCoinMarkets([coinId]);
  const { data: chart } = useMarketChart(coinId, "1D");
  const coin = coins?.[0];

  const prices = useMemo(() => (chart ?? []).map((p) => p.price), [chart]);
  const up = (coin?.price_change_percentage_24h ?? 0) >= 0;
  const isStory = format === "9:16";

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#080B10] p-5 text-foreground">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Logo compact />
          <span className="text-[11px] text-muted-foreground">
            {new Date().toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        {coin?.image ? (
          <img src={coin.image} alt={coin.name} crossOrigin="anonymous" className="h-7 w-7 rounded-full bg-card-secondary" />
        ) : null}
      </div>

      <div className="relative mt-3">
        <div className="text-xs text-muted-foreground">
          {coin ? `${coin.name} agora` : "Mercado agora"}
        </div>
        <div className="font-mono-nums text-3xl font-bold">{formatPrice(coin?.current_price)}</div>
        <div className={`mt-0.5 text-sm ${changeColorClass(coin?.price_change_percentage_24h)}`}>
          {formatPercent(coin?.price_change_percentage_24h)} nas últimas 24h
        </div>
      </div>

      <div className="relative mt-3">
        <Sparkline data={prices} width={isStory ? 280 : 340} height={isStory ? 90 : 70} />
      </div>

      <div className={isStory ? "relative mt-3 flex flex-1 flex-col gap-2" : "relative mt-3 grid grid-cols-2 gap-2"}>
        <div className="rounded-xl bg-card-secondary/80 px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Market Cap</div>
          <div className="font-mono-nums mt-0.5 text-sm font-semibold">{formatCompact(coin?.market_cap)}</div>
        </div>
        <div className="rounded-xl bg-card-secondary/80 px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Volume 24h</div>
          <div className="font-mono-nums mt-0.5 text-sm font-semibold">{formatCompact(coin?.total_volume)}</div>
        </div>
      </div>

      <div
        className={`relative flex items-center justify-between text-[11px] ${
          isStory ? "" : "mt-auto"
        } pt-3 text-muted-foreground`}
      >
        <span className={`font-semibold ${up ? "text-success" : "text-danger"}`}>
          {up ? "▲ alta" : "▼ baixa"}
        </span>
        <span className="font-display font-semibold text-primary">CryptoPulse.com</span>
      </div>
    </div>
  );
}

export function CoinShareButton({ coinId, coinName }: { coinId: string; coinName: string }) {
  return (
    <ShareCard
      trigger={
        <Button variant="outline-muted" data-analytics-share="coin">
          <Share2 className="h-4 w-4" />
          Compartilhar
        </Button>
      }
      dialogTitle={`Compartilhar ${coinName}`}
      dialogDescription="Baixe o card e publique onde quiser."
      fileName={`cryptopulse-${coinId}`}
      shareText={`${coinName} agora: preço, variação, market cap e volume — via CryptoPulse`}
      analyticsKind="coin"
      onDownloaded={() => trackCardDownload("coin", "1:1")}
      onShared={() => trackCardDownload("coin", "1:1")}
    >
      {(format) => <CoinShareCardContent coinId={coinId} format={format} />}
    </ShareCard>
  );
}
