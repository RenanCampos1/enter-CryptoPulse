// Fear & Greed Index — API pública do alternative.me (sem chave).
import type { FearGreedResponse } from "./types";

const BASE = "https://api.alternative.me/fng/";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`Fear&Greed API error ${res.status}`);
  return (await res.json()) as T;
}

export function getFearGreed(limit = 31): Promise<FearGreedResponse> {
  return get<FearGreedResponse>(`?limit=${limit}&format=json`);
}
