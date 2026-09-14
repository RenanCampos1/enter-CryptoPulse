import i18n, { fallbackLng, normalizeLanguage } from "@/i18n/config";

/** Locale ativo normalizado (ex.: "pt-BR", "en") — fonte dos formatters Intl. */
export function activeLocale(): string {
  return normalizeLanguage(i18n.resolvedLanguage ?? i18n.language) ?? fallbackLng;
}

const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(kind: "currency" | "compact" | "number" | "percent", locale: string, digits?: number): Intl.NumberFormat {
  const key = `${kind}:${locale}:${digits ?? 0}`;
  let fmt = formatterCache.get(key);
  if (!fmt) {
    if (kind === "currency") {
      fmt = new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
    } else if (kind === "compact") {
      fmt = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 2 });
    } else if (kind === "percent") {
      fmt = new Intl.NumberFormat(locale, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
    } else {
      fmt = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
    }
    formatterCache.set(key, fmt);
  }
  return fmt;
}

function isInvalid(value: number | null | undefined): boolean {
  return value === null || value === undefined || Number.isNaN(value);
}

export function formatCurrency(value: number | null | undefined): string {
  if (isInvalid(value)) return "—";
  const locale = activeLocale();
  if (value >= 1000) {
    return "$" + getFormatter("compact", locale).format(value);
  }
  return "$" + value.toLocaleString(locale, { maximumFractionDigits: 6 });
}

export function formatPrice(value: number | null | undefined): string {
  if (isInvalid(value)) return "—";
  const locale = activeLocale();
  const abs = Math.abs(value);
  if (abs >= 1) {
    return getFormatter("currency", locale).format(value);
  }
  return "$" + value.toLocaleString(locale, { maximumFractionDigits: 6 });
}

export function formatCompact(value: number | null | undefined): string {
  if (isInvalid(value)) return "—";
  return "$" + getFormatter("compact", activeLocale()).format(value);
}

/** Compacto sem prefixo de moeda (ex.: "8,65 mi") — usado em eixos de gráfico. */
export function formatCompactRaw(value: number | null | undefined): string {
  if (isInvalid(value)) return "";
  return getFormatter("compact", activeLocale()).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (isInvalid(value)) return "—";
  return getFormatter("number", activeLocale()).format(value);
}

export function formatPercent(value: number | null | undefined, digits = 2): string {
  if (isInvalid(value)) return "—";
  const sign = value > 0 ? "+" : "";
  const body = getFormatter("percent", activeLocale(), digits).format(value);
  return `${sign}${body}%`;
}

export function formatDateTime(ts: number): string {
  const d = new Date(ts * 1000);
  return d.toLocaleString(activeLocale(), {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatClock(ts: number): string {
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString(activeLocale(), { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/** Data curta (dd/mm/aaaa no pt-BR, mm/dd/yyyy em en) para cards compartilháveis. */
export function formatDateShort(date: Date): string {
  return date.toLocaleDateString(activeLocale(), { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Hora curta (hh:mm) para cards compartilháveis. */
export function formatTimeShort(date: Date): string {
  return date.toLocaleTimeString(activeLocale(), { hour: "2-digit", minute: "2-digit" });
}

export function timeAgo(tsSeconds: number): string {
  const diff = Math.max(0, Date.now() / 1000 - tsSeconds);
  const minutes = Math.floor(diff / 60);
  if (minutes < 1) return i18n.t("format.now");
  if (minutes < 60) return i18n.t("format.minAgo", { n: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return i18n.t("format.hoursAgo", { n: hours });
  const days = Math.floor(hours / 24);
  return i18n.t("format.daysAgo", { n: days });
}

export function isPositive(value: number | null | undefined): boolean {
  return (value ?? 0) >= 0;
}

/** Retorna a cor semântica do design system para uma variação. */
export function changeColorClass(value: number | null | undefined): string {
  return isPositive(value) ? "text-success" : "text-danger";
}
