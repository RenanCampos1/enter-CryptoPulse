const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  if (value >= 1000) {
    return "$" + compactFormatter.format(value);
  }
  return "$" + value.toLocaleString("pt-BR", { maximumFractionDigits: 6 });
}

export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1) {
    return currencyFormatter.format(value);
  }
  return "$" + value.toLocaleString("pt-BR", { maximumFractionDigits: 6 });
}

export function formatCompact(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return "$" + compactFormatter.format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return numberFormatter.format(value);
}

export function formatPercent(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits).replace(".", ",")}%`;
}

export function formatDateTime(ts: number): string {
  const d = new Date(ts * 1000);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatClock(ts: number): string {
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function timeAgo(tsSeconds: number): string {
  const diff = Math.max(0, Date.now() / 1000 - tsSeconds);
  const minutes = Math.floor(diff / 60);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes} min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

export function isPositive(value: number | null | undefined): boolean {
  return (value ?? 0) >= 0;
}

/** Retorna a cor semântica do design system para uma variação. */
export function changeColorClass(value: number | null | undefined): string {
  return isPositive(value) ? "text-success" : "text-danger";
}
