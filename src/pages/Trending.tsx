import { useSeo } from "@/lib/seo";
import { useTrending } from "@/lib/hooks";
import { PageHeader } from "@/components/market/PageHeader";
import { ErrorState } from "@/components/market/ErrorState";
import { TrendingSection } from "@/components/market/TrendingSection";

export default function Trending() {
  useSeo({
    title: "Trending Crypto — Criptomoedas em Alta de Atenção | CryptoPulse",
    description:
      "As criptomoedas que estão recebendo mais atenção e volume agora, com preço, variação e ranking.",
    path: "/trending",
  });

  const { isError, dataUpdatedAt } = useTrending();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trending Crypto"
        subtitle="As moedas que estão recebendo maior atenção e volume no mercado agora."
      />
      {isError ? (
        <ErrorState lastUpdated={dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString("pt-BR") : undefined} />
      ) : (
        <TrendingSection />
      )}
    </div>
  );
}
