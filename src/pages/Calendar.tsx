import { useMemo } from "react";
import { CalendarDays, CalendarX2 } from "lucide-react";
import { useSeo } from "@/lib/seo";
import { CALENDAR_EVENTS, EVENT_CATEGORY_LABELS, type CalendarEvent, type EventCategory } from "@/data/events";
import { PageHeader } from "@/components/market/PageHeader";

function importanceBadge(importance: CalendarEvent["importance"]) {
  const cls =
    importance === "alta"
      ? "bg-danger/15 text-danger"
      : importance === "media"
      ? "bg-warning/15 text-warning"
      : "bg-card-secondary text-muted-foreground";
  const label = importance === "alta" ? "Alta" : importance === "media" ? "Média" : "Baixa";
  return (
    <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{label}</span>
  );
}

export default function Calendar() {
  useSeo({
    title: "Calendário Cripto 2026 — FOMC, CPI, PPI e Eventos | CryptoPulse",
    description:
      "Calendário de eventos que movem o mercado cripto: reuniões do FOMC, CPI, PPI e outros indicadores macro com datas oficiais.",
    path: "/calendar",
  });

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
        title="Calendário Cripto"
        subtitle="Eventos oficiais que costumam movimentar o mercado. As datas são reais e publicadas pelas fontes (Fed e BLS)."
      />

      {grouped.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card p-10 text-center">
          <CalendarX2 className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Nenhum evento agendado por enquanto.</p>
        </div>
      ) : (
        grouped.map(([month, events]) => {
          const [year, mon] = month.split("-");
          const monthName = new Date(`${month}-01T00:00:00`).toLocaleDateString("pt-BR", {
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
                    <li key={`${ev.date}-${ev.title}`} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:gap-4">
                      <div className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-card-secondary py-2">
                        <span className="font-display text-xl font-bold text-foreground">
                          {d.getDate().toString().padStart(2, "0")}
                        </span>
                        <span className="text-[10px] uppercase text-muted-foreground">
                          {d.toLocaleDateString("pt-BR", { month: "short" })}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className={`text-sm font-semibold ${isPast ? "text-muted-foreground" : "text-foreground"}`}>
                            {ev.title}
                          </h3>
                          {importanceBadge(ev.importance)}
                          <span className="rounded-md bg-card-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                            {EVENT_CATEGORY_LABELS[ev.category as EventCategory]}
                          </span>
                          {isPast ? (
                            <span className="text-[11px] text-muted-foreground/70">concluído</span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{ev.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })
      )}

      <p className="text-xs text-muted-foreground">
        Token unlocks e atualizações de protocolos serão exibidos aqui assim que houver uma fonte de
        dados oficial disponível.
      </p>
    </div>
  );
}
