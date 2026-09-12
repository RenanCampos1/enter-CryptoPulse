import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { useCoinSearch } from "@/lib/hooks";
import { useDebounce } from "@/lib/use-debounce";
import { trackCoinSearch } from "@/lib/analytics";

export function CoinSearch({ className, autoFocus = false }: { className?: string; autoFocus?: boolean }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(query, 350);
  const navigate = useNavigate();
  const wrapRef = useRef<HTMLDivElement>(null);

  const { data, isFetching } = useCoinSearch(debounced);
  const results = data?.coins ?? [];

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const handleSelect = (id: string, queryLen: number, resultCount: number) => {
    trackCoinSearch(queryLen, resultCount);
    setOpen(false);
    setQuery("");
    navigate(`/crypto/${id}`);
  };

  return (
    <div ref={wrapRef} className={`relative ${className ?? ""}`}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results.length > 0) {
              handleSelect(results[0].id, query.length, results.length);
            }
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Buscar criptomoeda..."
          className="h-9 w-full rounded-lg border border-border bg-card-secondary pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {isFetching && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-11 z-50 max-h-80 overflow-auto rounded-xl border border-border bg-popover p-1.5 shadow-card">
          {results.length === 0 && !isFetching ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">Nenhuma moeda encontrada.</div>
          ) : (
            results.map((coin) => (
              <button
                key={coin.id}
                onClick={() => handleSelect(coin.id, query.length, results.length)}
                className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-accent"
              >
                {coin.thumb ? (
                  <img src={coin.thumb} alt={coin.name} className="h-6 w-6 rounded-full bg-card-secondary" />
                ) : (
                  <span className="h-6 w-6 rounded-full bg-card-secondary" />
                )}
                <span className="flex-1">
                  <span className="block text-sm font-medium text-foreground">{coin.name}</span>
                  <span className="block text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</span>
                </span>
                {coin.market_cap_rank ? (
                  <span className="text-xs text-muted-foreground">#{coin.market_cap_rank}</span>
                ) : null}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
