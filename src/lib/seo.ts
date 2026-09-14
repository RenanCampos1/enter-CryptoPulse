import { useEffect } from "react";
import i18n from "@/i18n/config";

interface SeoOptions {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Aplica SEO client-side (SPA): título, description, Open Graph e canonical.
 * O sitemap estático cobre as rotas principais para indexação.
 */
export function useSeo({ title, description, path = "/", image, type = "website" }: SeoOptions) {
  useEffect(() => {
    const origin = window.location.origin;
    const url = `${origin}${path}`;

    document.title = title;
    upsertMeta("name", "description", description ?? "");
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description ?? "");
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:site_name", "CryptoPulse");
    upsertMeta("property", "og:image", image ?? "https://cdn.enter.pro/resources/uid_100541343/cryptopulse-og_78528c41.png");
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description ?? "");
    upsertMeta("name", "twitter:image", image ?? "https://cdn.enter.pro/resources/uid_100541343/cryptopulse-og_78528c41.png");

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);
  }, [title, description, path, image, type]);
}

export const siteName = "CryptoPulse";

/** Tagline do site no idioma ativo. */
export function siteTagline(): string {
  return i18n.t("seo.tagline");
}

export function coinSeoTitle(name: string, symbol: string): string {
  return i18n.t("seo.coinTitle", { name, symbol, site: siteName });
}
