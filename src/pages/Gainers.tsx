import { useTranslation } from "react-i18next";
import { useSeo } from "@/lib/seo";
import { useMarkets } from "@/lib/hooks";
import { RankingTable } from "@/components/market/RankingTable";
import { PageHeader } from "@/components/market/PageHeader";
import { ErrorState } from "@/components/market/ErrorState";
import { MarketShareButton } from "@/components/share/MarketShareCard";
import { formatClock } from "@/lib/format";

export default function Gainers() {
  const { t } = useTranslation();
  useSeo({
    title: t("seo.gainersTitle"),
    description: t("seo.gainersDesc"),
    path: "/gainers",
  });

  const { data: coins, isError, dataUpdatedAt } = useMarkets(100);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("gainers.title")}
        subtitle={t("gainers.subtitle")}
        actions={<MarketShareButton label={t("gainers.share")} />}
      />
      {isError ? (
        <ErrorState lastUpdated={dataUpdatedAt ? formatClock(dataUpdatedAt / 1000) : undefined} />
      ) : (
        <RankingTable title={t("gainers.top24h")} direction="up" coins={coins ?? []} />
      )}
    </div>
  );
}
