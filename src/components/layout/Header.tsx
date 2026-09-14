import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Logo } from "./Logo";
import { CoinSearch } from "@/components/market/CoinSearch";
import { MarketShareButton } from "@/components/share/MarketShareCard";
import { LanguageSwitcher } from "@/components/language-switcher";

export function Header() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: t("nav.market"), to: "/market" },
    { label: t("nav.news"), to: "/news" },
    { label: t("nav.trending"), to: "/trending" },
    { label: t("nav.memecoins"), to: "/memecoins" },
    { label: t("nav.fearGreed"), to: "/fear-greed" },
    { label: t("nav.calendar"), to: "/calendar" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-border/60 bg-background/80 backdrop-blur-xl md:h-16">
      <div className="mx-auto flex h-full max-w-[1400px] items-center gap-3 px-4 md:px-6">
        <Link to="/" className="shrink-0" aria-label={t("header.ariaHome")}>
          <Logo />
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-card-secondary text-foreground"
                    : "text-muted-foreground hover:bg-card-secondary/60 hover:text-foreground"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher className="hidden md:block" />
          <CoinSearch className="hidden w-56 md:block lg:w-64" />
          <span className="hidden sm:block">
            <MarketShareButton />
          </span>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={t("header.ariaMenu")}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/60 bg-background/95 px-4 pb-4 pt-3 backdrop-blur-xl lg:hidden">
          <CoinSearch className="mb-3" autoFocus />
          <div className="grid grid-cols-2 gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive
                      ? "bg-card-secondary text-foreground"
                      : "text-muted-foreground hover:bg-card-secondary/60 hover:text-foreground"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <LanguageSwitcher className="flex-1" />
            <MarketShareButton label={t("header.shareMarket")} />
          </div>
        </div>
      )}
    </header>
  );
}
