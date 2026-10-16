import QRCode from 'qrcode';
import { BajajVehicle } from '../types';

/**
 * The text encoded in a vehicle's QR sticker: "DID|PLATE|PERMIT".
 * The mobile app reads the Digital ID from the first segment, so every
 * vehicle gets a scannable code even if qr_code_value was never stored.
 */
export function qrPayload(v: BajajVehicle): string {
  const stored = v.qrCodeValue?.trim();
  if (stored) return stored;
  return [v.digitalId, v.plateNumber, v.permitNo].map((s) => (s || '').trim()).join('|');
}

/** Black-on-white PNG data URL — highest contrast for phone cameras. */
export function qrDataUrl(v: BajajVehicle, width = 320): Promise<string> {
  return QRCode.toDataURL(qrPayload(v), {
    errorCorrectionLevel: 'M',
    margin: 2,
    width,
    color: { dark: '#000000', light: '#ffffff' },
  });
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

/**
 * Opens a print-ready sheet of QR cards (one per vehicle) in a new tab and
 * starts the browser print dialog. Must be called from a click handler so
 * the popup is not blocked.
 */
export async function printQrCards(vehicles: BajajVehicle[]): Promise<void> {
  const win = window.open('', '_blank');
  if (!win) throw new Error('Popup blocked — allow popups for this site to print QR cards.');
  win.document.write('<p style="font-family:sans-serif">Generating QR codes…</p>');

  const urls = await Promise.all(vehicles.map((v) => qrDataUrl(v, 360)));
  const cards = vehicles
    .map(
      (v, i) => `
      <div class="card">
        <div class="head">ጎንደር ከተማ ትራንስፖርት · GONDAR TRAFFIC</div>
        <img src="${urls[i]}" alt="QR" />
        <div class="plate">${escapeHtml(v.plateNumber)}</div>
        <div class="did">${escapeHtml(v.digitalId)}</div>
        <div class="name">${escapeHtml(v.driverName || v.owner)}</div>
        <div class="meta">${escapeHtml(v.permitNo)} · Exp ${escapeHtml(v.expiryDate)}</div>
      </div>`
    )
    .join('');

  win.document.open();
  win.document.write(`<!doctype html><html><head><meta charset="utf-8" />
<title>QR Cards (${vehicles.length})</title>
<style>
  @page { size: A4; margin: 10mm; }
  body { margin: 0; font-family: 'Noto Sans Ethiopic', 'Nyala', system-ui, sans-serif; color: #0f172a; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6mm; }
  .card { border: 1.5px dashed #64748b; border-radius: 8px; padding: 4mm; text-align: center; break-inside: avoid; }
  .head { font-size: 9px; font-weight: 700; color: #0c355b; margin-bottom: 2mm; }
  img { width: 45mm; height: 45mm; image-rendering: pixelated; }
  .plate { font: 900 16px monospace; margin-top: 1mm; }
  .did { font: 700 11px monospace; color: #1d4ed8; }
  .name { font-size: 11px; font-weight: 600; margin-top: 1mm; }
  .meta { font: 9px monospace; color: #475569; }
</style></head>
<body><div class="grid">${cards}</div>
<script>window.onload = function () { setTimeout(function () { window.print(); }, 200); };</script>
</body></html>`);
  win.document.close();
}
