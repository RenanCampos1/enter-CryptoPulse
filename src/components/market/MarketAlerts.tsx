import { useMemo } from "react";
import { Bell, TrendingUp, TrendingDown, Wallet, ShieldAlert } from "lucide-react";
import { useGlobalData, useMarkets, useFearGreedLatest } from "@/lib/hooks";
import { formatPercent } from "@/lib/format";

const MEME_IDS = new Set(["dogecoin", "shiba-inu", "pepe", "bonk", "floki", "dogwifcoin"]);

interface Alert {
  id: string;
  tone: "up" | "down" | "info";
  text: string;
  icon: "up" | "down" | "sentiment";
}

export function MarketAlerts() {
  const { data: global } = useGlobalData();
  const { data: coins } = useMarkets(100);
  const { current, previous } = useFearGreedLatest();

  const alerts = useMemo<Alert[]>(() => {
    const out: Alert[] = [];
    const btc = coins?.find((c) => c.id === "bitcoin");
    const eth = coins?.find((c) => c.id === "ethereum");
    const btc24 = btc?.price_change_percentage_24h ?? 0;
    const eth24 = eth?.price_change_percentage_24h ?? 0;
    const mcapChange = global?.market_cap_change_percentage_24h_usd ?? 0;

    if (btc24 > 5) out.push({ id: "btc-up", tone: "up", text: `BTC subiu mais de ${formatPercent(btc24)} nas últimas 24h`, icon: "up" });
    if (btc24 < -5) out.push({ id: "btc-down", tone: "down", text: `BTC caiu mais de ${formatPercent(btc24)} nas últimas 24h`, icon: "down" });
    if (eth24 > 5) out.push({ id: "eth-up", tone: "up", text: `ETH valorizou ${formatPercent(eth24)} nas últimas 24h`, icon: "up" });

    if (mcapChange > 3) out.push({ id: "mcap-up", tone: "up", text: `Market cap do mercado subiu ${formatPercent(mcapChange)} em 24h`, icon: "up" });
    if (mcapChange < -3) out.push({ id: "mcap-down", tone: "down", text: `Market cap do mercado caiu ${formatPercent(mcapChange)} em 24h`, icon: "down" });

    const memes = (coins ?? []).filter((c) => MEME_IDS.has(c.id));
    if (memes.length) {
      const avg = memes.reduce((acc, c) => acc + (c.price_change_percentage_24h ?? 0), 0) / memes.length;
      if (avg > 5) out.push({ id: "meme-up", tone: "up", text: `Memecoins estão apresentando forte valorização (média ${formatPercent(avg)})`, icon: "up" });
      if (avg < -5) out.push({ id: "meme-down", tone: "down", text: `Memecoins em forte queda (média ${formatPercent(avg)})`, icon: "down" });
    }

    const fgNow = current ? Number(current.value) : undefined;
    const fgPrev = previous ? Number(previous.value) : undefined;
    if (fgNow !== undefined && fgPrev !== undefined) {
      const delta = fgNow - fgPrev;
      if (delta >= 5) out.push({ id: "fg-up", tone: "up", text: `Sentimento do mercado melhorou ${delta} pontos (Fear & Greed: ${fgNow}/100)`, icon: "sentiment" });
      if (delta <= -5) out.push({ id: "fg-down", tone: "down", text: `Sentimento do mercado piorou ${Math.abs(delta)} pontos (Fear & Greed: ${fgNow}/100)`, icon: "sentiment" });
    }

    if (out.length === 0) {
      out.push({ id: "calm", tone: "info", text: "Sem movimentos extremos agora — mercado em faixa normal.", icon: "sentiment" });
    }
    return out.slice(0, 4);
  }, [coins, global, current, previous]);

  return (
    <section className="card-glow rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-card-secondary text-foreground">
          <Bell className="h-4 w-4" />
        </span>
        <h2 className="font-display text-lg font-bold text-foreground">Market Alerts</h2>
        <span className="text-xs text-muted-foreground">movimentos detectados em dados reais</span>
      </div>

      <ul className="space-y-2">
        {alerts.map((a) => (
          <li
            key={a.id}
            className="flex items-center gap-3 rounded-xl bg-card-secondary/60 px-4 py-3 text-sm"
          >
            {a.icon === "up" ? (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-success/15 text-success">
                <TrendingUp className="h-4 w-4" />
              </span>
            ) : a.icon === "down" ? (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-danger/15 text-danger">
                <TrendingDown className="h-4 w-4" />
              </span>
            ) : (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-card text-muted-foreground">
                <ShieldAlert className="h-4 w-4" />
              </span>
            )}
            <span className="text-foreground/90">{a.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
