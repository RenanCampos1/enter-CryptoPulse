import { useTranslation } from "react-i18next";
import { useSeo } from "@/lib/seo";
import { useFearGreed } from "@/lib/hooks";
import { FearGreedGauge, FearGreedHistory } from "@/components/market/FearGreedGauge";
import { PageHeader } from "@/components/market/PageHeader";
import { ErrorState } from "@/components/market/ErrorState";
import { MarketShareButton } from "@/components/share/MarketShareCard";
import { formatClock } from "@/lib/format";

export default function FearGreed() {
  const { t } = useTranslation();
  useSeo({
    title: t("seo.fearGreedTitle"),
    description: t("seo.fearGreedDesc"),
    path: "/fear-greed",
  });

  const { data, dataUpdatedAt } = useFearGreed();
  const history = data?.data ?? [];
  const current = history[0];
  const previous = history[1];

  if (!current) {
    return <ErrorState lastUpdated={dataUpdatedAt ? formatClock(dataUpdatedAt / 1000) : undefined} />;
  }

  const value = Number(current.value);
  const prev = previous ? Number(previous.value) : undefined;
  const delta = prev !== undefined ? value - prev : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("fearGreed.pageTitle")}
        subtitle={t("fearGreed.subtitle")}
        actions={<MarketShareButton label={t("fearGreed.share")} />}
      />

      <section className="card-glow rounded-2xl border border-border/60 bg-card p-5 md:p-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="flex items-center justify-center">
            <FearGreedGauge value={value} />
          </div>

          <div className="flex flex-col justify-center gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-card-secondary/70 p-4">
                <div className="text-xs text-muted-foreground">{t("fearGreed.currentValue")}</div>
                <div className="font-mono-nums text-3xl font-bold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground">{current.value_classification}</div>
              </div>
              <div className="rounded-xl bg-card-secondary/70 p-4">
                <div className="text-xs text-muted-foreground">{t("fearGreed.changeSinceYesterday")}</div>
                <div className={`font-mono-nums text-3xl font-bold ${delta !== undefined && delta >= 0 ? "text-success" : "text-danger"}`}>
                  {delta !== undefined ? `${delta >= 0 ? "+" : ""}${delta}` : "—"}
                </div>
                <div className="text-xs text-muted-foreground">{t("fearGreed.points")}</div>
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs text-muted-foreground">{t("fearGreed.history")}</div>
              <div className="rounded-xl bg-card-secondary/40 p-3">
                <FearGreedHistory history={history} />
              </div>
            </div>

            <div className="rounded-xl bg-card-secondary/70 p-4 text-xs leading-relaxed text-muted-foreground">
              {t("fearGreed.explainerBefore")}{" "}
              <strong className="text-foreground">{t("home.fngIndexName")}</strong>{" "}
              {t("fearGreed.explainerAfter")}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
