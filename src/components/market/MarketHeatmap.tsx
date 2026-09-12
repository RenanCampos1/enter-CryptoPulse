import { useNavigate } from "react-router-dom";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { LayoutGrid } from "lucide-react";
import { useMarkets } from "@/lib/hooks";
import { formatCompact, formatPrice, formatPercent } from "@/lib/format";
import { trackCoinClick } from "@/lib/analytics";
import { ErrorState } from "./ErrorState";

interface HeatCoin {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
}

function cellColor(change: number): { bg: string; text: string } {
  const intensity = Math.min(Math.abs(change) / 12, 1);
  if (change >= 0) {
    const alpha = 0.35 + intensity * 0.6;
    return { bg: `rgba(22,199,132,${alpha.toFixed(2)})`, text: "#F5F7FA" };
  }
  const alpha = 0.35 + intensity * 0.6;
  return { bg: `rgba(234,57,67,${alpha.toFixed(2)})`, text: "#F5F7FA" };
}

interface HeatCellProps {
  x: number;
  y: number;
  width: number;
  height: number;
  symbol?: string;
  current_price?: number;
  price_change_percentage_24h?: number;
  id?: string;
  onPick?: (id: string) => void;
}

function HeatCell(props: HeatCellProps) {
  const { x, y, width, height, symbol, current_price, price_change_percentage_24h, id, onPick } = props;
  const isSmall = width < 46 || height < 30;
  const isTiny = width < 30 || height < 22;
  const { bg } = cellColor(price_change_percentage_24h ?? 0);

  return (
    <g
      onClick={() => id && onPick?.(id)}
      style={{ cursor: id ? "pointer" : "default" }}
    >
      <rect x={x} y={y} width={width} height={height} rx={4} fill={bg} stroke="rgba(8,11,16,0.7)" strokeWidth={1.5} />
      {!isTiny && (
        <>
          <text
            x={x + 6}
            y={y + (isSmall ? height / 2 : 18)}
            fill="#F5F7FA"
            fontSize={isSmall ? 10 : 12}
            fontWeight={700}
            style={{ textTransform: "uppercase", fontFamily: "JetBrains Mono, monospace" }}
          >
            {symbol}
          </text>
          {!isSmall && (
            <>
              <text x={x + 6} y={y + 33} fill="rgba(245,247,250,0.9)" fontSize={10}>
                {formatCompact(current_price)}
              </text>
              <text x={x + 6} y={y + 47} fill="rgba(245,247,250,0.95)" fontSize={10} fontWeight={600}>
                {formatPercent(price_change_percentage_24h)}
              </text>
            </>
          )}
        </>
      )}
    </g>
  );
}

interface HeatTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: HeatCoin }>;
}

function HeatTooltip({ active, payload }: HeatTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as HeatCoin;
  return (
    <div className="rounded-lg border border-border/60 bg-popover px-3 py-2 text-xs shadow-card">
      <div className="font-semibold text-foreground">
        {d.symbol.toUpperCase()} — {d.name}
      </div>
      <div className="mt-1 text-muted-foreground">
        {formatPrice(d.current_price)} · {formatPercent(d.price_change_percentage_24h)} 24h
      </div>
    </div>
  );
}

export function MarketHeatmap() {
  const { data, isLoading, isError, dataUpdatedAt } = useMarkets(100);
  const navigate = useNavigate();

  if (isError) {
    return <ErrorState lastUpdated={dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString("pt-BR") : undefined} />;
  }

  const heatData: HeatCoin[] = (data ?? [])
    .filter((c) => c.market_cap > 0)
    .map((c) => ({
      id: c.id,
      name: c.name,
      symbol: c.symbol.toUpperCase(),
      current_price: c.current_price,
      price_change_percentage_24h: c.price_change_percentage_24h ?? 0,
      market_cap: c.market_cap,
    }));

  return (
    <section className="card-glow rounded-2xl border border-border/60 bg-card p-4 md:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-card-secondary text-foreground">
            <LayoutGrid className="h-4 w-4" />
          </span>
          <h2 className="font-display text-lg font-bold text-foreground">Heatmap do mercado</h2>
          <span className="text-xs text-muted-foreground">tamanho = Market Cap · cor = 24h</span>
        </div>
      </div>

      {isLoading && !data ? (
        <div className="h-[420px] animate-pulse rounded-xl bg-card-secondary/60" />
      ) : (
        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={heatData}
              dataKey="market_cap"
              nameKey="name"
              aspectRatio={4 / 3}
              stroke="transparent"
              content={<HeatCell onPick={(id: string) => navigate(`/crypto/${id}`)} />}
            >
              <Tooltip content={<HeatTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
