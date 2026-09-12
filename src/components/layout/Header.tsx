import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { CoinSearch } from "@/components/market/CoinSearch";
import { MarketShareButton } from "@/components/share/MarketShareCard";

const NAV_ITEMS = [
  { label: "Mercado", to: "/market" },
  { label: "Notícias", to: "/news" },
  { label: "Trending", to: "/trending" },
  { label: "Memecoins", to: "/memecoins" },
  { label: "Fear & Greed", to: "/fear-greed" },
  { label: "Calendário", to: "/calendar" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-border/60 bg-background/80 backdrop-blur-xl md:h-16">
      <div className="mx-auto flex h-full max-w-[1400px] items-center gap-3 px-4 md:px-6">
        <Link to="/" className="shrink-0" aria-label="CryptoPulse — início">
          <Logo />
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
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
          <CoinSearch className="hidden w-56 md:block lg:w-64" />
          <span className="hidden sm:block">
            <MarketShareButton />
          </span>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/60 bg-background/95 px-4 pb-4 pt-3 backdrop-blur-xl lg:hidden">
          <CoinSearch className="mb-3" autoFocus />
          <div className="grid grid-cols-2 gap-1">
            {NAV_ITEMS.map((item) => (
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
          <div className="mt-3">
            <MarketShareButton label="Compartilhar mercado" />
          </div>
        </div>
      )}
    </header>
  );
}
