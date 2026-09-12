import { useSeo } from "@/lib/seo";
import { useMarkets } from "@/lib/hooks";
import { RankingTable } from "@/components/market/RankingTable";
import { PageHeader } from "@/components/market/PageHeader";
import { ErrorState } from "@/components/market/ErrorState";
import { MarketShareButton } from "@/components/share/MarketShareCard";

export default function Gainers() {
  useSeo({
    title: "Maiores Altas Hoje — Criptomoedas em Alta 24h | CryptoPulse",
    description:
      "As criptomoedas que mais subiram nas últimas 24 horas: ranking com preço, variação, volume e market cap.",
    path: "/gainers",
  });

  const { data: coins, isError, dataUpdatedAt } = useMarkets(100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maiores altas"
        subtitle="As criptomoedas que mais subiram nas últimas 24 horas."
        actions={<MarketShareButton label="Compartilhar ranking" />}
      />
      {isError ? (
        <ErrorState lastUpdated={dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString("pt-BR") : undefined} />
      ) : (
        <RankingTable title="Top 24h" direction="up" coins={coins ?? []} />
      )}
    </div>
  );
}
