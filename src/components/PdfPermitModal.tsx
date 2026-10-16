import React, { useEffect, useState } from 'react';
import { X, Printer, Download, CheckCircle, ShieldCheck, Phone, MapPin, User } from 'lucide-react';
import { BajajVehicle } from '../types';
import { ShieldLogo } from './ShieldLogo';
import { qrDataUrl } from '../lib/qr';

interface PdfPermitModalProps {
  vehicle: BajajVehicle;
  onClose: () => void;
}

export const PdfPermitModal: React.FC<PdfPermitModalProps> = ({ vehicle, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const primaryPhone = vehicle.driverPhone || vehicle.ownerPhone;

  const [qrUrl, setQrUrl] = useState('');
  useEffect(() => {
    qrDataUrl(vehicle, 240).then(setQrUrl).catch(() => setQrUrl(''));
  }, [vehicle]);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-4 py-3 bg-[#0C355B] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-blue-300" />
            <span className="text-xs font-bold">የባጃጅ ፈቃድ ሰነድ (Official Permit PDF)</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-md"
          >
            <X size={18} />
          </button>
        </div>

        {/* Printable Official Document */}
        <div className="p-4 overflow-y-auto space-y-3.5 text-slate-800 bg-[#FBFBFA]">
          {/* Document Header */}
          <div className="border-b-2 border-blue-900 pb-3 text-center relative">
            <div className="flex justify-center mb-1">
              <ShieldLogo size={48} />
            </div>
            <h2 className="text-xs font-bold text-[#0C355B] uppercase tracking-wide">
              የኢትዮጵያ ፌዴራላዊ ዴሞክራሲያዊ ሪፐብሊክ
            </h2>
            <h3 className="text-[11px] font-bold text-slate-900">
              የአማራ ብሔራዊ ክልላዊ መንግሥት · የጎንደር ከተማ አስተዳደር
            </h3>
            <p className="text-[10px] text-blue-900 font-bold">
              የመንገድ ትራንስፖርት እና ትራፊክ መምሪያ
            </p>
            <div className="inline-block mt-1 px-2.5 py-0.5 bg-blue-100/80 border border-blue-300 rounded text-[10px] font-black text-blue-950 uppercase">
              የከተማ ባጃጅ የትራንስፖርት አገልግሎት ፈቃድ ሰርተፊኬት
            </div>
          </div>

          {/* Photo & Quick Contact Header */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-3">
            {vehicle.driverPhoto ? (
              <img
                src={vehicle.driverPhoto}
                alt={vehicle.driverName || vehicle.owner}
                className="w-16 h-16 rounded-lg object-cover border border-slate-300 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0">
                <User size={24} />
                <span className="text-[8px]">ፎቶ</span>
              </div>
            )}
            <div className="min-w-0 flex-1 text-[11px]">
              <div className="font-bold text-slate-900 truncate">
                {vehicle.driverName || vehicle.owner}
              </div>
              <div className="text-[10px] text-slate-600">
                ስልክ (Phone): <span className="font-mono font-bold text-slate-900">{primaryPhone}</span>
              </div>
              <div className="text-[10px] text-slate-600 truncate">
                ቀበሌ / አድራሻ: <span className="font-bold text-[#0C355B]">{vehicle.kebele || 'ቀበሌ 03'}</span> ({vehicle.address || 'ጎንደር'})
              </div>
            </div>
          </div>

          {/* Permit Meta */}
          <div className="grid grid-cols-2 gap-2 text-[10px] bg-white p-2.5 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block">የፈቃድ ቁጥር (Permit No):</span>
              <span className="font-mono font-bold text-slate-900">{vehicle.permitNo}</span>
            </div>
            <div>
              <span className="text-slate-500 block">ዲጂታል መታወቂያ (Digital ID):</span>
              <span className="font-mono font-bold text-blue-700">{vehicle.digitalId}</span>
            </div>
            <div>
              <span className="text-slate-500 block">የተሰጠበት ቀን (Issue Date):</span>
              <span className="font-mono font-medium text-slate-800">{vehicle.issueDate}</span>
            </div>
            <div>
              <span className="text-slate-500 block">የሚያበቃበት ቀን (Expiry Date):</span>
              <span className="font-mono font-bold text-slate-900">{vehicle.expiryDate}</span>
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-1.5 text-[11px]">
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="text-slate-500">የሰሌዳ ቁጥር (Plate):</span>
              <span className="font-bold text-blue-900 font-mono">{vehicle.plateNumber}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="text-slate-500">ተሽከርካሪ አይነት / ሞዴል:</span>
              <span className="font-semibold text-slate-800">{vehicle.vehicleType} - {vehicle.bajajModel}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="text-slate-500">የባጃጅ ማህበር:</span>
              <span className="font-semibold text-slate-800">{vehicle.bajajAssociation}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="text-slate-500">ቀለም:</span>
              <span className="font-semibold text-slate-800">{vehicle.color}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="text-slate-500">የባለቤት ስም:</span>
              <span className="font-bold text-slate-900">{vehicle.owner}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="text-slate-500">ቀበሌ / Kebele:</span>
              <span className="font-bold text-slate-800">{vehicle.kebele || 'ቀበሌ 03'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="text-slate-500">ቻሲስ ቁጥር (VIN):</span>
              <span className="font-mono text-[10px] text-slate-700">{vehicle.vin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">የተፈቀደ ዞን (Route):</span>
              <span className="font-bold text-emerald-800">{vehicle.authorizedArea}</span>
            </div>
          </div>

          {/* Security Seal & Stamp */}
          <div className="pt-2 flex items-center justify-between">
            <div className="text-[9px] text-slate-500 leading-tight">
              <p className="font-bold text-slate-700">ማረጋገጫ ኮድ (Security Hash):</p>
              <p className="font-mono text-[8px] text-slate-400">GD-TRF-2025-VERIFIED-SEC-88219</p>
              <p className="mt-1 text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle size={12} /> በጎንደር ትራፊክ ቁጥጥር የተረጋገጠ
              </p>
            </div>

            {qrUrl && (
              <img src={qrUrl} alt="Permit QR" className="w-20 h-20 border border-slate-300 rounded bg-white" />
            )}

            {/* Official Stamp Simulation */}
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-blue-700/80 p-1 flex items-center justify-center text-center rotate-[-8deg] bg-blue-50/40">
              <span className="text-[7.5px] font-bold text-blue-900 uppercase leading-none">
                ጎንደር ከተማ<br />መንገድ ትራንስፖርት<br />★ ማህተም ★<br />GONDAR CITY
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-2 px-3 bg-[#0C355B] hover:bg-[#092B4B] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Printer size={15} />
            <span>አትም (Print Permit)</span>
          </button>
          <button
            onClick={onClose}
            className="py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold"
          >
            ዝጋ (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
