import { useMemo, useRef, useState } from "react";
import { Wand2, Download, Share2, Loader2, Search } from "lucide-react";
import { useSeo } from "@/lib/seo";
import { useCoinSearch, useCoinMarkets, useMarketChart } from "@/lib/hooks";
import { useDebounce } from "@/lib/use-debounce";
import { formatPrice, formatCompact, formatPercent, changeColorClass } from "@/lib/format";
import { trackPostGenerator, trackCoinSearch } from "@/lib/analytics";
import { downloadNodeAsPng } from "@/lib/share";
import { PageHeader } from "@/components/market/PageHeader";
import { Sparkline } from "@/components/market/Sparkline";
import { Logo } from "@/components/layout/Logo";
import { ShareCard, type ShareFormat } from "@/components/share/ShareCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Template = "classic" | "hero" | "signal";

const TEMPLATES: Array<{ key: Template; label: string }> = [
  { key: "classic", label: "Clássico" },
  { key: "hero", label: "Hero" },
  { key: "signal", label: "Sinal" },
];

function PostArt({ coinId, template, format }: { coinId: string; template: Template; format: ShareFormat }) {
  const { data: coins } = useCoinMarkets([coinId]);
  const { data: chart } = useMarketChart(coinId, "1D");
  const coin = coins?.[0];
  const prices = useMemo(() => (chart ?? []).map((p) => p.price), [chart]);

  const up = (coin?.price_change_percentage_24h ?? 0) >= 0;
  const isStory = format === "9:16";

  const bg =
    template === "hero"
      ? "linear-gradient(150deg, #3861FB 0%, #7A3FF2 55%, #080B10 140%)"
      : template === "signal"
      ? up
        ? "linear-gradient(160deg, #0A3D2A 0%, #080B10 70%)"
        : "linear-gradient(160deg, #3D0A0D 0%, #080B10 70%)"
      : "#080B10";

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden p-5 text-foreground"
      style={{ background: bg }}
    >
      <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex items-start justify-between">
        {template === "classic" || template === "hero" ? (
          <Logo compact={template === "hero"} />
        ) : (
          <span className={cn("font-display text-sm font-bold", up ? "text-success" : "text-danger")}>
            {up ? "▲ ALTA" : "▼ QUEDA"}
          </span>
        )}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">
            {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
          </span>
          {coin?.image ? (
            <img src={coin.image} alt={coin.name} crossOrigin="anonymous" className="h-6 w-6 rounded-full bg-white/20" />
          ) : null}
        </div>
      </div>

      <div className="relative mt-3 flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">{coin?.symbol.toUpperCase() ?? coinId}</span>
        <span className="font-mono-nums text-sm font-semibold text-foreground">#{coin?.market_cap_rank ?? "—"}</span>
      </div>

      <div className="relative mt-1">
        <div className={cn("font-mono-nums font-bold", template === "hero" ? "text-4xl" : "text-3xl", isStory && "text-3xl")}>
          {formatPrice(coin?.current_price)}
        </div>
        <div
          className={cn(
            "mt-1 inline-flex items-center gap-1 rounded-lg px-2 py-0.5 font-mono-nums text-sm font-semibold",
            up ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
          )}
        >
          {formatPercent(coin?.price_change_percentage_24h)} 24h
        </div>
      </div>

      <div className={cn("relative mt-3", isStory && "flex-1")}>
        <Sparkline data={prices} width={isStory ? 240 : 300} height={isStory ? 80 : 60} />
      </div>

      <div className={cn("relative grid grid-cols-2 gap-2", isStory ? "mt-3" : "mt-3")}>
        <div className="rounded-lg bg-black/20 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Market Cap</div>
          <div className="font-mono-nums text-sm font-semibold">{formatCompact(coin?.market_cap)}</div>
        </div>
        <div className="rounded-lg bg-black/20 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Volume 24h</div>
          <div className="font-mono-nums text-sm font-semibold">{formatCompact(coin?.total_volume)}</div>
        </div>
      </div>

      <div className={cn("relative mt-3 flex items-center justify-between", !isStory && "mt-auto")}>
        <span className="font-display text-sm font-bold text-primary">CryptoPulse</span>
        <span className={changeColorClass(coin?.price_change_percentage_24h)}>
          {up ? "bullish" : "bearish"}
        </span>
      </div>
    </div>
  );
}

export default function PostGenerator() {
  useSeo({
    title: "Crypto Post Generator — Crie posts de criptomoedas grátis | CryptoPulse",
    description:
      "Gere artes prontas para compartilhar com preço, variação, market cap e volume de qualquer criptomoeda. Grátis.",
    path: "/post-generator",
  });

  const [coinId, setCoinId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [template, setTemplate] = useState<Template>("classic");
  const debounced = useDebounce(query, 350);
  const { data, isFetching } = useCoinSearch(debounced);
  const previewRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const selectCoin = (id: string) => {
    trackCoinSearch(query.length, data?.coins?.length ?? 0);
    setCoinId(id);
    setQuery("");
  };

  const handleDownload = async () => {
    if (!previewRef.current || !coinId) return;
    setBusy(true);
    try {
      await downloadNodeAsPng(previewRef.current, `cryptopulse-post-${coinId}`);
      trackPostGenerator("download", coinId, template);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Crypto Post Generator"
        subtitle="Escolha uma criptomoeda e gere uma arte pronta para publicar nas redes sociais. 100% gratuito."
      />

      {/* SELEÇÃO */}
      <section className="card-glow rounded-2xl border border-border/60 bg-card p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite o nome da criptomoeda (ex.: Bitcoin, Solana, PEPE)..."
            className="h-11 w-full rounded-xl border border-border bg-card-secondary pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {isFetching && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
        </div>

        {query.trim().length >= 2 && (
          <div className="mt-2 max-h-64 overflow-auto rounded-xl border border-border bg-popover p-1.5">
            {(data?.coins ?? []).length === 0 && !isFetching ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">Nenhuma moeda encontrada.</div>
            ) : (
              (data?.coins ?? []).map((coin) => (
                <button
                  key={coin.id}
                  onClick={() => selectCoin(coin.id)}
                  className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-accent"
                >
                  {coin.thumb ? (
                    <img src={coin.thumb} alt={coin.name} className="h-6 w-6 rounded-full bg-card-secondary" />
                  ) : (
                    <span className="h-6 w-6 rounded-full bg-card-secondary" />
                  )}
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-foreground">{coin.name}</span>
                    <span className="block text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </section>

      {!coinId ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Wand2 className="h-8 w-8 text-primary" />
          <p className="max-w-sm text-sm text-muted-foreground">
            Escolha uma criptomoeda acima para gerar sua arte personalizada com preço, variação, market
            cap, volume e gráfico.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-3 flex items-center gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTemplate(t.key)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    template === t.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-card-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl border border-border/60 shadow-card">
              <div ref={previewRef} style={{ aspectRatio: "1 / 1" }} className="w-full">
                <PostArt coinId={coinId} template={template} format="1:1" />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button variant="default" className="flex-1" onClick={handleDownload} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Baixar imagem
              </Button>
              <ShareCard
                trigger={
                  <Button variant="outline-muted" className="flex-1" data-analytics-share="post">
                    <Share2 className="h-4 w-4" />
                    Compartilhar
                  </Button>
                }
                dialogTitle="Compartilhar post"
                dialogDescription="Escolha o formato e baixe ou compartilhe sua arte."
                fileName={`cryptopulse-post-${coinId}`}
                shareText="Post gerado no CryptoPulse — preço, variação e dados da moeda"
                analyticsKind="post"
                onDownloaded={() => trackPostGenerator("download", coinId, template)}
                onShared={() => trackPostGenerator("share", coinId, template)}
              >
                {(format) => <PostArt coinId={coinId} template={template} format={format} />}
              </ShareCard>
            </div>
          </div>

          <aside className="space-y-3 rounded-2xl border border-border/60 bg-card p-5 text-xs leading-relaxed text-muted-foreground">
            <h3 className="font-display text-sm font-semibold text-foreground">Dicas de publicação</h3>
            <p>
              Publique o card em <strong className="text-foreground">Instagram Stories (9:16)</strong>,{" "}
              <strong className="text-foreground">feed (1:1)</strong> ou{" "}
              <strong className="text-foreground">X/LinkedIn (16:9)</strong>.
            </p>
            <p>O card inclui a marca CryptoPulse.com para quem o vir também encontrar o site.</p>
            <p className="text-[11px]">Conteúdo informativo. Não é recomendação de investimento.</p>
          </aside>
        </div>
      )}
    </div>
  );
}
