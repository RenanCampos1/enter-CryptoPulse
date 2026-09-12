import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-session-id",
};

const MODEL = "deepseek/deepseek-v4-flash";
const API_BASE = "https://api.enter.pro";
const PROJECT_ID = "fb1960f3b246417ea7c958724046dec0";
const SECRET_NAME = "AI_API_TOKEN_fb1960f3b246";

interface NewsItem {
  id: string;
  title: string;
  body: string;
  source: string;
  published_at: number;
  url: string;
}

interface SummaryRow {
  news_id: string;
  title: string;
  summary: string;
  impact: "positivo" | "neutro" | "negativo";
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function extractJsonArray(text: string): unknown[] | null {
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    const arrMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrMatch) {
      const inner = JSON.parse(arrMatch[0]);
      if (Array.isArray(inner)) return inner;
    }
  } catch {
    /* fallthrough */
  }
  return null;
}

async function generateSummaries(items: NewsItem[]): Promise<SummaryRow[]> {
  const AI_API_TOKEN = Deno.env.get(SECRET_NAME);
  if (!AI_API_TOKEN) {
    console.error("summarize-news: missing AI token");
    return [];
  }

  const system =
    "Você é um analista do mercado de criptomoedas do site CryptoPulse. " +
    "Para cada notícia fornecida, escreva um resumo em português do Brasil com 2 a 3 frases " +
    "respondendo à pergunta 'O que aconteceu?', e classifique o impacto potencial no mercado de " +
    "criptomoedas como positivo, neutro ou negativo. " +
    "IMPORTANTE: nunca apresente isso como recomendação de compra ou venda; é apenas conteúdo informativo. " +
    "Responda SOMENTE com um array JSON, um objeto por notícia, na mesma ordem, no formato: " +
    '[{"news_id":"...","summary":"...","impact":"positivo|neutro|negativo"}]';

  const user = JSON.stringify(
    items.map((i) => ({
      news_id: i.id,
      title: i.title,
      source: i.source,
      body: (i.body || "").slice(0, 600),
    })),
  );

  const response = await fetch(`${API_BASE}/code/api/v1/ai/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AI_API_TOKEN}`,
      "Content-Type": "application/json",
      "X-Session-ID": "cryptopulse-news-summary",
      "X-Enter-Project-ID": PROJECT_ID,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      stream: false,
      temperature: 0.2,
      max_tokens: 2500,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("summarize-news: LLM error", response.status, text.slice(0, 500));
    return [];
  }

  const data = await response.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";
  const parsed = extractJsonArray(content);
  if (!parsed) {
    console.error("summarize-news: could not parse LLM output", content.slice(0, 300));
    return [];
  }

  const byId = new Map(items.map((i) => [i.id, i]));
  const rows: SummaryRow[] = [];
  for (const entry of parsed) {
    const rec = entry as Partial<SummaryRow>;
    const item = byId.get(String(rec.news_id ?? ""));
    if (!item || !rec.summary) continue;
    const impact =
      rec.impact === "positivo" || rec.impact === "neutro" || rec.impact === "negativo"
        ? rec.impact
        : "neutro";
    rows.push({ news_id: item.id, title: item.title, summary: String(rec.summary).trim(), impact });
  }
  return rows;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Método não permitido" }, 405);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const body = await req.json();
    const items: NewsItem[] = Array.isArray(body?.items) ? body.items.slice(0, 12) : [];
    if (items.length === 0) {
      return json({ summaries: [], generated: 0 });
    }

    const ids = items.map((i) => i.id);
    const { data: cached, error: selectError } = await supabase
      .from("news_summaries")
      .select("news_id, title, summary, impact")
      .in("news_id", ids);

    if (selectError) {
      console.error("summarize-news: select error", selectError.message);
      return json({ error: "Falha ao consultar resumos." }, 500);
    }

    const cachedMap = new Map<string, SummaryRow>();
    for (const row of cached ?? []) {
      cachedMap.set(row.news_id, row);
    }

    const missing = items.filter((i) => !cachedMap.has(i.id));
    let generated = 0;
    if (missing.length > 0) {
      const fresh = await generateSummaries(missing);
      if (fresh.length > 0) {
        const { error: upsertError } = await supabase
          .from("news_summaries")
          .upsert(fresh, { onConflict: "news_id", ignoreDuplicates: true });
        if (upsertError) {
          console.error("summarize-news: upsert error", upsertError.message);
        }
        for (const row of fresh) cachedMap.set(row.news_id, row);
        generated = fresh.length;
      }
    }

    const summaries = items
      .filter((i) => cachedMap.has(i.id))
      .map((i) => {
        const row = cachedMap.get(i.id)!;
        return { news_id: row.news_id, summary: row.summary, impact: row.impact };
      });

    return json({ summaries, generated });
  } catch (err) {
    console.error("summarize-news: unexpected error", err);
    return json({ error: "Erro interno." }, 500);
  }
});
