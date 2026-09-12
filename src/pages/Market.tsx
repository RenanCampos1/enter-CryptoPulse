import { useSeo } from "@/lib/seo";
import { CryptoTable } from "@/components/market/CryptoTable";
import { PageHeader } from "@/components/market/PageHeader";
import { MarketShareButton } from "@/components/share/MarketShareCard";

export default function Market() {
  useSeo({
    title: "Mercado de Criptomoedas — Preços, Ranking e Tabela Completa | CryptoPulse",
    description:
      "Tabela completa do mercado de criptomoedas: preços, variações 1h/24h/7d, market cap, volume e gráficos das principais moedas.",
    path: "/market",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mercado"
        subtitle="Todas as principais criptomoedas: preço, variações, volume, market cap e gráfico."
        actions={<MarketShareButton label="Compartilhar ranking" />}
      />
      <CryptoTable />
    </div>
  );
}
