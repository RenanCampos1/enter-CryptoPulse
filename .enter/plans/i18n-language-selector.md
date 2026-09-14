# Seletor de idioma + tradução completa do site (CryptoPulse)

## Context

O usuário vai divulgar o site em fóruns fora do Brasil e precisa de um **seletor de idioma** funcional.

Estado atual: a infraestrutura i18n do template (`i18n.config.json`, `public/locales/*.json`, `src/i18n/*`, `src/components/language-switcher.tsx`) existe, mas **nunca foi adotada**:

- `en.json` / `zh-CN.json` contêm apenas placeholders de template ("Welcome to your blank app").
- Nenhum componente chama `useTranslation()` — **todo** o texto do site está fixo em português espalhado por ~36 arquivos (páginas, cards, rodapé, SEO, `format.ts`, `events.ts`, textos de compartilhamento).
- O componente `LanguageSwitcher` existe mas não está montado em lugar nenhum.

Decisões confirmadas com o usuário:
- Idiomas do seletor: **en + pt-BR** (apenas inglês adicionado; chinês retirado — pode ser readicionado depois pelo painel i18n).
- Idioma padrão/fallback: **en** (visitantes internacionais com navegador fora da lista veem inglês).
- Alcance: **todo o site**.

## Abordagem

1. **Configurar idiomas**: `i18n.config.json` passa a ter `en` (fallback) e `pt-BR`; remover `zh-CN` e apagar `public/locales/zh-CN.json`.
2. **Autorar os arquivos de idioma** com chaves planas pontilhadas (`"home.hero.title"`):
   - `en.json` = fonte estrutural (fallback) com todas as chaves em inglês.
   - `pt-BR.json` = espelho com o conteúdo atual em português.
   - Nenhuma chave duplicada entre arquivos; `{{var}}` para interpolação.
3. **Envolver todos os textos visíveis** com `const { t } = useTranslation()` + `t("chave")` (literais estáticos, nunca chaves dinâmicas).
4. **Montar o `LanguageSwitcher`** no `Header` (desktop e menu mobile).
5. **Refatorar utilitários sensíveis a idioma**: `format.ts` (números/datas/time-ago) e `seo.ts` (títulos/descrições) passam a usar o idioma ativo.
6. **Validar** com os scripts do template (`check-i18n.mjs`, `scan-i18n.mjs`), lint, build e screenshots.

## Arquivos a alterar

**Configuração e idiomas**
- `i18n.config.json` — idiomas `en` + `pt-BR`, fallback `en`.
- `public/locales/en.json` — reescrito com o conjunto completo de chaves (fonte estrutural).
- `public/locales/pt-BR.json` — novo, espelho com o texto atual em português.
- `public/locales/zh-CN.json` — **deletar** (idioma retirado).

**Layout e infraestrutura**
- `src/components/layout/Header.tsx` — nav, aria-labels, drawer mobile + **montar `LanguageSwitcher`**.
- `src/components/layout/Footer.tsx` — seções, descrição, aviso legal, copyright.
- `src/components/RouteErrorPage.tsx`, `src/pages/NotFound.tsx`, `src/App.tsx`.

**Componentes de mercado**
- `src/components/market/`: `ErrorState`, `NewsList`, `MarketAlerts`, `MarketBias`, `OverviewCards`, `BitcoinCard`, `CryptoTable`, `RankingTable`, `TrendingSection`, `FearGreedGauge`, `MarketHeatmap`, `PageHeader`, `CoinSearch`, `MarketTicker` (verificar), `PriceChart`/`Sparkline` (apenas se houver texto visível).

**Compartilhamento**
- `src/components/share/ShareCard.tsx` (botões "Baixar imagem"/"Compartilhar", aviso de rodapé).
- `src/components/share/MarketShareCard.tsx` e `CoinShareCard.tsx` (labels, `dialogTitle`, `dialogDescription`, `shareText`, datas).

**Páginas**
- `src/pages/`: `Home`, `Market`, `Memecoins`, `Gainers`, `Losers`, `Trending`, `News`, `FearGreed`, `Calendar`, `CryptoDetail`, `PostGenerator`.

**Libs e dados**
- `src/lib/format.ts` — formatters `Intl` recriados conforme o idioma ativo; `timeAgo` via `t()` com interpolação.
- `src/lib/seo.ts` — `useTranslation()` no hook `useSeo`; `i18n.t()` dentro de `coinSeoTitle`/`siteTagline` (helpers puros).
- `src/data/events.ts` — eventos passam a guardar **chaves de tradução** (`titleKey`/`descriptionKey`/categoria/importância) em vez de texto fixo; `Calendar.tsx` traduz via `t()`.

**Reutilizar (já existem):**
- `src/components/language-switcher.tsx` (pronto, basta montar).
- `src/i18n/config.ts` / `util.ts` (já fazem bundle dos locales, detecção por cookie/navegador, sync de `lang`/`dir` e normalização — **não alterar**).
- Convenções obrigatórias: chaves planas, uma única namespace, `t()` sem argumento de namespace.

## Pontos de atenção

- **`format.ts`**: formatters `Intl` são criados em módulo com `"pt-BR"` fixo. Recriar sob demanda pelo idioma ativo (`i18n.resolvedLanguage`) para que preços/percentuais/datas usem vírgula ou ponto conforme o idioma. `timeAgo` ("agora", "X min atrás") vira chave com `{{n}}`.
- **`seo.ts`**: `coinSeoTitle` é função pura — usar `i18n.t("seo.coinTitle", { name, symbol, site })` chamado em tempo de execução (exceção sancionada ao "não usar t() fora de componente").
- **`events.ts`**: `EVENT_CATEGORY_LABELS` e `importance` ("alta/media/baixa") viram chaves `events.*`.
- **Chaves dinâmicas proibidas**: arrays de nav (`NAV_ITEMS`, `LINKS`) montados com `label` fixo devem passar a usar `t()` com chaves literais dentro do componente.
- **Marca**: "CryptoPulse", "CryptoPulse.com", símbolos de moeda e termos internacionais de uso comum (Fear & Greed, Market Cap, BTC Dominance) permanecem como estão.
- **Share**: `dialogTitle`, `shareText` e textos dos cards compartilháveis são traduzidos — o PNG capturado renderiza o idioma ativo.

## Implementation checklist

- [ ] Atualizar `i18n.config.json` para `en` (fallback) + `pt-BR`, removendo `zh-CN`.
- [ ] Deletar `public/locales/zh-CN.json`.
- [ ] Reescrever `public/locales/en.json` com todas as chaves (fonte estrutural) usando prefixos `nav.*`, `footer.*`, `home.*`, `market.*`, `share.*`, `format.*`, `seo.*`, `events.*`, etc.
- [ ] Criar `public/locales/pt-BR.json` com o mesmo conjunto de chaves e o conteúdo atual em português.
- [ ] Montar `LanguageSwitcher` no `Header` (ações desktop e drawer mobile).
- [ ] Converter `Header`, `Footer`, `RouteErrorPage`, `NotFound`, `App.tsx` para `t()`.
- [ ] Converter `Home.tsx` e todos os componentes `src/components/market/*` com texto visível.
- [ ] Converter os 3 componentes de compartilhamento (botões, `dialogTitle`, `shareText`, datas).
- [ ] Converter as páginas `Market`, `Memecoins`, `Gainers`, `Losers`, `Trending`, `News`, `FearGreed`, `CryptoDetail`, `PostGenerator`.
- [ ] Refatorar `format.ts` para formatters sensíveis ao idioma ativo e `timeAgo` via `t("format.*", { n })`.
- [ ] Refatorar `seo.ts` para títulos/tagline traduzidos no idioma ativo.
- [ ] Refatorar `data/events.ts` para guardar chaves `events.*`; traduzir em `Calendar.tsx` (incl. categorias e importância).
- [ ] Nenhuma string em português fixa visível remanescente (grep final de acentos/palavras-chave em `src`).
- [ ] Executar `check-i18n.mjs` até passar (paridade de chaves en ⇄ pt-BR).

## Verification checklist

- [ ] `node /workspace/.agents/skills/enter_i18n/assets/scripts/check-i18n.mjs` imprime "i18n check passed".
- [ ] `node /workspace/.agents/skills/enter_i18n/assets/scripts/scan-i18n.mjs` (último comando shell da implementação) grava `reports/i18n/summary.json` sem chaves órfãs nas duas localidades.
- [ ] `pnpm run lint` e `pnpm run build` sem erros.
- [ ] Alternando o seletor para en / pt-BR, todas as rotas principais (`/`, `/market`, `/news`, `/trending`, `/memecoins`, `/fear-greed`, `/calendar`, `/post-generator`) exibem texto traduzido e sem chaves cruas (`nav.market` etc.) visíveis.
- [ ] Preços, percentuais, datas e "tempo atrás" usam formato do idioma ativo (ex.: `1.234,56` em pt-BR, `1,234.56` em en).
- [ ] Cards de compartilhamento e textos de SEO/título da página acompanham o idioma ativo.
- [ ] Capturas de tela: home em desktop_1280 e mobile_390 nos dois idiomas; console sem erros (logs via `get_console_logs`).
- [ ] Escopo de build validado: `pnpm run build` sobre o snapshot final.
