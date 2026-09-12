import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getGlobalData, getMarkets, getCoinDetail, getMarketChart, getTrending, searchCoins } from "./api/coingecko";
import { getFearGreed } from "./api/fear-greed";
import { getNews } from "./api/news";
import type { ChartPeriod, FearGreedValue, MarketCoin, NewsArticle, NewsSummary } from "./api/types";

export const QUERY_KEYS = {
  global: ["market", "global"] as const,
  markets: (perPage: number, category?: string) => ["market", "coins", perPage, category] as const,
  coinMarkets: (ids: string) => ["market", "coins", "ids", ids] as const,
  coinDetail: (id: string) => ["market", "coin", id] as const,
  chart: (id: string, period: ChartPeriod) => ["market", "chart", id, period] as const,
  trending: ["market", "trending"] as const,
  fearGreed: ["market", "fear-greed"] as const,
  news: (categories?: string) => ["news", categories ?? "all"] as const,
  search: (q: string) => ["search", q] as const,
};

export function useGlobalData() {
  return useQuery({
    queryKey: QUERY_KEYS.global,
    queryFn: getGlobalData,
    staleTime: 30_000,
    refetchInterval: 30_000,
    retry: 1,
  });
}

export function useMarkets(perPage = 100, category?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.markets(perPage, category),
    queryFn: () => getMarkets({ perPage, sparkline: true, category }),
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
  });
}

export function useCoinMarkets(ids: string[]) {
  const key = ids.join(",");
  return useQuery({
    queryKey: QUERY_KEYS.coinMarkets(key),
    queryFn: () => getMarkets({ ids: key, perPage: ids.length, sparkline: false }),
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
  });
}

export function useCoinDetail(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.coinDetail(id),
    queryFn: () => getCoinDetail(id),
    staleTime: 60_000,
    retry: 1,
    enabled: !!id,
  });
}

export function useMarketChart(id: string, period: ChartPeriod) {
  return useQuery({
    queryKey: QUERY_KEYS.chart(id, period),
    queryFn: () => getMarketChart(id, period),
    staleTime: 5 * 60_000,
    retry: 1,
    enabled: !!id,
  });
}

export function useTrending() {
  return useQuery({
    queryKey: QUERY_KEYS.trending,
    queryFn: getTrending,
    staleTime: 5 * 60_000,
    refetchInterval: 5 * 60_000,
    retry: 1,
  });
}

export function useFearGreed() {
  return useQuery({
    queryKey: QUERY_KEYS.fearGreed,
    queryFn: () => getFearGreed(31),
    staleTime: 5 * 60_000,
    refetchInterval: 5 * 60_000,
    retry: 1,
  });
}

export function useNews(categories?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.news(categories),
    queryFn: () => getNews("EN", 30, categories),
    staleTime: 5 * 60_000,
    refetchInterval: 5 * 60_000,
    retry: 1,
  });
}

export function useCoinSearch(query: string) {
  return useQuery({
    queryKey: QUERY_KEYS.search(query),
    queryFn: () => searchCoins(query),
    staleTime: 60_000,
    enabled: query.trim().length >= 2,
    retry: 1,
  });
}

export function stripHtml(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent ?? "").replace(/\s+/g, " ").trim();
}

/** Busca/gera resumos de notícias via backend (cache na tabela news_summaries). */
export async function fetchNewsSummaries(articles: NewsArticle[]): Promise<Record<string, NewsSummary>> {
  const items = articles.slice(0, 6).map((a) => ({
    id: a.id,
    title: a.title,
    body: stripHtml(a.body).slice(0, 500),
    source: a.source,
    published_at: a.published_on,
    url: a.url,
  }));
  if (items.length === 0) return {};

  const { data, error } = await supabase.functions.invoke("summarize-news", {
    body: { items },
    headers: { "Content-Type": "application/json" },
  });
  if (error) {
    console.error("fetchNewsSummaries:", error);
    return {};
  }
  const list = (data?.summaries ?? []) as NewsSummary[];
  return Object.fromEntries(list.map((s) => [s.news_id, s]));
}

export function useNewsSummaries(articles: NewsArticle[]) {
  const ids = articles.slice(0, 6).map((a) => a.id).join(",");
  return useQuery({
    queryKey: ["news", "summaries", ids],
    queryFn: () => fetchNewsSummaries(articles),
    staleTime: 10 * 60_000,
    enabled: articles.length > 0,
    retry: 0,
  });
}

export function fearGreedClassification(value: number): {
  label: string;
  tone: "extreme-fear" | "fear" | "neutral" | "greed" | "extreme-greed";
} {
  if (value <= 24) return { label: "Extreme Fear", tone: "extreme-fear" };
  if (value <= 44) return { label: "Fear", tone: "fear" };
  if (value <= 54) return { label: "Neutral", tone: "neutral" };
  if (value <= 75) return { label: "Greed", tone: "greed" };
  return { label: "Extreme Greed", tone: "extreme-greed" };
}

export function fearGreedToneColor(tone: string): string {
  switch (tone) {
    case "extreme-fear":
      return "#EA3943";
    case "fear":
      return "#F7931A";
    case "neutral":
      return "#8B98A8";
    case "greed":
      return "#16C784";
    default:
      return "#16C784";
  }
}

export function useFearGreedLatest(): {
  current?: FearGreedValue;
  previous?: FearGreedValue;
  history: FearGreedValue[];
} {
  const { data } = useFearGreed();
  const history = data?.data ?? [];
  return { current: history[0], previous: history[1], history };
}
