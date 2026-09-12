import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MarketTicker } from "./MarketTicker";

function PageFallback() {
  return (
    <div className="space-y-4 py-8">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-card-secondary/70" />
      <div className="h-40 w-full animate-pulse rounded-2xl bg-card-secondary/60" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-card-secondary/60" />
        ))}
      </div>
    </div>
  );
}

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
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
