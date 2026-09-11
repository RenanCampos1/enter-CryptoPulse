# CryptoPulse — Plano do MVP

## Contexto

Construir o **CryptoPulse**, um painel público e gratuito de acompanhamento do mercado de criptomoedas (preços, rankings, gráficos, notícias, Fear & Greed, heatmap, compartilhamento viral). Sem cadastro, sem paywall, 100% gratuito. Prioridades: **velocidade + dados reais + design + SEO + compartilhamento/viralização**.

Decisões confirmadas pelo usuário:
- **Resumos de notícias com IA**: ativar agora → requer Enter Cloud + capacidade de IA.
- **Analytics**: ativar agora (Enter Analytics) para page views e eventos (cliques, compartilhamentos, downloads, buscas).

Base atual: template Vite + React 19 + TS + Tailwind v3 + shadcn, React Router v7 (routes em `src/router.tsx`), React Query, Recharts, lucide-react, framer-motion, SDK de analytics já instalado. Tema dark será fixo (sem toggle).

## Dados (APIs reais, gratuitas, sem chave — sem env vars)

| Fonte | Uso | Endpoints |
|---|---|---|
| **CoinGecko** (pública) | preços, mercado, gráficos, trending, busca | `/global`, `/coins/markets` (com `sparkline=true`), `/coins/{id}`, `/coins/{id}/market_chart`, `/search/trending`, `/search`, `/coins/categories`, `/coins/markets?category=memes` |
| **alternative.me** | Fear & Greed | `/fng/?limit=30` |
| **CryptoCompare** | notícias | `/data/v2/news/?lang=EN` (filtro por ticker p/ notícias relacionadas da moeda) |

- Cache via React Query: `staleTime`/`refetchInterval` conservadores (mercados 60s, global 30s, F&G 5min, notícias 5min, detalhe/gráfico 5min) para respeitar o rate-limit da CoinGecko e atualizar só componentes específicos.
- Camada de API isolada em `src/lib/api/` para permitir trocar o provider futuramente.
- Preços sempre em USD. Site todo em **pt-BR** (strings diretas; i18n existente fica intacto, sem uso no MVP).

## Paleta (tokens HSL em `index.css`, dark fixo via `class="dark"` no `<html>`)

`#080B10` fundo, `#11161D` cards, `#171D25` cards secundários, `#F5F7FA` texto, `#8B98A8` texto secundário, verde `#16C784`, vermelho `#EA3943`, laranja `#F7931A`, azul `#3861FB`. Tokens novos: `success`, `danger`, `accent` (laranja), `up`/`down` para variações, gradiente/sombras, fontes **Space Grotesk** (títulos) + **Inter** (UI) + **JetBrains Mono** (números/tickers) via Google Fonts no `index.html`.

## Arquitetura de arquivos

```
src/
  lib/
    api/coingecko.ts, fear-greed.ts, news.ts, types.ts   # camada de API substituível
    hooks/useGlobalData.ts, useMarkets.ts, useCoinDetail.ts,
      useMarketChart.ts, useTrending.ts, useFearGreed.ts, useNews.ts, useCoinSearch.ts
    format.ts        # moeda, %, números compactos, timestamp
    seo.ts           # hook useSeo (title, description, OG, canonical)
  components/
    layout/ Layout.tsx, Header.tsx, Footer.tsx, MarketTicker.tsx, MobileNav.tsx
    market/ OverviewCards.tsx, BitcoinCard.tsx, GainersTable.tsx, LosersTable.tsx,
      TrendingSection.tsx, CryptoTable.tsx, FearGreedGauge.tsx, MarketHeatmap.tsx,
      PriceChart.tsx, Sparkline.tsx (SVG puro), MarketBias.tsx, MarketAlerts.tsx,
      CoinSearch.tsx, ErrorState.tsx, SkeletonRow.tsx
    share/ ShareMarketCard.tsx, ShareCoinCard.tsx, PostGenerator.tsx
  pages/ Home.tsx, Market.tsx, Gainers.tsx, Losers.tsx, Trending.tsx,
    Memecoins.tsx, News.tsx, FearGreed.tsx, Calendar.tsx, CryptoDetail.tsx,
    PostGeneratorPage.tsx
  data/events.ts     # calendário curado (eventos macro oficiais)
```

Rotas em `src/router.tsx` (estrutura com `Layout` + `Outlet`): `/`, `/market`, `/gainers`, `/losers`, `/trending`, `/memecoins`, `/news`, `/fear-greed`, `/calendar`, `/crypto/:id`, `/post-generator`, `*`. Manter `window.__routers__`.

## Backend + IA + Analytics (passos de habilitação)

1. `supabase_enable` (Enter Cloud) → carregar skill `enter_cloud` antes de código SQL/função.
2. `enable_ai_capability` → carregar skill `enter_llm_integration` e seguir o fluxo de seleção de modelo.
3. `enable_analytics` → carregar skill `enter_analytics` e registrar eventos: `page_view` (auto), `coin_click`, `news_click`, `market_share`, `card_download`, `coin_search`, `post_generator_share`.

**Resumos de notícias (IA)**:
- Tabela `news_summaries` (id_noticia, titulo, resumo, impacto: positivo/neutro/negativo, created_at).
- Função de backend `summarize-news`: recebe lote de notícias, gera via LLM o resumo "O que aconteceu? / Impacto no mercado", grava na tabela (cache) e retorna. Frontend mostra manchete imediatamente e o resumo assíncrono com skeleton.
- Sempre acompanhado do aviso: conteúdo informativo, não é recomendação financeira.

## Funcionalidades do MVP (seção 37 + núcleo do restante)

1. **Header fixo**: logo CryptoPulse, menu (Mercado, Notícias, Trending, Memecoins, Fear & Greed, Calendário), busca com debounce, botão "Compartilhar mercado", nav mobile.
2. **Ticker** animado: BTC/ETH/BNB/SOL/XRP/DOGE/ADA/AVAX/LINK com preço + variação 24h (verde/vermelho).
3. **Home**: hero ("O mercado cripto em um só lugar."), cards globais (Market Cap, Volume 24h, Dominância BTC/ETH, F&G, nº de moedas), card grande de Bitcoin (preço, 1h/24h/7d, Market Cap, Volume, ATH, gráfico com períodos 1H/1D/7D/1M/1Y/ALL, "Compartilhar BTC"), Top Gainers, Top Losers, Trending, Fear & Greed (gauge), Heatmap, Notícias, Market Bias, Market Alerts, disclaimer.
4. **Páginas**: `/market` (tabela completa com filtros Todas/Top10/50/100/DeFi/Memecoins/AI/Gaming/L1/L2/RWA + favoritos em localStorage), `/gainers`, `/losers`, `/trending`, `/memecoins` (filtros: Top Market Cap / Maiores altas / Maior volume / Trending), `/news` (categorias), `/fear-greed` (gauge + histórico + explicação), `/calendar`, `/post-generator`.
5. **Página da moeda** `/crypto/:id` (ex.: bitcoin, ethereum, solana, xrp, dogecoin, shiba-inu): preço, variações, Market Cap, Volume, Supply, ATH/ATL, gráfico, notícias relacionadas (filtro por ticker na CryptoCompare), moedas similares, SEO dinâmico ("Bitcoin Hoje: Cotação, Preço, Gráfico e Notícias | CryptoPulse"), botão "Compartilhar".
6. **Compartilhamento**: `ShareMarketCard` (CryptoPulse, data/hora, BTC, ETH, Market Cap, F&G, top gainer, top loser, dominância, URL) nos formatos 1:1, 9:16, 16:9; `ShareCoinCard` ("Bitcoin agora"); botões "Baixar imagem" (html2canvas → PNG) e "Compartilhar" (Web Share API + fallback de link). Mesmos cards para "Compartilhar ranking" e "Compartilhar Fear & Greed".
7. **Post Generator**: escolhe moeda (busca) + template visual → arte com nome, preço, variação, Market Cap, Volume, gráfico, data e CryptoPulse → baixar/compartilhar.
8. **Market Bias**: score 0–100 de fatores objetivos exibidos (tendência BTC 7d, volume, volatilidade, breadth de mercado, F&G, dominância) → BULLISH/NEUTRAL/BEARISH, sempre como indicador informativo.
9. **Market Alerts**: regras sobre dados reais (ex.: "BTC subiu mais de 5% nas últimas 24h", alta de volume, memecoins em alta) — nada inventado.
10. **Erros**: componente "Dados temporariamente indisponíveis." + "Última atualização: HH:MM:SS", sem preços falsos, skeletons.
11. **SEO**: `useSeo` em todas as rotas (title, meta description, OG, canonical), `public/sitemap.xml` (rotas principais + moedas conhecidas), `robots.txt` atualizado, meta OG no `index.html`.
12. **PWA**: `public/manifest.webmanifest` + ícone SVG + meta de tema + service worker minimalista (preparação p/ "Adicionar à tela inicial").
13. **Ad slots**: contêineres ocultos preparados (topo, entre conteúdos, sidebar, entre notícias, rodapé) — sem código de anúncio.
14. **Calendário**: dataset curado em `src/data/events.ts` com eventos macro reais e oficiais (FOMC 2026 etc., datas conferidas via pesquisa web) + categorias/importância.
15. **Limpeza do template**: substituir `Index.tsx`, `NotFound.tsx`, metas do `index.html` (título/descrição/OG), favicon CryptoPulse.

Dependência nova: `html2canvas` (geração das imagens de compartilhamento). Gráficos com Recharts existente; sparklines em SVG puro (sem custo por moeda).

## Implementation checklist

- [ ] Ativar Enter Cloud (`supabase_enable`) e carregar skill `enter_cloud`.
- [ ] Ativar capacidade de IA (`enable_ai_capability`) e carregar skill `enter_llm_integration`; definir modelo.
- [ ] Ativar Enter Analytics (`enable_analytics`) e carregar skill `enter_analytics`; registrar eventos definidos.
- [ ] Criar tabela `news_summaries` + função de backend `summarize-news` (cache por notícia, impacto positivo/neutro/negativo).
- [ ] `index.css` + `tailwind.config.ts`: paleta CryptoPulse em tokens HSL (success/danger/accent/up/down), fontes, gradientes, animações.
- [ ] `index.html`: título/descrição/OG CryptoPulse, fonts, `class="dark"`, meta PWA.
- [ ] `src/lib/api/`: `types.ts`, `coingecko.ts`, `fear-greed.ts`, `news.ts` (todas as chamadas) + `format.ts`.
- [ ] Hooks React Query em `src/lib/hooks/` (global, markets, coin detail, market chart, trending, F&G, news, search com debounce).
- [ ] `Layout` + `Header` + `Footer` (disclaimer) + `MarketTicker` + `MobileNav`; rotas em `router.tsx` com `Outlet`.
- [ ] `useSeo` e aplicação em todas as páginas + `sitemap.xml` + `robots.txt`.
- [ ] Home completa (hero, overview, card BTC com gráfico/períodos, gainers, losers, trending, F&G, heatmap, notícias, bias, alerts).
- [ ] `PriceChart` (períodos 1H/1D/7D/1M/1Y/ALL) e `Sparkline` SVG.
- [ ] `FearGreedGauge` (faixas Extreme Fear…Extreme Greed, valor, variação, histórico).
- [ ] `MarketHeatmap` (treemap por Market Cap, cor por 24h, clique navega para a moeda).
- [ ] `CryptoTable` com filtros de categorias + favoritos (localStorage) para `/market`.
- [ ] Páginas `/gainers`, `/losers`, `/trending` (indicador Trending) e `/memecoins` (filtros).
- [ ] Página `/news` com categorias + resumos IA com fallback para manchete/frase inicial.
- [ ] Página `/crypto/:id` completa (dados, gráfico, notícias relacionadas, similares, SEO, compartilhar).
- [ ] Página `/fear-greed` e `/calendar` (dataset curado de eventos).
- [ ] Compartilhamento: `ShareMarketCard` (1:1/9:16/16:9), `ShareCoinCard`, download PNG (html2canvas), Web Share API + fallback, botões de compartilhar nas seções.
- [ ] `PostGenerator` com templates e download/compartilhamento.
- [ ] `MarketBias` (score + fatores) e `MarketAlerts` (regras em dados reais).
- [ ] `ErrorState` ("Dados temporariamente indisponíveis." + última atualização) e skeletons.
- [ ] PWA: `manifest.webmanifest`, ícone SVG, meta, service worker.
- [ ] Ad slots preparados (ocultos) + integração de eventos de analytics nos cliques/compartilhamentos/buscas.
- [ ] Limpeza: remover tela de template do `Index`, ajustar `NotFound` ao tema dark.

## Verification checklist

- [ ] `pnpm lint` e `pnpm build` sem erros.
- [ ] Home carrega com dados reais: ticker, hero, cards globais, card BTC, gainers, losers, trending, F&G, heatmap, notícias — sem erros no console.
- [ ] Rate-limit: conferir via network que não há chamadas em excesso à CoinGecko (staleTime ativo, poucos refetch).
- [ ] Erros de API: derrubar uma chamada → aparece "Dados temporariamente indisponíveis." com timestamp, sem valores falsos.
- [ ] Busca com debounce filtra e navega para `/crypto/{id}`.
- [ ] `/crypto/bitcoin`: dados completos, gráfico com períodos, notícias relacionadas, `<title>` de SEO correto.
- [ ] Compartilhar mercado gera imagem nos 3 formatos e baixa PNG; Web Share API ou fallback funciona.
- [ ] `/news`: resumos IA com "O que aconteceu?" e impacto, com aviso informativo.
- [ ] Favoritos persistem após reload.
- [ ] Responsivo: screenshots em `mobile_390` e `desktop_1280` nas rotas principais (Home, `/market`, `/crypto/bitcoin`, `/news`).
- [ ] PWA: `manifest.webmanifest` servido e ícone presente.
- [ ] Analytics: eventos de compartilhamento/download/clique registrados.
