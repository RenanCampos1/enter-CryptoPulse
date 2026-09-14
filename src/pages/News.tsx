import { useMemo, useState } from "react";
import { Newspaper } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSeo } from "@/lib/seo";
import { useNews } from "@/lib/hooks";
import { NewsList } from "@/components/market/NewsList";
import { PageHeader } from "@/components/market/PageHeader";
import { ErrorState } from "@/components/market/ErrorState";
import { cn } from "@/lib/utils";
import { formatClock } from "@/lib/format";
import type { NewsArticle } from "@/lib/api/types";

interface NewsFilter {
  key: string;
  label: string;
  score?: (a: NewsArticle) => number;
  test?: (a: NewsArticle) => boolean;
}

const text = (a: NewsArticle) => `${a.title} ${a.categories} ${a.body.slice(0, 400)}`.toLowerCase();

export default function News() {
  const { t } = useTranslation();
  useSeo({
    title: t("seo.newsTitle"),
    description: t("seo.newsDesc"),
    path: "/news",
  });

  const filters: NewsFilter[] = [
    { key: "ultimas", label: t("newsPage.filter.latest"), test: () => true },
    {
      key: "relevantes",
      label: t("newsPage.filter.relevant"),
      score: (a) =>
        (text(a).match(/bitcoin|btc|ethereum|\beth\b|regula|sec|etf|fed|fomc|cpi|inflation|binance|coinbase/g) ?? []).length,
    },
    { key: "bitcoin", label: t("newsPage.filter.bitcoin"), test: (a) => /bitcoin|btc/.test(text(a)) },
    { key: "ethereum", label: t("newsPage.filter.ethereum"), test: (a) => /ethereum|\beth\b/.test(text(a)) },
    {
      key: "altcoins",
      label: t("newsPage.filter.altcoins"),
      test: (a) =>
        !/bitcoin|btc/.test(text(a)) &&
        !/ethereum|\beth\b/.test(text(a)) &&
        /altcoin|litecoin|cardano|solana|avalanche|polkadot|chainlink|uniswap|aave|xrp|ripple|dot|link|ada|sol\b/i.test(text(a)),
    },
    { key: "memecoins", label: t("newsPage.filter.memecoins"), test: (a) => /dogecoin|doge|shiba|\bshib\b|pepe|bonk|floki|memecoin|wif\b/i.test(text(a)) },
    { key: "defi", label: t("newsPage.filter.defi"), test: (a) => /defi|decentralized|uniswap|aave|compound|yield|liquidity/i.test(text(a)) },
    { key: "regulacao", label: t("newsPage.filter.regulation"), test: (a) => /regulat|sec|cftc|lawsuit|\bban\b|legislation|senate|congress|comiss[aã]o/i.test(text(a)) },
    { key: "etf", label: t("newsPage.filter.etf"), test: (a) => /\betf\b|exchange-traded/i.test(text(a)) },
    { key: "macro", label: t("newsPage.filter.macro"), test: (a) => /\bfed\b|fomc|inflation|\bcpi\b|\bppi\b|interest rate|central bank|recession|treasury|economy/i.test(text(a)) },
    { key: "exchanges", label: t("newsPage.filter.exchanges"), test: (a) => /binance|coinbase|kraken|bybit|okx|exchange/i.test(text(a)) },
    { key: "blockchain", label: t("newsPage.filter.blockchain"), test: (a) => /blockchain|mainnet|layer[- ]?2|protocol|upgrade|fork|smart contract|testnet/i.test(text(a)) },
    { key: "seguranca", label: t("newsPage.filter.security"), test: (a) => /hack|breach|exploit|security|phishing|theft|stolen|vulnerab/i.test(text(a)) },
  ];

  const [active, setActive] = useState("ultimas");
  const { data, isError, dataUpdatedAt } = useNews();

  const filtered = useMemo(() => {
    const articles = data ?? [];
    const filter = filters.find((f) => f.key === active) ?? filters[0];
    let list = articles.filter((a) => (filter.test ? filter.test(a) : true));
    if (filter.score) {
      list = [...list].sort((a, b) => filter.score!(b) - filter.score!(a));
    }
    return list;
  }, [data, active, filters]);

  const activeLabel = filters.find((f) => f.key === active)?.label ?? "";

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("newsPage.pageTitle")}
        subtitle={t("newsPage.subtitle")}
      />

      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActive(f.key)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              active === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-card-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isError ? (
        <ErrorState
          message={t("newsPage.error")}
          lastUpdated={dataUpdatedAt ? formatClock(dataUpdatedAt / 1000) : undefined}
        />
      ) : (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Newspaper className="h-4 w-4" />
          {t("newsPage.count", { count: filtered.length, label: activeLabel })}
        </div>
      )}

      {/* Slot de anúncio reservado (entre notícias) */}
      <div data-ad-slot="news-mid" className="hidden" />

      <NewsList articles={filtered} showSummaries />
    </div>
  );
}
