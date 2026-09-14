import { useTranslation } from "react-i18next";
import { useSeo } from "@/lib/seo";
import { useMarkets } from "@/lib/hooks";
import { RankingTable } from "@/components/market/RankingTable";
import { PageHeader } from "@/components/market/PageHeader";
import { ErrorState } from "@/components/market/ErrorState";
import { MarketShareButton } from "@/components/share/MarketShareCard";
import { formatClock } from "@/lib/format";

export default function Losers() {
  const { t } = useTranslation();
  useSeo({
    title: t("seo.losersTitle"),
    description: t("seo.losersDesc"),
    path: "/losers",
  });

  const { data: coins, isError, dataUpdatedAt } = useMarkets(100);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("losers.title")}
        subtitle={t("losers.subtitle")}
        actions={<MarketShareButton label={t("losers.share")} />}
      />
      {isError ? (
        <ErrorState lastUpdated={dataUpdatedAt ? formatClock(dataUpdatedAt / 1000) : undefined} />
      ) : (
        <RankingTable title={t("losers.top24h")} direction="down" coins={coins ?? []} />
      )}
    </div>
  );
}
