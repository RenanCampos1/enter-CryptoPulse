import { AlertTriangle } from "lucide-react";

export function ErrorState({
  message = "Dados temporariamente indisponíveis.",
  lastUpdated,
  className,
}: {
  message?: string;
  lastUpdated?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-card-secondary/50 px-4 py-10 text-center ${className ?? ""}`}
    >
      <AlertTriangle className="h-6 w-6 text-warning" />
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {lastUpdated ? (
        <p className="text-xs text-muted-foreground/70">Última atualização: {lastUpdated}</p>
      ) : null}
    </div>
  );
}
