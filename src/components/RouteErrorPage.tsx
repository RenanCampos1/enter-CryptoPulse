import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

/** Tela de erro amigável para rotas (errorElement). */
export function RouteErrorPage() {
  const { t } = useTranslation();
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? t("routeError.status", { status: error.status, statusText: error.statusText })
    : error instanceof Error
    ? error.message
    : t("routeError.generic");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/15 text-danger">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <div>
        <h1 className="font-display text-xl font-bold text-foreground">{t("routeError.title")}</h1>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{t("routeError.body", { message })}</p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow transition-colors hover:bg-primary/90"
      >
        <RotateCcw className="h-4 w-4" />
        {t("routeError.reload")}
      </button>
    </div>
  );
}
