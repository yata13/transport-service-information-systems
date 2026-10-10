import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  FileText, 
  Phone, 
  MapPin, 
  User, 
  Building2, 
  Calendar,
  ChevronRight,
  ShieldAlert,
  ArrowLeftRight,
  ArrowRight
} from 'lucide-react';
import { BajajVehicle } from '../types';
import { sounds } from '../utils/sound';

interface ValidityResultScreenProps {
  vehicle: BajajVehicle;
  isClash?: boolean;
  physicalPlateChecked?: string;
  onViewDetails: () => void;
  onNewCheck: () => void;
  onOpenReport: () => void;
}

export const ValidityResultScreen: React.FC<ValidityResultScreenProps> = ({
  vehicle,
  isClash = false,
  physicalPlateChecked,
  onViewDetails,
  onNewCheck,
  onOpenReport,
}) => {
  const isValid = vehicle.status === 'ACTIVE' && !isClash;
  const isExpired = vehicle.status === 'EXPIRED' && !isClash;
  const primaryPhone = vehicle.driverPhone || vehicle.ownerPhone;

  return (
    <div className="flex-1 flex flex-col p-3 bg-gradient-to-b from-[#F4F7FB] to-[#E9EFF5] overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1 pb-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 ${
            isClash ? 'bg-red-700' : 'bg-[#0C355B]'
          }`}>
            {isClash ? '!' : '3'}
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0C355B] tracking-tight leading-tight">
              {isClash ? 'የሰሌዳ ግጭት ማረጋገጫ' : 'የፈቃድ ሁኔታ ማረጋገጫ'}
            </h2>
            <span className="text-[11px] font-semibold text-slate-500 block leading-none">
              {isClash ? 'Plate Clash / Mismatch Verdict' : 'Permit Validity Verdict'}
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
          isClash
            ? 'bg-gradient-to-r from-red-700 via-rose-800 to-red-900'
            : isValid
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
              : isExpired
                ? 'bg-gradient-to-r from-amber-600 to-orange-700'
                : 'bg-gradient-to-r from-red-600 to-rose-800'
        }`}>
          <div className="flex justify-center mb-1.5">
            {isClash ? (
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center border-2 border-white/40 shadow-inner animate-pulse">
                <ShieldAlert size={36} className="text-amber-300 stroke-[2.5]" />
              </div>
            ) : isValid ? (
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
            {isClash
              ? '🚨 አስጊ የሰሌዳ ግጭት / አለመዛመድ (CLASH DETECTED!)'
              : isValid
                ? '✅ ሰሌዳ እና ዲጂታል መታወቂያ 100% ተዛምደዋል (VALID)'
                : isExpired
                  ? 'ጊዜው ያለፈበት (EXPIRED)'
                  : 'የታገደ / ሕገ-ወጥ (SUSPENDED)'}
          </h3>
          <p className="text-xs text-white/95 font-medium mt-1 max-w-sm mx-auto leading-relaxed">
            {isClash
              ? 'በዲጂታል መታወቂያው የተመዘገበው ሰሌዳ እና በተሽከርካሪው ላይ ያለው ታርጋ የተለያዩ ናቸው! ፈቃዱ ተቀይሯል ወይም ተሰርቋል'
              : isValid 
                ? 'በዲጂታል መታወቂያው እና በተሽከርካሪው ላይ ያለው ታርጋ ተመሳሳይ ናቸው። የመንገድ ፈቃዱ የፀደቀ ነው።' 
                : isExpired 
                  ? 'የዓመቱ የስራ ፈቃድ ጊዜው ስላለፈበት ማገልገል አይችልም' 
                  : 'ይህ ተሽከርካሪ በትራፊክ መምሪያ የታገደ ነው'}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* IF CLASH DETECTED: DISPLAY BOTH DETAILS SIDE-BY-SIDE                     */}
        {/* ========================================================================= */}
        {isClash ? (
          <div className="p-4 space-y-4 bg-red-50/40">
            <div className="flex items-center gap-2 text-xs font-bold text-red-900 border-b border-red-200 pb-2">
              <ArrowLeftRight size={16} className="text-red-700" />
              <span>የተገኙ ሁለት የተለያዩ መረጃዎች ንፅፅር (Clash Breakdown):</span>
            </div>

            {/* DUAL DETAILS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* CARD 1: SCANNED QR RECORD */}
              <div className="bg-white p-3.5 rounded-xl border-2 border-blue-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between border-b border-blue-100 pb-1.5">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">
                    1. በዲጂታል መታወቂያው የተመዘገበው (QR Record)
                  </span>
                  <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                    ትክክለኛ ፈቃድ
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-medium block">የተመዘገበ ሰሌዳ:</span>
                  <span className="text-sm font-mono font-black text-[#0C355B] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block mt-0.5">
                    {vehicle.plateNumber}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-medium block">ዲጂታል መታወቂያ:</span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {vehicle.digitalId}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-medium block">ህጋዊ ባለቤት:</span>
                  <span className="text-xs font-bold text-slate-900">
                    {vehicle.owner}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-medium block">የተመዘገበ አሽከርካሪ:</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {vehicle.driverName || 'ያልተመዘገበ'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-medium block">ሞዴል እና ማህበር:</span>
                  <span className="text-[11px] text-slate-600">
                    {vehicle.bajajModel} · {vehicle.bajajAssociation}
                  </span>
                </div>
              </div>

              {/* CARD 2: ENTERED PHYSICAL PLATE */}
              <div className="bg-red-50/90 p-3.5 rounded-xl border-2 border-red-300 shadow-xs space-y-2">
                <div className="flex items-center justify-between border-b border-red-200 pb-1.5">
                  <span className="text-[10px] font-bold text-red-800 uppercase tracking-wide">
                    2. በተሽከርካሪው ላይ የሚታየው ታርጋ (On Bajaj)
                  </span>
                  <span className="text-[9px] bg-red-200 text-red-900 font-bold px-1.5 py-0.5 rounded">
                    የተለየ ታርጋ (Clash)
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-red-700 font-medium block">በቦታው የታየው ታርጋ:</span>
                  <span className="text-sm font-mono font-black text-red-900 bg-white px-2 py-0.5 rounded border border-red-300 inline-block mt-0.5">
                    {physicalPlateChecked || 'ያልተዛመደ ታርጋ'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-red-700 font-medium block">የፍተሻ ውጤት:</span>
                  <span className="text-xs font-bold text-red-800 flex items-center gap-1 mt-0.5">
                    <XCircle size={14} className="text-red-600" />
                    <span>የሰሌዳ ግጭት (DIFFERENT - CLASH!)</span>
                  </span>
                </div>

                <div className="p-2 bg-white/80 rounded-lg border border-red-200 text-[11px] text-red-950 font-medium leading-relaxed">
                  ⚠️ <strong>ማስጠንቀቂያ፡</strong> ይህ ባጃጅ የተለጠፈበትን ፈቃድ አልተሰጠውም። ፈቃዱ የሰሌዳ [{vehicle.plateNumber}] ተሽከርካሪ ነው።
                </div>

                <div className="text-[10px] text-slate-600">
                  የሕግ ጥሰት፡ <strong>የሰሌዳ ማጭበርበር እና ሕገ-ወጥ ዝውውር</strong>
                </div>
              </div>
            </div>

            {/* Direct Action: Impound & Issue Fine */}
            <button
              type="button"
              onClick={() => {
                sounds.playAlert();
                onOpenReport();
              }}
              className="w-full py-3 px-4 bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <ShieldAlert size={16} />
              <span>የሰሌዳ ማጭበርበር ጥሰት መዝግብ (Issue Clash Citation & Impound)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          /* ========================================================================= */
          /* REGULAR MATCH / APPROVED SCREEN                                           */
          /* ========================================================================= */
          <div className="p-4 space-y-3">
            {/* 100% Match Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-950 font-bold">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span>የተቃኘው QR እና የተረጋገጠው ታርጋ ሙሉ ለሙሉ ይዛመዳሉ</span>
              </div>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-800">
                {vehicle.plateNumber}
              </span>
            </div>

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
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                  <Phone size={11} className="text-[#0C355B]" />
                  <span>ስልክ ቁጥር (Phone)</span>
                </div>
                <div className="text-[11px] font-mono font-bold text-slate-800 mt-0.5 select-text">
                  {primaryPhone}
                </div>
              </div>

              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                  <MapPin size={11} className="text-red-500" />
                  <span>ቀበሌ (Kebele)</span>
                </div>
                <div className="text-[11px] font-bold text-[#0C355B] mt-0.5 truncate">
                  {vehicle.kebele || 'ቀበሌ 03'}
                </div>
              </div>

              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                  <Building2 size={11} className="text-[#0C355B]" />
                  <span>የተፈቀደ ዞን (Zone)</span>
                </div>
                <div className="text-[10px] font-bold text-emerald-800 mt-0.5 truncate">
                  {vehicle.authorizedArea}
                </div>
              </div>

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
        )}

        {/* PRIMARY ACTION BUTTONS */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2">
          {!isClash && (
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
          )}

          {/* Secondary Buttons Row */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                sounds.playScanBeep();
                onNewCheck();
              }}
              className="py-2.5 px-3 bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <RefreshCw size={13} />
              <span>አዲስ ፍተሻ (New Scan)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playAlert();
                onOpenReport();
              }}
              className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <AlertTriangle size={13} />
              <span>ጥሰት መዝግብ (Report)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
