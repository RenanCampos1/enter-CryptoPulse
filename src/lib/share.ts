import html2canvas from "html2canvas";

export interface SharePayload {
  title: string;
  text: string;
  url?: string;
}

/** Captura um nó do DOM como PNG (dataURL). html2canvas é carregado sob demanda. */
export async function captureNodeAsPng(node: HTMLElement): Promise<string> {
  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(node, {
    backgroundColor: "#080B10",
    scale: 2,
    useCORS: true,
    logging: false,
  });
  return canvas.toDataURL("image/png");
}

/** Renderiza um nó do DOM como PNG e baixa. */
export async function downloadNodeAsPng(node: HTMLElement, fileName: string): Promise<void> {
  const dataUrl = await captureNodeAsPng(node);
  const link = document.createElement("a");
  link.download = `${fileName}.png`;
  link.href = dataUrl;
  link.click();
}

/** Web Share API com fallback para copiar o link. */
export async function shareContent(payload: SharePayload): Promise<"shared" | "copied" | "unsupported"> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title: payload.title,
        text: payload.text,
        url: payload.url ?? window.location.href,
      });
      return "shared";
    } catch {
      return "unsupported";
    }
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(`${payload.title}\n${payload.text}\n${payload.url ?? window.location.href}`);
    return "copied";
  }
  return "unsupported";
}

/** Captura a imagem do card e compartilha (arquivo) ou copia o texto como fallback. */
export async function shareNodeAsImage(node: HTMLElement, payload: SharePayload): Promise<"shared" | "copied" | "unsupported"> {
  try {
    const dataUrl = await captureNodeAsPng(node);
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], `${payload.title}.png`, { type: "image/png" });

    if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: payload.title,
        text: payload.text,
        url: payload.url ?? window.location.href,
      });
      return "shared";
    }
  } catch {
    // fallback abaixo
  }

  return shareContent(payload);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export const SITE_URL_LABEL = "CryptoPulse.com";
