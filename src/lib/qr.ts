"use client";

/** Client-side QR helpers built on the `qrcode` package (dynamic import). */

export async function qrPngDataUrl(text: string, size = 512): Promise<string> {
  const QR = (await import("qrcode")).default;
  return QR.toDataURL(text, {
    width: size,
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: "#0A0A0B", light: "#FFFFFF" },
  });
}

export async function qrSvgString(text: string): Promise<string> {
  const QR = (await import("qrcode")).default;
  return QR.toString(text, {
    type: "svg",
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: "#0A0A0B", light: "#FFFFFF" },
  });
}

function triggerDownload(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.click();
}

export async function downloadQrPng(text: string, name: string, size = 1024) {
  const url = await qrPngDataUrl(text, size);
  triggerDownload(url, `${name}.png`);
}

export async function downloadQrSvg(text: string, name: string) {
  const svg = await qrSvgString(text);
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${name}.svg`);
  URL.revokeObjectURL(url);
}

/**
 * High-resolution branded print poster (2480×3508 ~ A4 @300dpi portrait).
 * Pink frame, brand wordmark, Arabic call-to-action, centered QR.
 */
export async function downloadQrPrint(text: string, name: string, campaignLabel: string) {
  const QR = (await import("qrcode")).default;
  const W = 2480;
  const H = 3508;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#0A0A0B";
  ctx.fillRect(0, 0, W, H);
  // Inner white panel
  const pad = 140;
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, pad, pad, W - pad * 2, H - pad * 2, 60);
  ctx.fill();
  // Pink frame
  ctx.strokeStyle = "#E14FA0";
  ctx.lineWidth = 18;
  roundRect(ctx, pad, pad, W - pad * 2, H - pad * 2, 60);
  ctx.stroke();

  // Brand wordmark
  ctx.textAlign = "center";
  ctx.fillStyle = "#0A0A0B";
  ctx.font = "900 190px Cairo, Arial, sans-serif";
  ctx.fillText("WEFIT", W / 2 - 150, 620);
  ctx.fillStyle = "#E14FA0";
  ctx.fillText("Ladies", W / 2 + 320, 620);

  // Headline
  ctx.fillStyle = "#0A0A0B";
  ctx.font = "800 150px Cairo, Arial, sans-serif";
  ctx.fillText("رحلتك تبدأ من هنا", W / 2, 900);
  ctx.font = "500 92px Cairo, Arial, sans-serif";
  ctx.fillStyle = "#52525B";
  ctx.fillText("امسحي الرمز وسجّلي اهتمامك", W / 2, 1050);

  // QR
  const qrSize = 1500;
  const qrCanvas = document.createElement("canvas");
  await QR.toCanvas(qrCanvas, text, {
    width: qrSize,
    margin: 1,
    errorCorrectionLevel: "H",
    color: { dark: "#0A0A0B", light: "#FFFFFF" },
  });
  ctx.drawImage(qrCanvas, (W - qrSize) / 2, 1250);

  // Footer: campaign label + site
  ctx.fillStyle = "#E14FA0";
  ctx.font = "700 90px Cairo, Arial, sans-serif";
  ctx.fillText(campaignLabel, W / 2, 3050);
  ctx.fillStyle = "#A1A1AA";
  ctx.font = "500 64px Cairo, Arial, sans-serif";
  ctx.fillText("المهدية — الرياض · نحن اللياقة", W / 2, 3170);

  triggerDownload(canvas.toDataURL("image/png"), `${name}-print.png`);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
