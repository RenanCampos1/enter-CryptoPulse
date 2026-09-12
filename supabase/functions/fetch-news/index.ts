import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-session-id",
};

const CACHE_TTL_MS = 5 * 60 * 1000;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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
    const apiKey = Deno.env.get("CRYPTOCOMPARE_API_KEY") ?? "";

    const body = await req.json().catch(() => ({}));
    const lang = String(body?.lang ?? "EN");
    const limit = String(body?.limit ?? 30);
    const categories = String(body?.categories ?? "");
    const cacheKey = `${lang}-${limit}-${categories}`;

    // Cache no banco (5 min) para evitar chamadas excessivas à fonte.
    const { data: cached } = await supabase
      .from("news_cache")
      .select("payload, fetched_at")
      .eq("cache_key", cacheKey)
      .maybeSingle();

    if (cached && Date.now() - new Date(cached.fetched_at as string).getTime() < CACHE_TTL_MS) {
      return json({ Data: cached.payload });
    }

    const params = new URLSearchParams({
      lang,
      limit,
      sortOrder: "latest",
      excludeCategories: "Sponsored",
    });
    if (categories) params.set("categories", categories);
    if (apiKey) {
      params.set("api_key", apiKey);
    } else {
      console.error("fetch-news: CRYPTOCOMPARE_API_KEY não configurada");
    }

    const res = await fetch(`https://min-api.cryptocompare.com/data/v2/news/?${params.toString()}`, {
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.error("fetch-news: upstream error", res.status);
      return json({ error: `Fonte de notícias indisponível (${res.status})` }, 502);
    }

    const data = await res.json();
    const articles = data?.Data ?? [];

    await supabase
      .from("news_cache")
      .upsert(
        { cache_key: cacheKey, payload: articles, fetched_at: new Date().toISOString() },
        { onConflict: "cache_key" },
      );

    return json({ Data: articles });
  } catch (err) {
    console.error("fetch-news: unexpected error", err);
    return json({ error: "Erro interno." }, 500);
  }
});
