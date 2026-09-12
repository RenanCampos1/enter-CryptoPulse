// Camada de acesso à API pública da CoinGecko (sem chave, sem env vars).
// Para trocar de provider no futuro, substitua as funções deste arquivo.

import { supabase } from "@/integrations/supabase/client";
import type {
  ChartPeriod,
  ChartPoint,
  CoinDetail,
  GlobalData,
  MarketCoin,
  SearchResult,
  TrendingResult,
} from "./types";

const BASE = "https://api.coingecko.com/api/v3";

async function get<T>(path: string, params: Record<string, string | number | boolean | undefined> = {}): Promise<T> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  }
  const url = `${BASE}${path}${qs.toString() ? `?${qs.toString()}` : ""}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`API error ${res.status}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Dados globais via função de backend (market-global) com cache compartilhado,
 * para evitar rate-limit da CoinGecko e reduzir chamadas com tráfego alto.
 */
export async function getGlobalData(): Promise<GlobalData> {
  const { data, error } = await supabase.functions.invoke("market-global", {
    body: {},
    headers: { "Content-Type": "application/json" },
  });
  if (error) {
    throw new Error(error.message ?? "Global API error");
  }
  return data as GlobalData;
}

export interface MarketsParams {
  vsCurrency?: string;
  perPage?: number;
  page?: number;
  order?: string;
  sparkline?: boolean;
  priceChangePerc?: string;
  category?: string;
  ids?: string;
}

export function getMarkets(params: MarketsParams = {}): Promise<MarketCoin[]> {
  return get<MarketCoin[]>("/coins/markets", {
    vs_currency: params.vsCurrency ?? "usd",
    order: params.order ?? "market_cap_desc",
    per_page: params.perPage ?? 100,
    page: params.page ?? 1,
    sparkline: params.sparkline ?? true,
    price_change_percentage: params.priceChangePerc ?? "1h,24h,7d,30d",
    category: params.category,
    ids: params.ids,
  });
}

export function getCoinDetail(id: string): Promise<CoinDetail> {
  return get<CoinDetail>(`/coins/${id}`, {
    localization: "false",
    tickers: "false",
    market_data: "true",
    community_data: "true",
    developer_data: "false",
  });
}

const PERIOD_DAYS: Record<ChartPeriod, string> = {
  "1H": "1",
  "1D": "1",
  "7D": "7",
  "1M": "30",
  "1Y": "365",
  ALL: "max",
};

export async function getMarketChart(id: string, period: ChartPeriod): Promise<ChartPoint[]> {
  const days = PERIOD_DAYS[period];
  const data = await get<{ prices: [number, number][] }>(`/coins/${id}/market_chart`, {
    vs_currency: "usd",
    days,
  });

  let points: ChartPoint[] = (data.prices ?? []).map(([ts, price]) => ({ ts: ts / 1000, price }));

  if (period === "1H") {
    // days=1 retorna granularidade de 5 min; manter apenas a última hora.
    const cutoff = points[points.length - 1]?.ts ?? Date.now() / 1000;
    points = points.filter((p) => p.ts >= cutoff - 3600);
  }

  // Reduz pontos para performance no Recharts (mantém a forma do gráfico).
  const target = period === "1D" ? 140 : 170;
  if (points.length > target) {
    const step = Math.ceil(points.length / target);
    points = points.filter((_, i) => i % step === 0 || i === points.length - 1);
  }
  return points;
}

export function getTrending(): Promise<TrendingResult> {
  return get<TrendingResult>("/search/trending");
}

export function searchCoins(query: string): Promise<SearchResult> {
  return get<SearchResult>("/search", { query, per_page: "8" });
}
