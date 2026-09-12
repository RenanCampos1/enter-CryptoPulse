import { useState, useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { useMarketChart } from "@/lib/hooks";
import { formatPrice, formatCompactRaw, formatClock } from "@/lib/format";
import { ErrorState } from "./ErrorState";
import { cn } from "@/lib/utils";
import type { ChartPeriod } from "@/lib/api/types";

const PERIODS: ChartPeriod[] = ["1H", "1D", "7D", "1M", "1Y", "ALL"];

function tickFormatter(ts: number, period: ChartPeriod): string {
  const d = new Date(ts * 1000);
  if (period === "1H" || period === "1D") {
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  if (period === "7D" || period === "1M") {
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  }
  return d.toLocaleDateString("pt-BR", { month: "2-digit", year: "2-digit" });
}

function ChartTooltipBody({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: number }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-popover px-3 py-2 text-xs shadow-card">
      <div className="text-muted-foreground">
        {label ? new Date(label * 1000).toLocaleString("pt-BR") : ""}
      </div>
      <div className="font-mono-nums mt-0.5 text-sm font-semibold text-foreground">
        {formatPrice(payload[0].value)}
      </div>
    </div>
  );
}

export function PriceChart({ coinId, height = 300, className }: { coinId: string; height?: number; className?: string }) {
  const [period, setPeriod] = useState<ChartPeriod>("1D");
  const { data, isLoading, error, dataUpdatedAt } = useMarketChart(coinId, period);

  const chartData = useMemo(() => (data ?? []).map((p) => ({ ts: p.ts, price: p.price })), [data]);

  const up = chartData.length >= 2 ? chartData[chartData.length - 1].price >= chartData[0].price : true;
  const stroke = up ? "#16C784" : "#EA3943";
  const gradId = `grad-${coinId}-${period}`;

  if (error) {
    return <ErrorState lastUpdated={dataUpdatedAt ? formatClock(dataUpdatedAt / 1000) : undefined} />;
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 rounded-lg bg-card-secondary p-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {dataUpdatedAt
            ? `Atualizado ${formatClock(dataUpdatedAt / 1000)}`
            : "Carregando..."}
        </span>
      </div>

      <div className="relative" style={{ height }}>
        {isLoading && !data ? (
          <div className="h-full w-full animate-pulse rounded-xl bg-card-secondary/60" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,152,168,0.12)" vertical={false} />
              <XAxis
                dataKey="ts"
                tickFormatter={(ts: number) => tickFormatter(ts, period)}
                tick={{ fill: "#8B98A8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                minTickGap={40}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fill: "#8B98A8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={52}
                tickFormatter={(v: number) => formatCompactRaw(v)}
              />
              <Tooltip content={<ChartTooltipBody />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={stroke}
                strokeWidth={2}
                fill={`url(#${gradId})`}
                dot={false}
                activeDot={{ r: 3, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
