import { ArrowUpRight, ArrowDownRight, Minus, ExternalLink, Sparkles } from "lucide-react";
import { useNewsSummaries } from "@/lib/hooks";
import { timeAgo } from "@/lib/format";
import { trackNewsClick } from "@/lib/analytics";
import type { NewsArticle, NewsSummary } from "@/lib/api/types";

function ImpactBadge({ impact }: { impact: NewsSummary["impact"] }) {
  const config = {
    positivo: { icon: ArrowUpRight, cls: "bg-success/15 text-success", label: "Positivo" },
    neutro: { icon: Minus, cls: "bg-muted text-muted-foreground", label: "Neutro" },
    negativo: { icon: ArrowDownRight, cls: "bg-danger/15 text-danger", label: "Negativo" },
  }[impact];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${config.cls}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

export function NewsList({
  articles,
  showSummaries = true,
  limit,
  className,
}: {
  articles: NewsArticle[];
  showSummaries?: boolean;
  limit?: number;
  className?: string;
}) {
  const { data: summaries } = useNewsSummaries(showSummaries ? articles : []);
  const list = limit ? articles.slice(0, limit) : articles;

  return (
    <div className={`grid gap-3 md:grid-cols-2 xl:grid-cols-3 ${className ?? ""}`}>
      {list.map((article) => {
        const summary = summaries?.[article.id];
        const categories = (article.categories ?? "")
          .split("|")
          .filter((c) => c.trim())
          .slice(0, 3);

        return (
          <article
            key={article.id}
            className="card-glow group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:-translate-y-0.5"
            onClick={() => {
              trackNewsClick(article.source, article.categories?.split("|")[0] ?? "");
              window.open(article.url, "_blank", "noopener,noreferrer");
            }}
          >
            {article.imageurl ? (
              <div className="relative h-40 overflow-hidden bg-card-secondary">
                <img
                  src={article.imageurl}
                  alt={article.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              </div>
            ) : null}

            <div className="flex flex-1 flex-col p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground/70">{article.source}</span>
                <span>·</span>
                <span>{timeAgo(article.published_on)}</span>
                {categories.map((c) => (
                  <span key={c} className="rounded-md bg-card-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                    {c}
                  </span>
                ))}
              </div>

              <h3 className="font-display line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
                {article.title}
              </h3>

              {summary && (
                <div className="mt-3 rounded-xl bg-card-secondary/70 p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                      <Sparkles className="h-3 w-3" /> O que aconteceu?
                    </span>
                    <ImpactBadge impact={summary.impact} />
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{summary.summary}</p>
                </div>
              )}

              <div className="mt-auto flex items-center gap-1 pt-3 text-xs text-muted-foreground">
                Ler notícia completa
                <ExternalLink className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
