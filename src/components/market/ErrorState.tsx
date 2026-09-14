import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ErrorState({
  message,
  lastUpdated,
  className,
}: {
  message?: string;
  lastUpdated?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const resolvedMessage = message ?? t("errorState.defaultMessage");

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-card-secondary/50 px-4 py-10 text-center ${className ?? ""}`}
    >
      <AlertTriangle className="h-6 w-6 text-warning" />
      <p className="max-w-sm text-sm text-muted-foreground">{resolvedMessage}</p>
      {lastUpdated ? (
        <p className="text-xs text-muted-foreground/70">{t("errorState.lastUpdated", { time: lastUpdated })}</p>
      ) : null}
    </div>
  );
}
