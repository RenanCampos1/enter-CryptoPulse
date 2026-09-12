import { useMemo, useState } from "react";
import { Newspaper } from "lucide-react";
import { useSeo } from "@/lib/seo";
import { useNews } from "@/lib/hooks";
import { NewsList } from "@/components/market/NewsList";
import { PageHeader } from "@/components/market/PageHeader";
import { ErrorState } from "@/components/market/ErrorState";
import { cn } from "@/lib/utils";
import type { NewsArticle } from "@/lib/api/types";

interface NewsFilter {
  key: string;
  label: string;
  score?: (a: NewsArticle) => number;
  test?: (a: NewsArticle) => boolean;
}

const text = (a: NewsArticle) => `${a.title} ${a.categories} ${a.body.slice(0, 400)}`.toLowerCase();

const FILTERS: NewsFilter[] = [
  { key: "ultimas", label: "Últimas notícias", test: () => true },
  {
    key: "relevantes",
    label: "Mais relevantes",
    score: (a) =>
      (text(a).match(/bitcoin|btc|ethereum|\beth\b|regula|sec|etf|fed|fomc|cpi|inflation|binance|coinbase/g) ?? []).length,
  },
  { key: "bitcoin", label: "Bitcoin", test: (a) => /bitcoin|btc/.test(text(a)) },
  { key: "ethereum", label: "Ethereum", test: (a) => /ethereum|\beth\b/.test(text(a)) },
  {
    key: "altcoins",
    label: "Altcoins",
    test: (a) =>
      !/bitcoin|btc/.test(text(a)) &&
      !/ethereum|\beth\b/.test(text(a)) &&
      /altcoin|litecoin|cardano|solana|avalanche|polkadot|chainlink|uniswap|aave|xrp|ripple|dot|link|ada|sol\b/i.test(text(a)),
  },
  { key: "memecoins", label: "Memecoins", test: (a) => /dogecoin|doge|shiba|\bshib\b|pepe|bonk|floki|memecoin|wif\b/i.test(text(a)) },
  { key: "defi", label: "DeFi", test: (a) => /defi|decentralized|uniswap|aave|compound|yield|liquidity/i.test(text(a)) },
  { key: "regulacao", label: "Regulação", test: (a) => /regulat|sec|cftc|lawsuit|\bban\b|legislation|senate|congress|comiss[aã]o/i.test(text(a)) },
  { key: "etf", label: "ETF", test: (a) => /\betf\b|exchange-traded/i.test(text(a)) },
  { key: "macro", label: "Macro", test: (a) => /\bfed\b|fomc|inflation|\bcpi\b|\bppi\b|interest rate|central bank|recession|treasury|economy/i.test(text(a)) },
  { key: "exchanges", label: "Exchanges", test: (a) => /binance|coinbase|kraken|bybit|okx|exchange/i.test(text(a)) },
  { key: "blockchain", label: "Blockchain", test: (a) => /blockchain|mainnet|layer[- ]?2|protocol|upgrade|fork|smart contract|testnet/i.test(text(a)) },
  { key: "seguranca", label: "Segurança", test: (a) => /hack|breach|exploit|security|phishing|theft|stolen|vulnerab/i.test(text(a)) },
];

export default function News() {
  useSeo({
    title: "Crypto News — Notícias do Mercado de Criptomoedas | CryptoPulse",
    description:
      "As principais notícias do mercado cripto: Bitcoin, Ethereum, altcoins, memecoins, regulação, ETFs e macroeconomia.",
    path: "/news",
  });

  const [active, setActive] = useState("ultimas");
  const { data, isError, dataUpdatedAt } = useNews();

  const filtered = useMemo(() => {
    const articles = data ?? [];
    const filter = FILTERS.find((f) => f.key === active) ?? FILTERS[0];
    let list = articles.filter((a) => (filter.test ? filter.test(a) : true));
    if (filter.score) {
      list = [...list].sort((a, b) => filter.score!(b) - filter.score!(a));
    }
    return list;
  }, [data, active]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Crypto News"
        subtitle="As notícias que movem o mercado de criptomoedas, com resumos gerados por IA."
      />

      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {FILTERS.map((f) => (
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
          message="Notícias temporariamente indisponíveis."
          lastUpdated={dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString("pt-BR") : undefined}
        />
      ) : (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Newspaper className="h-4 w-4" />
          {filtered.length} notícia(s) em "{FILTERS.find((f) => f.key === active)?.label}"
        </div>
      )}

      {/* Slot de anúncio reservado (entre notícias) */}
      <div data-ad-slot="news-mid" className="hidden" />

      <NewsList articles={filtered} showSummaries />
    </div>
  );
}
