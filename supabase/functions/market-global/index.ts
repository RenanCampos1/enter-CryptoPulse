import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-session-id",
};

const CACHE_KEY = "coingecko-global-v2";
const CACHE_TTL_MS = 45 * 1000;

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

    // Cache curto no banco: evita rate-limit do CoinGecko com tráfego alto.
    const { data: cached } = await supabase
      .from("news_cache")
      .select("payload, fetched_at")
      .eq("cache_key", CACHE_KEY)
      .maybeSingle();

    if (cached && Date.now() - new Date(cached.fetched_at as string).getTime() < CACHE_TTL_MS) {
      return json(cached.payload);
    }

    const res = await fetch("https://api.coingecko.com/api/v3/global", {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.error("market-global: upstream error", res.status);
      return json({ error: "Dados de mercado indisponíveis." }, 502);
    }

    const data = await res.json();
    // A CoinGecko envolve /global em { data: {...} }; desembrulha antes de cachear.
    const payload = data?.data ?? data;

    await supabase
      .from("news_cache")
      .upsert(
        { cache_key: CACHE_KEY, payload, fetched_at: new Date().toISOString() },
        { onConflict: "cache_key" },
      );

    return json(payload);
  } catch (err) {
    console.error("market-global: unexpected error", err);
    return json({ error: "Erro interno." }, 500);
  }
});
