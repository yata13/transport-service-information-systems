import React, { useState } from 'react';
import { 
  FileText, 
  AlertTriangle, 
  Info, 
  Phone, 
  MapPin, 
  User, 
  Check, 
  ArrowLeft,
  Building2
} from 'lucide-react';
import { BajajVehicle } from '../types';
import { sounds } from '../utils/sound';

interface VehicleDetailsScreenProps {
  vehicle: BajajVehicle;
  onOpenReport: () => void;
  onViewPdf: () => void;
  onBack?: () => void;
}

export const VehicleDetailsScreen: React.FC<VehicleDetailsScreenProps> = ({
  vehicle,
  onOpenReport,
  onViewPdf,
  onBack
}) => {
  const [showPhotoModal, setShowPhotoModal] = useState<boolean>(false);

  const isExpired = vehicle.status === 'EXPIRED';
  const primaryPhone = vehicle.driverPhone || vehicle.ownerPhone;

  const rows = [
    { labelAm: 'ዲጂታል መታወቂያ', labelEn: 'Digital ID', value: vehicle.digitalId },
    { labelAm: 'የፕሌትስ ቁጥር', labelEn: 'Plate Number', value: vehicle.plateNumber },
    { labelAm: 'VIN / ቻሲስ ቁጥር', labelEn: 'VIN / Chassis', value: vehicle.vin },
    { labelAm: 'ተሽከርካሪ አይነት', labelEn: 'Vehicle Type', value: vehicle.vehicleType },
    { labelAm: 'ሞዴል ተሽከርካሪ', labelEn: 'Bajaj Model', value: vehicle.bajajModel },
    { labelAm: 'ባጃጅ የሚገኝበት ማህበር', labelEn: 'Bajaj Association', value: vehicle.bajajAssociation },
    { labelAm: 'ቀለም', labelEn: 'Color', value: vehicle.color },
    { labelAm: 'ሾፌር (አሽከርካሪ)', labelEn: 'Driver Name', value: vehicle.driverName || 'ያልተመዘገበ' },
    { labelAm: 'የሾፌር ስልክ', labelEn: 'Driver Phone', value: vehicle.driverPhone || vehicle.ownerPhone },
    { labelAm: 'ባለቤት', labelEn: 'Owner', value: vehicle.owner },
    { labelAm: 'የባለቤት ስልክ', labelEn: 'Owner Phone', value: vehicle.ownerPhone },
    { labelAm: 'ቀበሌ (ዞን / ቀበሌ)', labelEn: 'Kebele', value: vehicle.kebele || 'ቀበሌ 03' },
    { labelAm: 'የመኖሪያ አድራሻ', labelEn: 'Address', value: vehicle.address || 'ጎንደር ከተማ' },
    { labelAm: 'የፈቃድ ቁጥር', labelEn: 'Permit No', value: vehicle.permitNo },
    { labelAm: 'የተሰጠበት ቀን', labelEn: 'Issue Date', value: vehicle.issueDate },
    { labelAm: 'የሚያበቃበት ቀን', labelEn: 'Expiry Date', value: vehicle.expiryDate, highlight: isExpired },
    { 
      labelAm: 'የተፈቀደ ዞን', 
      labelEn: 'Authorized Area', 
      value: vehicle.authorizedArea,
      valueClass: 'text-emerald-700 font-bold'
    },
    { 
      labelAm: 'ሁኔታ', 
      labelEn: 'Status', 
      value: vehicle.status,
      valueClass: vehicle.status === 'ACTIVE' 
        ? 'text-emerald-600 font-bold' 
        : vehicle.status === 'EXPIRED' 
          ? 'text-amber-600 font-bold' 
          : 'text-red-600 font-bold'
    }
  ];

  return (
    <div className="flex-1 flex flex-col p-3 bg-gradient-to-b from-[#F4F7FB] to-[#E9EFF5] overflow-y-auto">
      {/* Top Header with Back Button */}
      <div className="flex items-center justify-between pt-1 pb-2">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={() => {
                sounds.playScanBeep();
                onBack();
              }}
              className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-[#0C355B] border border-slate-300 flex items-center justify-center shadow-xs transition-colors"
              title="ወደ ማረጋገጫ ውጤት ተመለስ (Back)"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="w-8 h-8 rounded-full bg-[#0C355B] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            5
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0C355B] tracking-tight leading-tight">
              ተሽከርካሪ ዝርዝር
            </h2>
            <span className="text-[11px] font-semibold text-slate-500 block leading-none">
              Full Vehicle & Driver Details
            </span>
          </div>
        </div>

        {/* Status Pill */}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-xs ${
          vehicle.status === 'ACTIVE'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
            : vehicle.status === 'EXPIRED'
              ? 'bg-amber-50 text-amber-700 border-amber-300'
              : 'bg-red-50 text-red-700 border-red-300'
        }`}>
          {vehicle.status === 'ACTIVE' ? '✓ ሕጋዊ / ፈቃድ ያለው' : vehicle.status}
        </span>
      </div>

      {/* TOP HIGHLIGHT CARD: PHOTO, PHONE (PLAIN TEXT), ADDRESS & KEBELE */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200/90 p-3.5 mb-3 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0C355B] via-[#185A9D] to-[#4389A2]" />

        <div className="flex items-start gap-3 mt-0.5">
          {/* 1. PHOTO (Driver / Bajaj Photo) */}
          <div className="relative shrink-0">
            {vehicle.driverPhoto ? (
              <button
                type="button"
                onClick={() => setShowPhotoModal(true)}
                className="group relative block focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl"
                title="ፎቶውን በትልቁ ለማየት ይጫኑ (Click to enlarge photo)"
              >
                <img
                  src={vehicle.driverPhoto}
                  alt={vehicle.driverName || vehicle.owner}
                  className="w-20 h-20 rounded-xl object-cover border-2 border-slate-200 group-hover:border-blue-500 shadow-sm transition-all"
                />
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center transition-opacity text-white text-[9px] font-bold">
                  አሳይ
                </div>
              </button>
            ) : (
              <div className="w-20 h-20 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                <User size={30} className="text-slate-400" />
                <span className="text-[8px] font-semibold mt-1 text-slate-500">ፎቶ የለም</span>
              </div>
            )}

            {/* Status verification check badge */}
            <span
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${
                vehicle.status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-red-600'
              }`}
            >
              {vehicle.status === 'ACTIVE' ? (
                <Check size={11} className="text-white stroke-[3]" />
              ) : (
                <AlertTriangle size={11} className="text-white stroke-[2.5]" />
              )}
            </span>
          </div>

          {/* Quick Identification info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 leading-snug truncate">
              {vehicle.driverName || vehicle.owner}
            </h3>
            <p className="text-[10px] text-slate-500 font-medium truncate">
              ባለቤት: <span className="text-slate-700 font-semibold">{vehicle.owner}</span>
            </p>

            {/* 2. PHONE NUMBER (Pure plain text display, non-clickable) */}
            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-300 shadow-2xs select-text">
                <Phone size={12} className="text-[#0C355B]" />
                <span className="font-mono">{primaryPhone}</span>
              </div>

              {vehicle.ownerPhone && vehicle.ownerPhone !== vehicle.driverPhone && (
                <span className="text-[9px] text-slate-400 select-text">
                  (ባለቤት: {vehicle.ownerPhone})
                </span>
              )}
            </div>

            {/* 3. ADDRESS & KEBELE */}
            <div className="mt-2 flex items-start gap-1 text-[11px]">
              <MapPin size={13} className="text-red-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="font-bold text-[#0C355B] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 text-[10px]">
                    {vehicle.kebele || 'ቀበሌ 03'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    (ጎንደር አስተዳደር)
                  </span>
                </div>
                <p className="text-[10px] text-slate-700 font-medium mt-0.5 leading-tight truncate">
                  {vehicle.address || 'አራዳ መንገድ፣ ጎንደር'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Association & Plate Ribbon */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
          <div className="flex items-center gap-1">
            <Building2 size={12} className="text-[#0C355B]" />
            <span className="font-semibold truncate max-w-[170px]">
              {vehicle.bajajAssociation}
            </span>
          </div>
          <span className="font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
            {vehicle.plateNumber}
          </span>
        </div>
      </div>

      {/* Main Details Table Card */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200/90 p-4 mb-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
          <div>
            <h3 className="text-sm font-bold text-[#0C355B] leading-tight">
              የተሽከርካሪ ሙሉ መረጃ
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">
              Full Official Vehicle & Permit Specifications
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {vehicle.permitNo}
          </span>
        </div>

        {/* Key-Value Table */}
        <div className="divide-y divide-slate-100 text-xs">
          {rows.map((row, idx) => (
            <div key={idx} className="py-1.5 flex items-baseline justify-between gap-2">
              <div className="min-w-0 pr-2">
                <span className="font-semibold text-slate-700 block leading-tight text-[11px]">
                  {row.labelAm}
                </span>
                <span className="text-[9px] text-slate-400 block leading-tight">
                  {row.labelEn}
                </span>
              </div>
              <div className="text-right shrink-0 max-w-[62%]">
                <span className={`text-[11px] break-words font-medium ${row.valueClass || (row.highlight ? 'text-red-600 font-bold' : 'text-slate-800')}`}>
                  {row.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => {
              sounds.playScanBeep();
              onViewPdf();
            }}
            className="py-2.5 px-2 bg-[#0C355B] hover:bg-[#092B4B] active:scale-[0.98] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <FileText size={15} />
            <span className="truncate">የፈቃድ ሰነድ (PDF)</span>
          </button>

        </div>

        {/* Secondary Option: Flag Violation or Fine */}
        <div className="mt-2.5">
          <button
            type="button"
            onClick={() => {
              sounds.playAlert();
              onOpenReport();
            }}
            className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <AlertTriangle size={14} className="text-red-600" />
            <span>ጥሰት መዝግብ / እርምጃ ውሰድ (Issue Violation Ticket)</span>
          </button>
        </div>
      </div>

      {/* Info notice bar */}
      <div className="bg-[#EBF3FC] border border-[#CDE1F8] rounded-xl p-3 flex items-center gap-2.5 text-[#0C355B] mt-auto">
        <div className="w-5 h-5 rounded-full bg-[#185A9D] text-white flex items-center justify-center shrink-0 text-xs font-bold">
          <Info size={13} />
        </div>
        <p className="text-[11px] font-semibold leading-tight">
          የተሽከርካሪ መረጃዎች ማረጋገጫ ደርሷል:: ሁሉም መረጃ በጎንደር ትራፊክ ቁጥጥር ሥርዓት ውስጥ ተመዝግቧል::
        </p>
      </div>

      {/* Enlarged Driver Photo Modal */}
      {showPhotoModal && vehicle.driverPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowPhotoModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-xs w-full overflow-hidden shadow-2xl p-4 border border-slate-300 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={vehicle.driverPhoto}
              alt={vehicle.driverName || vehicle.owner}
              className="w-56 h-56 object-cover rounded-xl border border-slate-200 shadow-md"
            />
            <h4 className="mt-3 text-sm font-bold text-slate-900">
              {vehicle.driverName || vehicle.owner}
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              {vehicle.kebele || 'ቀበሌ 03'} · {vehicle.plateNumber}
            </p>
            {/* Plain text phone display inside modal (no dial link) */}
            <div className="mt-3 w-full py-2 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 font-mono select-text">
              <Phone size={13} className="text-[#0C355B]" />
              <span>ስልክ: {primaryPhone}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowPhotoModal(false)}
              className="mt-2 text-xs text-slate-500 hover:text-slate-800 py-1"
            >
              ዝጋ (Close)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
