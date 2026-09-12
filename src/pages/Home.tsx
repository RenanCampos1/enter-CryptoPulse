import { Link } from "react-router-dom";
import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { useSeo } from "@/lib/seo";
import { useMarkets, useNews, useFearGreedLatest } from "@/lib/hooks";
import { OverviewCards } from "@/components/market/OverviewCards";
import { BitcoinCard } from "@/components/market/BitcoinCard";
import { RankingTable } from "@/components/market/RankingTable";
import { TrendingSection } from "@/components/market/TrendingSection";
import { FearGreedGauge } from "@/components/market/FearGreedGauge";
import { MarketHeatmap } from "@/components/market/MarketHeatmap";
import { MarketBias } from "@/components/market/MarketBias";
import { MarketAlerts } from "@/components/market/MarketAlerts";
import { NewsList } from "@/components/market/NewsList";
import { MarketShareButton } from "@/components/share/MarketShareCard";
import { ErrorState } from "@/components/market/ErrorState";

export default function Home() {
  useSeo({
    title: "CryptoPulse — O mercado cripto em um só lugar",
    description:
      "Preços de criptomoedas em tempo real, Bitcoin, Ethereum, market cap, dominância, Fear & Greed, notícias, rankings e tendências do mercado.",
  });

  const { data: coins, isError: coinsError, dataUpdatedAt } = useMarkets(100);
  const { data: articles, isError: newsError } = useNews();
  const { current, previous } = useFearGreedLatest();
  const fg = current ? Number(current.value) : undefined;
  const fgPrev = previous ? Number(previous.value) : undefined;

  return (
    <div className="space-y-8 md:space-y-10">
      {/* HERO */}
      <section className="relative overflow-hidden pt-4 md:pt-8">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-warning/10 blur-3xl" />

        <div className="relative flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl animate-fade-up">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card-secondary px-3 py-1 text-xs text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              Dados ao vivo — mercado cripto
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
              O mercado cripto{" "}
              <span className="gradient-primary bg-clip-text text-transparent text-glow-primary">em um só lugar.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
              Preços, notícias, tendências e indicadores do mercado de criptomoedas em tempo real.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <MarketShareButton />
            <Link
              to="/market"
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50"
            >
              Ver mercado <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* OVERVIEW */}
      <OverviewCards />

      {/* BITCOIN */}
      <BitcoinCard />

      {/* GAINERS / LOSERS */}
      <div className="grid gap-6 xl:grid-cols-2">
        <RankingTable
          title="Maiores altas"
          direction="up"
          coins={coins ?? []}
          limit={6}
          showAllTo="/gainers"
          shareLabel="Compartilhar ranking"
        />
        <RankingTable
          title="Maiores quedas"
          direction="down"
          coins={coins ?? []}
          limit={6}
          showAllTo="/losers"
          shareLabel="Compartilhar ranking"
        />
      </div>

      {coinsError ? (
        <ErrorState
          message="Dados temporariamente indisponíveis."
          lastUpdated={dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString("pt-BR") : undefined}
        />
      ) : null}

      {/* TRENDING */}
      <TrendingSection limit={10} />

      {/* FEAR & GREED */}
      <section className="card-glow rounded-2xl border border-border/60 bg-card p-5 md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-card-secondary text-foreground">
              <TrendingUp className="h-4 w-4" />
            </span>
            <h2 className="font-display text-lg font-bold text-foreground">Crypto Fear & Greed</h2>
            <span className="text-xs text-muted-foreground">sentimento do mercado</span>
          </div>
          <div className="flex items-center gap-2">
            {fg !== undefined && fgPrev !== undefined ? (
              <span className={`text-xs font-medium ${fg >= fgPrev ? "text-success" : "text-danger"}`}>
                {fg >= fgPrev ? "▲" : "▼"} {Math.abs(fg - fgPrev)} vs ontem
              </span>
            ) : null}
            <MarketShareButton label="Compartilhar Fear & Greed" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex items-center justify-center">
            {fg !== undefined ? <FearGreedGauge value={fg} /> : <ErrorState />}
          </div>
          <div className="flex flex-col justify-center gap-3 text-sm text-muted-foreground">
            <p>
              O <strong className="text-foreground">Fear & Greed Index</strong> mede o sentimento
              predominante do mercado de criptomoedas em uma escala de 0 (extreme fear) a 100
              (extreme greed).
            </p>
            <ul className="list-inside space-y-1.5 text-xs">
              <li>
                <strong className="text-danger">0–24 — Extreme Fear</strong>: medo extremo, possível
                oportunidade.
              </li>
              <li>
                <strong className="text-warning">25–44 — Fear</strong>: cautela predominante.
              </li>
              <li>
                <strong className="text-muted-foreground">45–54 — Neutral</strong>: equilíbrio.
              </li>
              <li>
                <strong className="text-success">55–75 — Greed</strong>: otimismo predominante.
              </li>
              <li>
                <strong className="text-success">76–100 — Extreme Greed</strong>: euforia, risco de
                correção.
              </li>
            </ul>
            <p className="text-xs">
              O índice considera volatilidade, momentum, volume e pesquisas. É um indicador
              informativo, não uma recomendação de investimento.
            </p>
          </div>
        </div>
      </section>

      {/* HEATMAP */}
      <MarketHeatmap />

      {/* BIAS + ALERTS */}
      <div className="grid gap-6 xl:grid-cols-2">
        <MarketBias />
        <MarketAlerts />
      </div>

      {/* NEWS */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-card-secondary text-foreground">
              <TrendingDown className="h-4 w-4 rotate-180" />
            </span>
            <h2 className="font-display text-lg font-bold text-foreground">Últimas notícias</h2>
          </div>
          <Link
            to="/news"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Todas as notícias <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        {newsError ? (
          <ErrorState message="Notícias temporariamente indisponíveis." />
        ) : (
          <NewsList articles={articles ?? []} limit={6} />
        )}
      </section>
    </div>
  );
}
