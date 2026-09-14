import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="font-display text-7xl font-bold text-foreground">
        4<span className="gradient-primary bg-clip-text text-transparent">0</span>4
      </div>
      <p className="max-w-md text-sm text-muted-foreground">{t("notFound.title")}</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow transition-colors hover:bg-primary/90"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("notFound.backHome")}
      </Link>
    </div>
  );
};

export default NotFound;
