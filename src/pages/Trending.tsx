import { useTranslation } from "react-i18next";
import { useSeo } from "@/lib/seo";
import { useTrending } from "@/lib/hooks";
import { PageHeader } from "@/components/market/PageHeader";
import { ErrorState } from "@/components/market/ErrorState";
import { TrendingSection } from "@/components/market/TrendingSection";
import { formatClock } from "@/lib/format";

export default function Trending() {
  const { t } = useTranslation();
  useSeo({
    title: t("seo.trendingTitle"),
    description: t("seo.trendingDesc"),
    path: "/trending",
  });

  const { isError, dataUpdatedAt } = useTrending();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("trendingPage.title")}
        subtitle={t("trendingPage.subtitle")}
      />
      {isError ? (
        <ErrorState lastUpdated={dataUpdatedAt ? formatClock(dataUpdatedAt / 1000) : undefined} />
      ) : (
        <TrendingSection />
      )}
    </div>
  );
}
