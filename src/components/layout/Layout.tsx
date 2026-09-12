import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MarketTicker } from "./MarketTicker";

export function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-14 md:pt-16">
        <MarketTicker />
        <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-6">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
