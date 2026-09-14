// Helpers de tracking centralizados (eventos registrados no Enter Analytics).
import { trackEvent } from "@enter-pro/analytics-sdk";

export function trackCoinClick(coinId: string, symbol: string, section: string) {
  trackEvent("coin_click", {
    eventType: "custom",
    properties: { coin_id: coinId, symbol: symbol.toUpperCase(), section },
  });
}

export function trackNewsClick(source: string, category: string) {
  trackEvent("news_click", {
    eventType: "custom",
    properties: { source, category: category || "geral" },
  });
}

export function trackMarketShare(format: string) {
  trackEvent("market_share", {
    eventType: "conversion",
    properties: { format },
  });
}

export function trackCardDownload(kind: "market" | "coin" | "post", format: string) {
  trackEvent("card_download", {
    eventType: "conversion",
    properties: { kind, format },
  });
}

export function trackCoinSearch(queryLength: number, resultCount: number) {
  trackEvent("coin_search", {
    eventType: "custom",
    properties: { query_length: queryLength, result_count: resultCount },
  });
}

export function trackPostGenerator(kind: "share" | "download", coinId: string, template: string) {
  const event = kind === "share" ? "post_generator_share" : "post_generator_download";
  trackEvent(event, {
    eventType: "conversion",
    properties: { coin_id: coinId, template },
  });
}

export function trackLanguageChanged(language: string) {
  trackEvent("language_changed", {
    eventType: "custom",
    properties: { language },
  });
}

export function trackNewsFilter(filter: string) {
  trackEvent("news_filter_clicked", {
    eventType: "custom",
    properties: { filter },
  });
}

export function trackChartPeriod(coinId: string, period: string) {
  trackEvent("chart_period_selected", {
    eventType: "custom",
    properties: { coin_id: coinId, period },
  });
}

export function trackPostGeneratorTemplate(template: string) {
  trackEvent("post_generator_template_selected", {
    eventType: "custom",
    properties: { template },
  });
}
