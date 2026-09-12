// Notícias cripto — API pública do CryptoCompare (sem chave).
import type { NewsArticle } from "./types";

const BASE = "https://min-api.cryptocompare.com/data/v2/news/";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`News API error ${res.status}`);
  return (await res.json()) as T;
}

export function getNews(lang = "EN", count = 30, categories?: string): Promise<NewsArticle[]> {
  const params = new URLSearchParams({ lang, sortOrder: "latest", excludeCategories: "Sponsored" });
  if (categories) params.set("categories", categories);
  return get<{ Data: NewsArticle[] }>(`?${params.toString()}`).then((d) => d.Data ?? []);
}
