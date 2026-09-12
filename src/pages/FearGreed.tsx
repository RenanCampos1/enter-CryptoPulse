import { useSeo } from "@/lib/seo";
import { useFearGreed } from "@/lib/hooks";
import { FearGreedGauge, FearGreedHistory } from "@/components/market/FearGreedGauge";
import { PageHeader } from "@/components/market/PageHeader";
import { ErrorState } from "@/components/market/ErrorState";
import { MarketShareButton } from "@/components/share/MarketShareCard";

export default function FearGreed() {
  useSeo({
    title: "Crypto Fear & Greed Index — Sentimento do Mercado Hoje | CryptoPulse",
    description:
      "O índice Fear & Greed do mercado de criptomoedas em tempo real: valor atual, variação diária e histórico dos últimos 30 dias.",
    path: "/fear-greed",
  });

  const { data, dataUpdatedAt } = useFearGreed();
  const history = data?.data ?? [];
  const current = history[0];
  const previous = history[1];

  if (!current) {
    return <ErrorState lastUpdated={dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString("pt-BR") : undefined} />;
  }

  const value = Number(current.value);
  const prev = previous ? Number(previous.value) : undefined;
  const delta = prev !== undefined ? value - prev : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Crypto Fear & Greed"
        subtitle="O sentimento do mercado de criptomoedas em tempo real."
        actions={<MarketShareButton label="Compartilhar Fear & Greed" />}
      />

      <section className="card-glow rounded-2xl border border-border/60 bg-card p-5 md:p-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="flex items-center justify-center">
            <FearGreedGauge value={value} />
          </div>

          <div className="flex flex-col justify-center gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-card-secondary/70 p-4">
                <div className="text-xs text-muted-foreground">Valor atual</div>
                <div className="font-mono-nums text-3xl font-bold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground">{current.value_classification}</div>
              </div>
              <div className="rounded-xl bg-card-secondary/70 p-4">
                <div className="text-xs text-muted-foreground">Variação desde ontem</div>
                <div className={`font-mono-nums text-3xl font-bold ${delta !== undefined && delta >= 0 ? "text-success" : "text-danger"}`}>
                  {delta !== undefined ? `${delta >= 0 ? "+" : ""}${delta}` : "—"}
                </div>
                <div className="text-xs text-muted-foreground">pontos</div>
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs text-muted-foreground">Histórico — últimos 30 dias</div>
              <div className="rounded-xl bg-card-secondary/40 p-3">
                <FearGreedHistory history={history} />
              </div>
            </div>

            <div className="rounded-xl bg-card-secondary/70 p-4 text-xs leading-relaxed text-muted-foreground">
              O <strong className="text-foreground">Fear & Greed Index</strong> (0–100) é calculado a partir
              de volatilidade, momentum de mercado, volume e pesquisas. Valores baixos indicam medo
              (possível pessimismo extremo); valores altos indicam ganância (possível euforia). É um
              indicador informativo — não é recomendação de compra ou venda.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
