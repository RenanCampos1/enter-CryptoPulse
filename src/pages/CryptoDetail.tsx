import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Globe, ExternalLink, MessageCircle, TrendingUp, TrendingDown, SearchX } from "lucide-react";
import { useSeo, coinSeoTitle } from "@/lib/seo";
import { useCoinDetail, useCoinMarkets, useNews, useTrending, stripHtml } from "@/lib/hooks";
import { formatPrice, formatCompact, formatPercent, formatNumber, formatDateTime, changeColorClass } from "@/lib/format";
import { PriceChart } from "@/components/market/PriceChart";
import { ErrorState } from "@/components/market/ErrorState";
import { NewsList } from "@/components/market/NewsList";
import { CoinShareButton } from "@/components/share/CoinShareCard";
import { TrendingSection } from "@/components/market/TrendingSection";
import { cn } from "@/lib/utils";

function StatRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 py-2.5 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`font-mono-nums text-sm font-semibold ${valueClass ?? "text-foreground"}`}>{value}</span>
    </div>
  );
}

export default function CryptoDetail() {
  const { id = "" } = useParams();
  const { data: coin, isLoading, isError, dataUpdatedAt } = useCoinDetail(id);
  const { data: marketCoins } = useCoinMarkets([id]);
  const market = marketCoins?.[0];

  const name = coin?.name ?? market?.name ?? "";
  const symbol = coin?.symbol ?? market?.symbol ?? "";

  useSeo({
    title: name ? coinSeoTitle(name, symbol) : `Criptomoeda ${id} | CryptoPulse`,
    description: name
      ? `${name} (${symbol.toUpperCase()}) hoje: cotação, preço, gráfico, market cap, volume, ATH e notícias em tempo real.`
      : "Preços de criptomoedas em tempo real.",
    path: `/crypto/${id}`,
  });

  const description = useMemo(() => {
    if (!coin) return "";
    const raw = coin.description?.pt || coin.description?.en || "";
    return stripHtml(raw).replace(/\s+/g, " ").trim().slice(0, 900);
  }, [coin]);

  if (isError && !coin) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <SearchX className="h-10 w-10 text-muted-foreground" />
        <div>
          <p className="font-display text-lg font-semibold text-foreground">Criptomoeda não encontrada</p>
          <p className="mt-1 text-sm text-muted-foreground">Verifique a URL ou busque por outra moeda.</p>
        </div>
        <Link
          to="/market"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <ArrowLeft className="h-4 w-4" /> Ver mercado
        </Link>
      </div>
    );
  }

  const md = coin?.market_data;

  return (
    <div className="space-y-6">
      <Link to="/market" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Mercado
      </Link>

      {/* CABEÇALHO */}
      <section className="card-glow rounded-2xl border border-border/60 bg-card p-5 md:p-6">
        {isLoading && !market ? (
          <div className="space-y-3">
            <div className="h-10 w-64 animate-pulse rounded-lg bg-card-secondary" />
            <div className="h-12 w-56 animate-pulse rounded-lg bg-card-secondary" />
            <div className="h-24 w-full animate-pulse rounded-xl bg-card-secondary" />
          </div>
        ) : (
          <div className="relative">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {market?.image ? (
                  <img src={market.image} alt={name} className="h-12 w-12 rounded-full bg-card-secondary" />
                ) : (
                  <span className="h-12 w-12 rounded-full bg-card-secondary" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-display text-2xl font-bold text-foreground">{name || id}</h1>
                    <span className="rounded-md bg-card-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {symbol.toUpperCase()}
                    </span>
                    {market?.market_cap_rank ? (
                      <span className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                        #{market.market_cap_rank}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs">
                    {coin?.links?.homepage?.[0] ? (
                      <a href={coin.links.homepage[0]} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                        <Globe className="h-3 w-3" /> Site
                      </a>
                    ) : null}
                    {coin?.links?.blockchain_site?.[0] ? (
                      <a href={coin.links.blockchain_site[0]} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                        <ExternalLink className="h-3 w-3" /> Explorer
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
              <CoinShareButton coinId={id} coinName={name || id} />
            </div>

            <div className="relative mt-5 flex flex-wrap items-end gap-x-8 gap-y-3">
              <div>
                <div className="text-xs text-muted-foreground">Preço atual</div>
                <div className="font-mono-nums text-3xl font-bold text-foreground sm:text-4xl">
                  {formatPrice(market?.current_price)}
                </div>
              </div>
              <div className="pb-1">
                <span
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-2.5 py-1 font-mono-nums text-sm font-semibold",
                    (market?.price_change_percentage_24h ?? 0) >= 0
                      ? "bg-success/15 text-success"
                      : "bg-danger/15 text-danger"
                  )}
                >
                  {(market?.price_change_percentage_24h ?? 0) >= 0 ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  {formatPercent(market?.price_change_percentage_24h)} 24h
                </span>
              </div>
            </div>

            <div className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <StatRow label="1h" value={formatPercent(market?.price_change_percentage_1h_in_currency)} valueClass={changeColorClass(market?.price_change_percentage_1h_in_currency)} />
              <StatRow label="7d" value={formatPercent(market?.price_change_percentage_7d_in_currency)} valueClass={changeColorClass(market?.price_change_percentage_7d_in_currency)} />
              <StatRow label="30d" value={formatPercent(market?.price_change_percentage_30d_in_currency)} valueClass={changeColorClass(market?.price_change_percentage_30d_in_currency)} />
              <StatRow label="1y" value={formatPercent(md?.price_change_percentage_1y_in_currency?.usd)} valueClass={changeColorClass(md?.price_change_percentage_1y_in_currency?.usd)} />
              <StatRow label="Market Cap" value={formatCompact(market?.market_cap)} />
              <StatRow label="Volume 24h" value={formatCompact(market?.total_volume)} />
              <StatRow label="Market Cap / Volume" value={market?.market_cap && market?.total_volume ? `${(market.market_cap / market.total_volume).toFixed(1)}x` : "—"} />
              <StatRow label="FDV" value={formatCompact(market?.fully_diluted_valuation)} />
              <StatRow label="Circulating Supply" value={market?.circulating_supply ? formatNumber(market.circulating_supply) : "—"} />
              <StatRow label="Total Supply" value={market?.total_supply ? formatNumber(market.total_supply) : "—"} />
              <StatRow label="Max Supply" value={market?.max_supply ? formatNumber(market.max_supply) : "—"} />
              <StatRow label="ATH" value={`${formatPrice(market?.ath)}`} valueClass="text-success" />
              <StatRow label="ATH %" value={formatPercent(market?.ath_change_percentage)} valueClass={changeColorClass(market?.ath_change_percentage)} />
              <StatRow label="ATH data" value={market?.ath_date ? formatDateTime(new Date(market.ath_date).getTime() / 1000) : "—"} />
              <StatRow label="ATL" value={formatPrice(market?.atl)} valueClass="text-danger" />
              <StatRow label="ATL data" value={market?.atl_date ? formatDateTime(new Date(market.atl_date).getTime() / 1000) : "—"} />
            </div>
          </div>
        )}
      </section>

      {/* GRÁFICO */}
      <section className="card-glow rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="font-display mb-4 text-lg font-bold text-foreground">Gráfico de preço — {symbol.toUpperCase() || id}</h2>
        <PriceChart coinId={id} height={340} />
      </section>

      {/* SOBRE */}
      {description ? (
        <section className="card-glow rounded-2xl border border-border/60 bg-card p-5">
          <h2 className="font-display mb-3 text-lg font-bold text-foreground">Sobre {name}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          {coin?.categories?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {coin.categories.slice(0, 8).map((cat) => (
                <span key={cat} className="rounded-lg bg-card-secondary px-2.5 py-1 text-xs text-muted-foreground">
                  {cat}
                </span>
              ))}
            </div>
          ) : null}
          {coin?.community_data?.twitter_followers ? (
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              {coin.community_data.twitter_followers.toLocaleString("pt-BR")} seguidores no Twitter
            </div>
          ) : null}
        </section>
      ) : null}

      {/* NOTÍCIAS RELACIONADAS */}
      <RelatedNews symbol={symbol} name={name} />

      {/* DESTAQUES */}
      <div>
        <h2 className="font-display mb-4 text-lg font-bold text-foreground">Moedas em destaque</h2>
        <TrendingSection limit={6} />
      </div>

      {isError ? (
        <ErrorState lastUpdated={dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString("pt-BR") : undefined} />
      ) : null}
    </div>
  );
}

function RelatedNews({ symbol, name }: { symbol: string; name: string }) {
  const { data: articles } = useNews();
  const filtered = useMemo(() => {
    if (!symbol && !name) return [];
    const needle = `${symbol}|${name}`.toLowerCase();
    return (articles ?? [])
      .filter((a) => new RegExp(`\\b(${needle.split("|").filter(Boolean).join("|")})\\b`).test(`${a.title} ${a.categories} ${a.body.slice(0, 200)}`.toLowerCase()))
      .slice(0, 6);
  }, [articles, symbol, name]);

  if (filtered.length === 0) return null;

  return (
    <section>
      <h2 className="font-display mb-4 text-lg font-bold text-foreground">Notícias relacionadas</h2>
      <NewsList articles={filtered} showSummaries />
    </section>
  );
}
