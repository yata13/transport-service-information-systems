import React, { useEffect, useState } from 'react';
import { X, Printer, Download, QrCode } from 'lucide-react';
import { BajajVehicle } from '../types';
import { qrDataUrl, qrPayload, printQrCards } from '../lib/qr';

interface QrCardModalProps {
  vehicle: BajajVehicle;
  onClose: () => void;
}

/** Shows one driver's QR sticker — scannable by the mobile app's camera scanner. */
export const QrCardModal: React.FC<QrCardModalProps> = ({ vehicle, onClose }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    qrDataUrl(vehicle, 480).then(setUrl).catch(() => setUrl(''));
  }, [vehicle]);

  const download = () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR_${vehicle.plateNumber.replace(/[^A-Za-z0-9-]/g, '_')}.png`;
    a.click();
  };

  const print = () => {
    setError(null);
    printQrCards([vehicle]).catch((e) => setError(e instanceof Error ? e.message : String(e)));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 bg-[#0C355B] text-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold">
            <QrCode size={18} className="text-blue-300" />
            የአሽከርካሪ QR ኮድ (Driver QR Code)
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-md cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 text-center space-y-2">
          {url ? (
            <img src={url} alt={`QR ${vehicle.plateNumber}`} className="w-56 h-56 mx-auto border border-slate-200 rounded-lg" />
          ) : (
            <div className="w-56 h-56 mx-auto bg-slate-100 rounded-lg animate-pulse" />
          )}
          <div className="font-mono font-black text-lg text-slate-900">{vehicle.plateNumber}</div>
          <div className="font-mono font-bold text-xs text-blue-700">{vehicle.digitalId}</div>
          <div className="text-sm font-semibold text-slate-800">{vehicle.driverName || vehicle.owner}</div>
          <div className="text-[10px] text-slate-400 font-mono break-all">{qrPayload(vehicle)}</div>
          <p className="text-[11px] text-slate-500">
            በሞባይል መተግበሪያው "Scan QR with Camera" ይቃኙ (Scan with the mobile app's camera scanner)
          </p>
          {error && <p className="text-[11px] text-red-600 font-semibold">{error}</p>}
        </div>

        <div className="p-3 bg-slate-100 border-t border-slate-200 flex gap-2">
          <button
            onClick={print}
            disabled={!url}
            className="flex-1 py-2 bg-[#0C355B] hover:bg-[#092B4B] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Printer size={15} /> አትም (Print)
          </button>
          <button
            onClick={download}
            disabled={!url}
            className="flex-1 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download size={15} /> PNG አውርድ
          </button>
        </div>
      </div>
    </div>
  );
};
