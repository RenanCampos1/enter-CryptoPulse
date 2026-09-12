// Calendário cripto — eventos reais com datas oficiais publicadas
// (FOMC/Fed e divulgações do BLS). Não contém dados fabricados.
// Token unlocks e eventos de protocolos serão adicionados quando houver
// fonte de dados oficial disponível.

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
  title: string;
  category: EventCategory;
  importance: "alta" | "media" | "baixa";
  description: string;
}

export const CALENDAR_EVENTS: CalendarEvent[] = [
  {
    date: "2026-09-15",
    title: "Reunião do FOMC (Fed)",
    category: "Juros",
    importance: "alta",
    description:
      "Reunião do Comitê Federal de Mercado Aberto dos EUA (15–16 de set). Decisão de juros e comunicado. Movimenta fortemente criptomoedas e ativos de risco.",
  },
  {
    date: "2026-10-14",
    title: "CPI dos EUA (Setembro)",
    category: "Macro",
    importance: "alta",
    description:
      "Divulgação do Índice de Preços ao Consumidor (CPI) dos EUA referente a setembro, 8h30 (ET). Dado central para expectativas de juros.",
  },
  {
    date: "2026-10-15",
    title: "PPI dos EUA (Setembro)",
    category: "Macro",
    importance: "media",
    description:
      "Divulgação do Índice de Preços ao Produtor (PPI) dos EUA referente a setembro, 8h30 (ET). Sinal de pressão inflacionária na cadeia produtiva.",
  },
  {
    date: "2026-10-27",
    title: "Reunião do FOMC (Fed)",
    category: "Juros",
    importance: "alta",
    description:
      "Reunião do FOMC (27–28 de out). Decisão de juros e coletiva. Alto impacto em ativos de risco.",
  },
  {
    date: "2026-11-13",
    title: "PPI dos EUA (Outubro)",
    category: "Macro",
    importance: "media",
    description:
      "Divulgação do PPI dos EUA referente a outubro, 8h30 (ET). Indicador de inflação na indústria.",
  },
  {
    date: "2026-12-08",
    title: "Reunião do FOMC (Fed)",
    category: "Juros",
    importance: "alta",
    description:
      "Última reunião do FOMC de 2026 (8–9 de dez), com atualização das Projeções Econômicas (SEP) e coletiva do presidente. Data de alta volatilidade.",
  },
  {
    date: "2026-12-15",
    title: "PPI dos EUA (Novembro)",
    category: "Macro",
    importance: "media",
    description:
      "Divulgação do PPI dos EUA referente a novembro. Último indicador de inflação relevante do ano.",
  },
];

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  Macro: "Macro",
  Juros: "Juros",
  Regulação: "Regulação",
  Protocolo: "Protocolo",
  Unlock: "Token Unlock",
  ETF: "ETF",
  Outro: "Outro",
};
