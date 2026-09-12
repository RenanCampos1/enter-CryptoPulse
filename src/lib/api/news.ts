// Notícias cripto — buscadas via função de backend (fetch-news), que chama a
// fonte externa (CryptoCompare) com a chave guardada como segredo e aplica cache.
import { supabase } from "@/integrations/supabase/client";
import type { NewsArticle } from "./types";

export async function getNews(lang = "EN", count = 30, categories?: string): Promise<NewsArticle[]> {
  const { data, error } = await supabase.functions.invoke("fetch-news", {
    body: { lang, limit: count, categories },
    headers: { "Content-Type": "application/json" },
  });

  if (error) {
    throw new Error(error.message ?? "News API error");
  }
  return (data?.Data ?? []) as NewsArticle[];
}
