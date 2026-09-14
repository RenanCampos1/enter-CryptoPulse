# Fill analytics tracking gaps

## Context

Enter Analytics is enabled and the site is already instrumented: the SDK (`@enter-pro/analytics-sdk@^0.0.10`) is installed, `bootstrapGeneratedSiteAnalytics()` runs once in `src/main.tsx`, and 7 custom events (`coin_click`, `news_click`, `coin_search`, `market_share`, `card_download`, `post_generator_share`, `post_generator_download`) are registered and wired via helpers in `src/lib/analytics.ts`. Data is flowing (383 events in the last 7 days; `coin_search` / `post_generator_*` at 0 events is consistent with low traffic, not a wiring bug — the site domain was just switched to cryptopulse.xyz).

The audit found 4 meaningful user interactions that are **not tracked**. This plan adds them: event registration (backend) → helper functions → instrumentation → verification.

## Audit summary

| interaction | location | currently tracked? |
|---|---|---|
| Coin click (all sections) | `MarketTicker`, `CryptoTable`, `TrendingSection`, `RankingTable`, `BitcoinCard`, `MarketHeatmap`, `Memecoins` | yes — `coin_click` |
| News article click | `NewsList` | yes — `news_click` |
| Coin search select | `CoinSearch`, `PostGenerator` | yes — `coin_search` |
| Share/download cards | `MarketShareCard`, `CoinShareCard`, `ShareCard` | yes — `market_share`, `card_download` |
| Post generator share/download | `PostGenerator` | yes — `post_generator_share/download` |
| **Language switch** | `src/components/language-switcher.tsx` | **no** |
| **News category filter** | `src/pages/News.tsx` | **no** |
| **Chart time-range period** | `src/components/market/PriceChart.tsx` | **no** |
| **Post template switch** | `src/pages/PostGenerator.tsx` | **no** |

## Changes

### 1. Register 4 new events (backend registry, `register_analytics_event`)

| event_name | event_type | description |
|---|---|---|
| `language_changed` | custom | User switched the site language (pt-BR / en) |
| `news_filter_clicked` | custom | User selected a news category filter |
| `chart_period_selected` | custom | User changed the price chart time range (1H/1D/7D/1M/1Y/ALL) |
| `post_generator_template_selected` | custom | User switched the post template (classic/hero/signal) |

Registration is idempotent (409 = already exists = OK). Do not proceed to instrument any event whose registration failed.

### 2. Add helpers — `src/lib/analytics.ts`

Reuse the existing `trackEvent` import. Add:

- `trackLanguageChanged(language: string)` → `language_changed`, property `{ language }`
- `trackNewsFilter(filter: string)` → `news_filter_clicked`, property `{ filter }`
- `trackChartPeriod(coinId: string, period: string)` → `chart_period_selected`, properties `{ coin_id, period }`
- `trackPostGeneratorTemplate(template: string)` → `post_generator_template_selected`, property `{ template }`

All `eventType: "custom"`. Keys are snake_case, no PII/banned keys.

### 3. Instrument the call sites

- `src/components/language-switcher.tsx` — call `trackLanguageChanged(language)` inside `onValueChange`, before `i18n.changeLanguage`.
- `src/pages/News.tsx` — in the filter button `onClick={() => setActive(f.key)}`, also call `trackNewsFilter(f.key)`.
- `src/components/market/PriceChart.tsx` — in the period button `onClick={() => setPeriod(p)}`, also call `trackChartPeriod(coinId, p)`.
- `src/pages/PostGenerator.tsx` — in the template button `onClick={() => setTemplate(tpl.key)}`, also call `trackPostGeneratorTemplate(tpl.key)`.

## Files to modify

- `src/lib/analytics.ts` (helpers)
- `src/components/language-switcher.tsx`
- `src/pages/News.tsx`
- `src/components/market/PriceChart.tsx`
- `src/pages/PostGenerator.tsx`

## Implementation checklist

- [ ] `language_changed`, `news_filter_clicked`, `chart_period_selected`, `post_generator_template_selected` are registered in the event registry (200/409 each) and visible via `list_analytics_events`.
- [ ] `src/lib/analytics.ts` exports the 4 new helper functions using `trackEvent` with `eventType: "custom"` and the property sets above.
- [ ] `language-switcher.tsx` emits `language_changed` on every language switch (both desktop and mobile instances use the same component).
- [ ] `News.tsx` emits `news_filter_clicked` with the filter key (e.g. `bitcoin`, `ultimas`) when a filter tab is clicked.
- [ ] `PriceChart.tsx` emits `chart_period_selected` with `coin_id` and `period` (e.g. `1D`) when a range button is clicked.
- [ ] `PostGenerator.tsx` emits `post_generator_template_selected` with the template key when a template tab is clicked.

## Verification checklist

- [ ] `pnpm lint` passes with no new errors.
- [ ] `pnpm exec tsc --noEmit` passes.
- [ ] `list_analytics_events` shows all 4 new events registered with type `custom`.
- [ ] No banned property keys (`password`, `token`, `email`, `auth`, `phone`, raw form values) introduced anywhere.
- [ ] No hand-written `fetch`/`sendBeacon` to analytics endpoints added; all emission goes through the SDK.
- [ ] In the preview: switching language, clicking a news filter, changing the chart period, and switching a post template produce no console SDK errors (`get_console_logs`), and `getAnalyticsHealth()` returns `initialized: true`.
- [ ] After a user performs at least one of the new actions, `query_analytics` on that event name returns a count ≥ 1 (allow for SDK batch flush latency).
