# Plano: Corrigir visualização de page views no Enter Analytics

## Context

O usuário pediu um resumo de como as visualizações de página mudaram no intervalo selecionado e o que está impulsionando a tendência. Ao consultar o Enter Analytics, **todos os queries retornam 0 eventos** (page views, sessões, visitantes, eventos customizados — em janelas de 1, 7 e 30 dias). O usuário pediu para corrigir: "corrigir, preciso ver os dados".

### Diagnóstico feito (evidências)

1. **O SDK está corretamente instrumentado**:
   - `bootstrapGeneratedSiteAnalytics()` é chamado em `src/main.tsx` (linha 13).
   - Eventos customizados (`coin_click`, `news_click`, `market_share`, `card_download`, `coin_search`, `post_generator_share`, `post_generator_download`) são disparados via `src/lib/analytics.ts` em 15+ componentes.
   - As requisições de track estão chegando ao backend: `POST https://api.enter.pro/code/api/v1/track` retorna **HTTP 202** (aceito), com envio ativo entre 01:04 e 01:53 de hoje.

2. **O problema está na rejeição de eventos não registrados**:
   - O SDK (v0.0.10) **auto-emite** os eventos `error` e `performance` em todo carregamento de página (`ErrorCollector` + `PerformanceCollector` são iniciados no bootstrap, conforme o código em `node_modules/@enter-pro/analytics-sdk/dist/index.js`).
   - O README do SDK documenta isso como **gap conhecido**: esses eventos "serão rejeitados com `event not registered`" até serem pré-registrados no registry do projeto.
   - A listagem do registry (`list_analytics_events`) mostra **somente** `page_view`, `session_start`, `session_end` (defaults) e os 7 customizados. **`error` e `performance` NÃO estão registrados**.
   - Como o `performance` é emitido em todo load, as batches de track contêm um evento não registrado e são rejeitadas — resultando em **zero dados consultáveis**, inclusive para `page_view`.

3. **O schema listado é genérico, não é prova de dados**: as mesmas chaves (browser, country, device_type, os, page_path, referrer, region, utm_*) aparecem para todos os eventos — é o schema padrão do SDK, não dados observados.

## Abordagem recomendada

Registrar os eventos automáticos faltantes (`error` e `performance`, tipo `traffic`) no registry do projeto via `register_analytics_event`. Isso é a correção documentada pelo próprio SDK (seção "Known Gaps" do README). Não há mudança de código no app necessária — a instrumentação já está correta.

Depois do registro, re-executar os queries de analytics para confirmar que os dados de page view fluem e, então, produzir o resumo solicitado (tendência diária + drivers por `page_path`/`referrer`/`utm_source`).

## Implementation checklist

- [ ] Chamar `register_analytics_event` para `error` (event_type `traffic`, descrição "Erro JS capturado automaticamente pelo SDK")
- [ ] Chamar `register_analytics_event` para `performance` (event_type `traffic`, descrição "Métricas de performance capturadas automaticamente pelo SDK")
- [ ] Re-executar `query_analytics` de `page_view` (últimos 7 dias, granularidade `day`) e confirmar que retorna linhas por dia com contagem > 0
- [ ] Consultar `page_view` agrupado por `page_path` (top 10) e por `referrer` (top 10) para identificar os drivers da tendência
- [ ] Produzir o resumo em português: evolução diária das visualizações no intervalo + o que está impulsionando (páginas/rotas e fontes de tráfego)

## Verification checklist

- [ ] Positivo: `query_analytics` com `event_name=page_view`, últimos 7 dias, granularidade `day` retorna tabela não vazia com valores > 0
- [ ] Positivo: agrupamento por `page_path` retorna as rotas mais visitadas (ex.: `/`, `/market`, `/news`)
- [ ] Positivo: contagem total de sessões (`distinct session_id`) > 0
- [ ] Default/negativo: se após o registro os queries seguirem zerados por ~alguns minutos, reavaliar como atraso de ingestão (eventos já aceitos com 202); documentar e re-verificar, sem inventar dados
- [ ] Sem mudanças de código no app → `pnpm run build` deve continuar passando sem alterações
