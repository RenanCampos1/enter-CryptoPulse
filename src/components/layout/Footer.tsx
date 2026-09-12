import { Link } from "react-router-dom";
import { Logo } from "./Logo";

const LINKS = [
  { label: "Mercado", to: "/market" },
  { label: "Maiores altas", to: "/gainers" },
  { label: "Maiores quedas", to: "/losers" },
  { label: "Trending", to: "/trending" },
  { label: "Memecoins", to: "/memecoins" },
  { label: "Notícias", to: "/news" },
  { label: "Fear & Greed", to: "/fear-greed" },
  { label: "Calendário", to: "/calendar" },
  { label: "Post Generator", to: "/post-generator" },
];

const POPULAR = [
  { id: "bitcoin", name: "Bitcoin" },
  { id: "ethereum", name: "Ethereum" },
  { id: "solana", name: "Solana" },
  { id: "xrp", name: "XRP" },
  { id: "dogecoin", name: "Dogecoin" },
  { id: "shiba-inu", name: "Shiba Inu" },
  { id: "cardano", name: "Cardano" },
  { id: "polkadot", name: "Polkadot" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Preços, notícias, tendências e indicadores do mercado de criptomoedas em tempo
              real — gratuito para todos.
            </p>
            <div data-ad-slot="footer" className="mt-6 hidden rounded-xl border border-dashed border-border/60 p-4 text-xs text-muted-foreground" />
          </div>

          <div>
            <h3 className="font-display mb-3 text-sm font-semibold text-foreground">Seções</h3>
            <ul className="space-y-2 text-sm">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display mb-3 text-sm font-semibold text-foreground">Criptomoedas</h3>
            <ul className="space-y-2 text-sm">
              {POPULAR.map((c) => (
                <li key={c.id}>
                  <Link to={`/crypto/${c.id}`} className="text-muted-foreground transition-colors hover:text-foreground">
                    {c.name} hoje
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border/60 pt-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Aviso legal:</strong> Os dados apresentados pelo
            CryptoPulse possuem finalidade exclusivamente informativa. Informações, preços e
            indicadores podem apresentar atrasos ou divergências conforme a fonte. Nada neste site
            constitui recomendação financeira ou de investimento.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            © {new Date().getFullYear()} CryptoPulse — O mercado cripto em um só lugar.
          </p>
        </div>
      </div>
    </footer>
  );
}
