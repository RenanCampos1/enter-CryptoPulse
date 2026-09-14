import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Logo } from "./Logo";

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const links = [
    { label: t("nav.market"), to: "/market" },
    { label: t("nav.gainers"), to: "/gainers" },
    { label: t("nav.losers"), to: "/losers" },
    { label: t("nav.trending"), to: "/trending" },
    { label: t("nav.memecoins"), to: "/memecoins" },
    { label: t("nav.news"), to: "/news" },
    { label: t("nav.fearGreed"), to: "/fear-greed" },
    { label: t("nav.calendar"), to: "/calendar" },
    { label: t("nav.postGenerator"), to: "/post-generator" },
  ];

  const popular = [
    { id: "bitcoin", name: "Bitcoin" },
    { id: "ethereum", name: "Ethereum" },
    { id: "solana", name: "Solana" },
    { id: "xrp", name: "XRP" },
    { id: "dogecoin", name: "Dogecoin" },
    { id: "shiba-inu", name: "Shiba Inu" },
    { id: "cardano", name: "Cardano" },
    { id: "polkadot", name: "Polkadot" },
  ];

  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">{t("footer.description")}</p>
            <div data-ad-slot="footer" className="mt-6 hidden rounded-xl border border-dashed border-border/60 p-4 text-xs text-muted-foreground" />
          </div>

          <div>
            <h3 className="font-display mb-3 text-sm font-semibold text-foreground">{t("footer.sections")}</h3>
            <ul className="space-y-2 text-sm">
              {links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display mb-3 text-sm font-semibold text-foreground">{t("footer.cryptocurrencies")}</h3>
            <ul className="space-y-2 text-sm">
              {popular.map((c) => (
                <li key={c.id}>
                  <Link to={`/crypto/${c.id}`} className="text-muted-foreground transition-colors hover:text-foreground">
                    {t("footer.coinToday", { name: c.name })}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border/60 pt-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">{t("footer.disclaimerTitle")}</strong> {t("footer.disclaimer")}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">{t("footer.copyright", { year })}</p>
        </div>
      </div>
    </footer>
  );
}
