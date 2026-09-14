import { useTranslation } from "react-i18next";
import { useSeo } from "@/lib/seo";
import { CryptoTable } from "@/components/market/CryptoTable";
import { PageHeader } from "@/components/market/PageHeader";
import { MarketShareButton } from "@/components/share/MarketShareCard";

export default function Market() {
  const { t } = useTranslation();
  useSeo({
    title: t("seo.marketTitle"),
    description: t("seo.marketDesc"),
    path: "/market",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("market.pageTitle")}
        subtitle={t("market.subtitle")}
        actions={<MarketShareButton label={t("market.share")} />}
      />
      <CryptoTable />
    </div>
  );
}
