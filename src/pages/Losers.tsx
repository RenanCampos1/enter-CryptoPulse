import { useSeo } from "@/lib/seo";
import { useMarkets } from "@/lib/hooks";
import { RankingTable } from "@/components/market/RankingTable";
import { PageHeader } from "@/components/market/PageHeader";
import { ErrorState } from "@/components/market/ErrorState";
import { MarketShareButton } from "@/components/share/MarketShareCard";

export default function Losers() {
  useSeo({
    title: "Maiores Quedas Hoje — Criptomoedas em Queda 24h | CryptoPulse",
    description:
      "As criptomoedas que mais caíram nas últimas 24 horas: ranking com preço, variação, volume e market cap.",
    path: "/losers",
  });

  const { data: coins, isError, dataUpdatedAt } = useMarkets(100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maiores quedas"
        subtitle="As criptomoedas que mais caíram nas últimas 24 horas."
        actions={<MarketShareButton label="Compartilhar ranking" />}
      />
      {isError ? (
        <ErrorState lastUpdated={dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString("pt-BR") : undefined} />
      ) : (
        <RankingTable title="Top 24h" direction="down" coins={coins ?? []} />
      )}
    </div>
  );
}
