import { useMemo } from "react";
import { CalendarDays, CalendarX2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSeo } from "@/lib/seo";
import { CALENDAR_EVENTS, EVENT_CATEGORY_KEYS, type CalendarEvent } from "@/data/events";
import { PageHeader } from "@/components/market/PageHeader";
import { activeLocale } from "@/lib/format";

export default function Calendar() {
  const { t } = useTranslation();
  useSeo({
    title: t("seo.calendarTitle"),
    description: t("seo.calendarDesc"),
    path: "/calendar",
  });

  const importanceBadge = (importance: CalendarEvent["importance"]) => {
    const cls =
      importance === "alta"
        ? "bg-danger/15 text-danger"
        : importance === "media"
        ? "bg-warning/15 text-warning"
        : "bg-card-secondary text-muted-foreground";
    const label =
      importance === "alta"
        ? t("calendar.importanceHigh")
        : importance === "media"
        ? t("calendar.importanceMedium")
        : t("calendar.importanceLow");
    return (
      <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{label}</span>
    );
  };

  const grouped = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of [...CALENDAR_EVENTS].sort((a, b) => a.date.localeCompare(b.date))) {
      const month = ev.date.slice(0, 7);
      const list = map.get(month) ?? [];
      list.push(ev);
      map.set(month, list);
    }
    return Array.from(map.entries());
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("calendar.pageTitle")}
        subtitle={t("calendar.subtitle")}
      />

      {grouped.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card p-10 text-center">
          <CalendarX2 className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t("calendar.empty")}</p>
        </div>
      ) : (
        grouped.map(([month, events]) => {
          const [year, mon] = month.split("-");
          const monthName = new Date(`${month}-01T00:00:00`).toLocaleDateString(activeLocale(), {
            month: "long",
            year: "numeric",
          });
          return (
            <section key={month} className="card-glow rounded-2xl border border-border/60 bg-card p-4 md:p-5">
              <div className="mb-3 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <h2 className="font-display text-base font-bold capitalize text-foreground">{monthName}</h2>
              </div>
              <ul className="divide-y divide-border/50">
                {events.map((ev) => {
                  const d = new Date(`${ev.date}T00:00:00`);
                  const isPast = ev.date < today;
                  return (
                    <li key={`${ev.date}-${ev.titleKey}`} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:gap-4">
                      <div className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-card-secondary py-2">
                        <span className="font-display text-xl font-bold text-foreground">
                          {d.getDate().toString().padStart(2, "0")}
                        </span>
                        <span className="text-[10px] uppercase text-muted-foreground">
                          {d.toLocaleDateString(activeLocale(), { month: "short" })}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className={`text-sm font-semibold ${isPast ? "text-muted-foreground" : "text-foreground"}`}>
                            {t(ev.titleKey)}
                          </h3>
                          {importanceBadge(ev.importance)}
                          <span className="rounded-md bg-card-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                            {t(EVENT_CATEGORY_KEYS[ev.category])}
                          </span>
                          {isPast ? (
                            <span className="text-[11px] text-muted-foreground/70">{t("calendar.completed")}</span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t(ev.descriptionKey)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })
      )}

      <p className="text-xs text-muted-foreground">{t("calendar.footnote")}</p>
    </div>
  );
}
