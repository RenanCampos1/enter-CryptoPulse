// Calendário cripto — eventos reais com datas oficiais publicadas
// (FOMC/Fed e divulgações do BLS). Não contém dados fabricados.
// Token unlocks e eventos de protocolos serão adicionados quando houver
// fonte de dados oficial disponível.
//
// Títulos e descrições ficam em public/locales/{lang}.json sob o namespace
// events.* (chaves titleKey/descriptionKey).

export type EventCategory =
  | "Macro"
  | "Juros"
  | "Regulação"
  | "Protocolo"
  | "Unlock"
  | "ETF"
  | "Outro";

export interface CalendarEvent {
  date: string; // ISO yyyy-mm-dd
  titleKey: string;
  category: EventCategory;
  importance: "alta" | "media" | "baixa";
  descriptionKey: string;
}

export const CALENDAR_EVENTS: CalendarEvent[] = [
  {
    date: "2026-09-15",
    titleKey: "events.e1.title",
    category: "Juros",
    importance: "alta",
    descriptionKey: "events.e1.description",
  },
  {
    date: "2026-10-14",
    titleKey: "events.e2.title",
    category: "Macro",
    importance: "alta",
    descriptionKey: "events.e2.description",
  },
  {
    date: "2026-10-15",
    titleKey: "events.e3.title",
    category: "Macro",
    importance: "media",
    descriptionKey: "events.e3.description",
  },
  {
    date: "2026-10-27",
    titleKey: "events.e4.title",
    category: "Juros",
    importance: "alta",
    descriptionKey: "events.e4.description",
  },
  {
    date: "2026-11-13",
    titleKey: "events.e5.title",
    category: "Macro",
    importance: "media",
    descriptionKey: "events.e5.description",
  },
  {
    date: "2026-12-08",
    titleKey: "events.e6.title",
    category: "Juros",
    importance: "alta",
    descriptionKey: "events.e6.description",
  },
  {
    date: "2026-12-15",
    titleKey: "events.e7.title",
    category: "Macro",
    importance: "media",
    descriptionKey: "events.e7.description",
  },
];

/** Categoria → chave i18n (traduzida em public/locales/{lang}.json). */
export const EVENT_CATEGORY_KEYS: Record<EventCategory, string> = {
  Macro: "events.category.macro",
  Juros: "events.category.juros",
  Regulação: "events.category.regulacao",
  Protocolo: "events.category.protocolo",
  Unlock: "events.category.unlock",
  ETF: "events.category.etf",
  Outro: "events.category.outro",
};
