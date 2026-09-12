// Tipos compartilhados da camada de API. A camada é isolada em src/lib/api
// para permitir trocar o provider de dados futuramente.

export interface GlobalData {
  total_market_cap: Record<string, number>;
  total_volume: Record<string, number>;
  market_cap_percentage: Record<string, number>;
  market_cap_change_percentage_24h_usd: number;
  active_cryptocurrencies: number;
  updated_at: number;
}

export interface MarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_30d_in_currency?: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  sparkline_in_7d?: { price: number[] };
  last_updated: string;
}

export interface CoinLink {
  homepage: string[];
  blockchain_site: string[];
  official_forum_url: string[];
  chat_url: string[];
  announcement_url: string[];
}

export interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  image: { thumb: string; small: string; large: string };
  description: Record<string, string>;
  categories: string[];
  links: CoinLink;
  market_data: {
    current_price: Record<string, number>;
    market_cap: Record<string, number>;
    market_cap_rank: number;
    total_volume: Record<string, number>;
    high_24h: Record<string, number>;
    low_24h: Record<string, number>;
    price_change_percentage_1h_in_currency: Record<string, number>;
    price_change_percentage_24h_in_currency: Record<string, number>;
    price_change_percentage_7d_in_currency: Record<string, number>;
    price_change_percentage_30d_in_currency: Record<string, number>;
    price_change_percentage_1y_in_currency: Record<string, number>;
    market_cap_change_percentage_24h: number;
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
    ath: Record<string, number>;
    ath_change_percentage: Record<string, number>;
    ath_date: Record<string, string>;
    atl: Record<string, number>;
    atl_change_percentage: Record<string, number>;
    atl_date: Record<string, string>;
    total_value_locked: number | null;
  };
  community_data?: {
    twitter_followers: number;
    reddit_average_posts_48h: number;
  };
}

export interface ChartPoint {
  ts: number;
  price: number;
}

export interface TrendingCoinItem {
  id: string;
  coin_id: number;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  small: string;
  large: string;
  score: number;
  data: {
    price: number;
    price_change_percentage_24h: Record<string, number>;
    market_cap: number;
    total_volume: number;
    sparkline: string;
  };
}

export interface TrendingResult {
  coins: TrendingCoinItem[];
}

export interface SearchCoin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number | null;
  thumb: string;
  large: string;
}

export interface SearchResult {
  coins: SearchCoin[];
}

export interface FearGreedValue {
  value: string;
  value_classification: string;
  timestamp: string;
}

export interface FearGreedResponse {
  name: string;
  data: FearGreedValue[];
  metadata?: Record<string, unknown>;
}

export interface NewsArticle {
  id: string;
  guid: string;
  published_on: number;
  imageurl: string;
  title: string;
  url: string;
  body: string;
  source: string;
  categories: string;
  source_info?: {
    name: string;
    img: string;
  };
}

export interface NewsSummary {
  news_id: string;
  summary: string;
  impact: "positivo" | "neutro" | "negativo";
}

export type ChartPeriod = "1H" | "1D" | "7D" | "1M" | "1Y" | "ALL";
