import { useRef, useState, type ReactNode } from "react";
import { Loader2, Share2, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { downloadNodeAsPng, shareNodeAsImage } from "@/lib/share";

export type ShareFormat = "1:1" | "9:16" | "16:9";

const FORMATS: ShareFormat[] = ["1:1", "9:16", "16:9"];

const ASPECT: Record<ShareFormat, string> = {
  "1:1": "1 / 1",
  "9:16": "9 / 16",
  "16:9": "16 / 9",
};

interface ShareCardProps {
  trigger: ReactNode;
  dialogTitle: string;
  dialogDescription?: string;
  fileName: string;
  shareText: string;
  /** Chave usada nos eventos de analytics. */
  analyticsKind: "market" | "coin" | "post";
  onShared?: (format: ShareFormat) => void;
  onDownloaded?: (format: ShareFormat) => void;
  children: (format: ShareFormat) => ReactNode;
}

export function ShareCard({
  trigger,
  dialogTitle,
  dialogDescription,
  fileName,
  shareText,
  analyticsKind,
  onShared,
  onDownloaded,
  children,
}: ShareCardProps) {
  const { t } = useTranslation();
  const [format, setFormat] = useState<ShareFormat>("1:1");
  const [busy, setBusy] = useState<"download" | "share" | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current || busy) return;
    setBusy("download");
    try {
      await downloadNodeAsPng(cardRef.current, fileName);
      onDownloaded?.(format);
    } catch (err) {
      console.error("download failed", err);
    } finally {
      setBusy(null);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current || busy) return;
    setBusy("share");
    try {
      const result = await shareNodeAsImage(cardRef.current, {
        title: dialogTitle,
        text: shareText,
        url: window.location.href,
      });
      if (result === "shared") onShared?.(format);
    } catch (err) {
      console.error("share failed", err);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-[520px] gap-4 border-border bg-card p-4 sm:p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="font-display text-lg">{dialogTitle}</DialogTitle>
          {dialogDescription ? <DialogDescription>{dialogDescription}</DialogDescription> : null}
        </DialogHeader>

        <div className="flex items-center justify-center gap-2 rounded-lg bg-card-secondary p-1">
          {FORMATS.map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={cn(
                "rounded-md px-4 py-1.5 text-xs font-medium transition-colors",
                format === f
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-xl border border-border/60">
          <div
            ref={cardRef}
            style={{ aspectRatio: ASPECT[format] }}
            className="w-full bg-background"
          >
            {children(format)}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="default"
            className="flex-1"
            onClick={handleDownload}
            disabled={busy !== null}
          >
            {busy === "download" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {t("share.downloadImage")}
          </Button>
          <Button
            variant="outline-muted"
            className="flex-1"
            onClick={handleShare}
            disabled={busy !== null}
          >
            {busy === "share" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            {t("share.share")}
          </Button>
        </div>
        <p className="text-center text-[11px] text-muted-foreground">
          {analyticsKind === "post" ? "" : t("brand.shareFooter")}
        </p>
      </DialogContent>
    </Dialog>
  );
}
