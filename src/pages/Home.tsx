import { Link } from "react-router-dom";
import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSeo } from "@/lib/seo";
import { useMarkets, useNews, useFearGreedLatest } from "@/lib/hooks";
import { formatClock } from "@/lib/format";
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
  const { t } = useTranslation();
  useSeo({
    title: t("seo.homeTitle"),
    description: t("seo.homeDesc"),
  });

  const { data: coins, isError: coinsError, dataUpdatedAt } = useMarkets(100);
  const bitcoin = coins?.find((c) => c.id === "bitcoin");
  const { data: articles, isError: newsError } = useNews();
  const { current, previous } = useFearGreedLatest();
  const fg = current ? Number(current.value) : undefined;
  const fgPrev = previous ? Number(previous.value) : undefined;

  const fngZones = [
    { range: t("home.fngZoneRange1"), label: t("home.fngZoneLabel1"), desc: t("home.fngZoneDesc1"), cls: "text-danger" },
    { range: t("home.fngZoneRange2"), label: t("home.fngZoneLabel2"), desc: t("home.fngZoneDesc2"), cls: "text-warning" },
    { range: t("home.fngZoneRange3"), label: t("home.fngZoneLabel3"), desc: t("home.fngZoneDesc3"), cls: "text-muted-foreground" },
    { range: t("home.fngZoneRange4"), label: t("home.fngZoneLabel4"), desc: t("home.fngZoneDesc4"), cls: "text-success" },
    { range: t("home.fngZoneRange5"), label: t("home.fngZoneLabel5"), desc: t("home.fngZoneDesc5"), cls: "text-success" },
  ];

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
              {t("home.hero.badge")}
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
              {t("home.hero.titleBefore")}{" "}
              <span className="gradient-primary bg-clip-text text-transparent text-glow-primary">
                {t("home.hero.titleGradient")}
              </span>
            </h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
              {t("home.hero.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <MarketShareButton />
            <Link
              to="/market"
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50"
            >
              {t("home.viewMarket")} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Slot de anúncio reservado (topo) — ativar quando houver tráfego */}
      <div data-ad-slot="home-top" className="hidden" />

      {/* OVERVIEW */}
      <OverviewCards />

      {/* BITCOIN */}
      <BitcoinCard coin={bitcoin} />

      {/* Slot de anúncio reservado (entre conteúdos) */}
      <div data-ad-slot="home-mid" className="hidden" />

      {/* GAINERS / LOSERS */}
      <div className="grid gap-6 xl:grid-cols-2">
        <RankingTable
          title={t("home.gainersTitle")}
          direction="up"
          coins={coins ?? []}
          limit={6}
          showAllTo="/gainers"
          shareLabel={t("home.shareRanking")}
        />
        <RankingTable
          title={t("home.losersTitle")}
          direction="down"
          coins={coins ?? []}
          limit={6}
          showAllTo="/losers"
          shareLabel={t("home.shareRanking")}
        />
      </div>

      {coinsError ? (
        <ErrorState lastUpdated={dataUpdatedAt ? formatClock(dataUpdatedAt / 1000) : undefined} />
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
            <h2 className="font-display text-lg font-bold text-foreground">{t("home.fearGreedTitle")}</h2>
            <span className="text-xs text-muted-foreground">{t("home.fearGreedSub")}</span>
          </div>
          <div className="flex items-center gap-2">
            {fg !== undefined && fgPrev !== undefined ? (
              <span className={`text-xs font-medium ${fg >= fgPrev ? "text-success" : "text-danger"}`}>
                {fg >= fgPrev ? "▲" : "▼"} {t("home.vsYesterday", { delta: Math.abs(fg - fgPrev) })}
              </span>
            ) : null}
            <MarketShareButton label={t("home.shareFearGreed")} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex items-center justify-center">
            {fg !== undefined ? <FearGreedGauge value={fg} /> : <ErrorState />}
          </div>
          <div className="flex flex-col justify-center gap-3 text-sm text-muted-foreground">
            <p>
              {t("home.fngIntroBefore")}{" "}
              <strong className="text-foreground">{t("home.fngIndexName")}</strong>{" "}
              {t("home.fngIntroAfter")}
            </p>
            <ul className="list-inside space-y-1.5 text-xs">
              {fngZones.map((zone) => (
                <li key={zone.range}>
                  <strong className={zone.cls}>
                    {zone.range} — {zone.label}
                  </strong>
                  : {zone.desc}
                </li>
              ))}
            </ul>
            <p className="text-xs">{t("home.fngOutro")}</p>
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
            <h2 className="font-display text-lg font-bold text-foreground">{t("home.latestNews")}</h2>
          </div>
          <Link
            to="/news"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {t("home.allNews")} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        {newsError ? (
          <ErrorState message={t("home.newsError")} />
        ) : (
          <NewsList articles={articles ?? []} limit={6} />
        )}
      </section>
    </div>
  );
}
