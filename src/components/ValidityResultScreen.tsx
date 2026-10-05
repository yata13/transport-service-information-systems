import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  RefreshCw, 
  FileText, 
  Phone, 
  MapPin, 
  User, 
  ShieldCheck, 
  Building2, 
  Calendar,
  ChevronRight
} from 'lucide-react';
import { BajajVehicle } from '../types';
import { sounds } from '../utils/sound';

interface ValidityResultScreenProps {
  vehicle: BajajVehicle;
  onViewDetails: () => void;
  onNewCheck: () => void;
  onOpenReport: () => void;
}

export const ValidityResultScreen: React.FC<ValidityResultScreenProps> = ({
  vehicle,
  onViewDetails,
  onNewCheck,
  onOpenReport
}) => {
  const isValid = vehicle.status === 'ACTIVE';
  const isExpired = vehicle.status === 'EXPIRED';
  const isSuspended = vehicle.status === 'SUSPENDED';
  const primaryPhone = vehicle.driverPhone || vehicle.ownerPhone;

  return (
    <div className="flex-1 flex flex-col p-3 bg-gradient-to-b from-[#F4F7FB] to-[#E9EFF5] overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#0C355B] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            4
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0C355B] tracking-tight leading-tight">
              የፈቃድ ሁኔታ ማረጋገጫ
            </h2>
            <span className="text-[11px] font-semibold text-slate-500 block leading-none">
              Permit Validity Verdict
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono text-slate-500 font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200">
          DID: {vehicle.digitalId}
        </span>
      </div>

      {/* BIG VALIDITY STATUS CARD */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200/90 overflow-hidden mb-3">
        {/* Status Banner */}
        <div className={`p-4 text-center text-white ${
          isValid
            ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
            : isExpired
              ? 'bg-gradient-to-r from-amber-600 to-orange-700'
              : 'bg-gradient-to-r from-red-600 to-rose-800'
        }`}>
          <div className="flex justify-center mb-1.5">
            {isValid ? (
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center border-2 border-white/40 shadow-inner">
                <CheckCircle2 size={36} className="text-white stroke-[2.5]" />
              </div>
            ) : isExpired ? (
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center border-2 border-white/40 shadow-inner">
                <AlertTriangle size={34} className="text-white stroke-[2.5]" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center border-2 border-white/40 shadow-inner">
                <XCircle size={36} className="text-white stroke-[2.5]" />
              </div>
            )}
          </div>

          <h3 className="text-lg font-black tracking-tight leading-tight">
            {isValid ? 'ሕጋዊ ፈቃድ ያለው (VALID)' : isExpired ? 'ጊዜው ያለፈበት (EXPIRED)' : 'የታገደ / ሕገ-ወጥ (SUSPENDED)'}
          </h3>
          <p className="text-xs text-white/90 font-medium mt-0.5">
            {isValid 
              ? 'የመንገድ ፈቃዱ በጎንደር ከተማ ትራፊክ ቁጥጥር የፀደቀ ነው' 
              : isExpired 
                ? 'የዓመቱ የስራ ፈቃድ ጊዜው ስላለፈበት ማገልገል አይችልም' 
                : 'ይህ ተሽከርካሪ በትራፊክ መምሪያ የታገደ ነው'}
          </p>
        </div>

        {/* Identity & Core Information Summary */}
        <div className="p-4 space-y-3">
          {/* Driver & Photo Row */}
          <div className="flex items-center gap-3.5 pb-3 border-b border-slate-100">
            {/* Driver Photo */}
            <div className="relative shrink-0">
              {vehicle.driverPhoto ? (
                <img
                  src={vehicle.driverPhoto}
                  alt={vehicle.driverName || vehicle.owner}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-slate-200 shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-300 flex flex-col items-center justify-center text-slate-400">
                  <User size={26} />
                  <span className="text-[8px] mt-0.5 font-medium">ፎቶ</span>
                </div>
              )}
            </div>

            {/* Names & Plate */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded shadow-2xs">
                  {vehicle.plateNumber}
                </span>
                <span className="text-[11px] text-slate-500 font-semibold truncate">
                  {vehicle.bajajModel}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 mt-1 truncate">
                {vehicle.driverName || vehicle.owner}
              </h4>

              <p className="text-[11px] text-slate-500 truncate">
                ባለቤት: <span className="text-slate-700 font-semibold">{vehicle.owner}</span>
              </p>
            </div>
          </div>

          {/* Quick Summary Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Phone Number (Plain text, non-clickable) */}
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                <Phone size={11} className="text-[#0C355B]" />
                <span>ስልክ ቁጥር (Phone)</span>
              </div>
              <div className="text-[11px] font-mono font-bold text-slate-800 mt-0.5 select-text">
                {primaryPhone}
              </div>
            </div>

            {/* Kebele & Address */}
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                <MapPin size={11} className="text-red-500" />
                <span>ቀበሌ (Kebele)</span>
              </div>
              <div className="text-[11px] font-bold text-[#0C355B] mt-0.5 truncate">
                {vehicle.kebele || 'ቀበሌ 03'}
              </div>
            </div>

            {/* Route / Authorized Zone */}
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                <Building2 size={11} className="text-[#0C355B]" />
                <span>የተፈቀደ ዞን (Zone)</span>
              </div>
              <div className="text-[10px] font-bold text-emerald-800 mt-0.5 truncate">
                {vehicle.authorizedArea}
              </div>
            </div>

            {/* Expiry Date */}
            <div className={`p-2 rounded-lg border ${
              isExpired ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                <Calendar size={11} className={isExpired ? 'text-red-600' : 'text-slate-600'} />
                <span>የሚያበቃበት (Expiry)</span>
              </div>
              <div className={`text-[10px] font-mono font-bold mt-0.5 ${
                isExpired ? 'text-red-700' : 'text-slate-800'
              }`}>
                {vehicle.expiryDate}
              </div>
            </div>
          </div>

          {/* Association */}
          <div className="bg-blue-50/60 p-2 rounded-lg border border-blue-200/70 text-[11px] flex items-center justify-between">
            <span className="text-slate-600 font-medium text-[10px]">ባጃጅ ማህበር:</span>
            <span className="font-bold text-[#0C355B] text-[10px] truncate max-w-[200px]">
              {vehicle.bajajAssociation}
            </span>
          </div>
        </div>

        {/* PRIMARY ACTION BUTTON: VIEW FULL DETAILS (Opens Page 5) */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2">
          <button
            type="button"
            onClick={() => {
              sounds.playScanBeep();
              onViewDetails();
            }}
            className="w-full py-3 px-4 bg-[#0C355B] hover:bg-[#092B4B] active:scale-[0.98] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <FileText size={16} />
            <span>ተጨማሪ ዝርዝር እይ (View Full Details)</span>
            <ChevronRight size={16} />
          </button>

          {/* Secondary Buttons Row */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                sounds.playScanBeep();
                onNewCheck();
              }}
              className="py-2 px-3 bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <RefreshCw size={13} />
              <span>አዲስ ፍተሻ</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playAlert();
                onOpenReport();
              }}
              className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <AlertTriangle size={13} />
              <span>ጥሰት መዝግብ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
