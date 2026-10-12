import React, { useState } from 'react';
import { AlertTriangle, ArrowLeft, Send, CheckCircle2, Info } from 'lucide-react';
import { BajajVehicle, TrafficViolationReport } from '../types';
import { sounds } from '../utils/sound';
import { formatTimestamp, generateReportNumber } from '../lib/api';

interface ViolationReportScreenProps {
  vehicle: BajajVehicle;
  isMismatch?: boolean;
  physicalPlate?: string;
  onBack: () => void;
  onSubmitReport: (report: TrafficViolationReport) => Promise<void>;
  inspectorName: string;
}

const ACTIONS = [
  { value: 'ባጃጅ ወደ ትራፊክ መምሪያ ማቆም (Impound Bajaj)', fine: 2000, status: 'IMPOUNDED' as const },
  { value: 'የትራፊክ ቅጣት መጣል - 1500 ብር (Fine 1500 ETB)', fine: 1500, status: 'SUBMITTED' as const },
  { value: 'የትራፊክ ቅጣት መጣል - 500 ብር (Fine 500 ETB)', fine: 500, status: 'SUBMITTED' as const },
  { value: 'የመጀመሪያ የጽሁፍ ማስጠንቀቂያ (Written Warning)', fine: 0, status: 'SUBMITTED' as const },
  { value: 'የመስመር ፍቃድ ማገድ (Suspend Gondar Route Permit)', fine: 1000, status: 'IMPOUNDED' as const },
];

export const ViolationReportScreen: React.FC<ViolationReportScreenProps> = ({
  vehicle,
  isMismatch = false,
  physicalPlate,
  onBack,
  onSubmitReport,
  inspectorName
}) => {
  const isUnregistered = vehicle.status === 'ILLEGAL' && vehicle.permitNo === 'NO-PERMIT';
  const [action, setAction] = useState<string>(ACTIONS[0].value);
  const [notes, setNotes] = useState<string>(
    isMismatch ? 'የተሰቀለው ሰሌዳ ከተመዘገበው DID ጋር አልተዛመደም::' : ''
  );
  const [location, setLocation] = useState<string>('ጎንደር ከተማ መንገድ (Gondar City Road)');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [now] = useState(() => new Date());

  // The plate the officer actually saw on the vehicle.
  const displayPlate = (physicalPlate && physicalPlate.trim()) || vehicle.plateNumber;
  const reasonText = isUnregistered
    ? 'Vehicle not found in the Gondar transport registry.'
    : isMismatch
      ? 'Plate number does not match with registered vehicle.'
      : vehicle.isBlacklisted || vehicle.status === 'SUSPENDED'
        ? 'Suspended / blacklisted vehicle operating on Gondar routes.'
        : vehicle.status === 'EXPIRED'
          ? 'Transport service permit expired and unauthorized on Gondar routes.'
          : 'Route deviation and violation of Gondar city Bajaj regulations.';

  const reasonAmText = isUnregistered
    ? 'በጎንደር ትራንስፖርት መዝገብ ውስጥ ያልተገኘ ተሽከርካሪ'
    : isMismatch
      ? 'የተሰቀለው የሰሌዳ ቁጥር ከተመዘገበው ጋር አይዛመድም (ሐሰተኛ ሰሌዳ)'
      : vehicle.isBlacklisted || vehicle.status === 'SUSPENDED'
        ? 'የታገደ / በጥቁር መዝገብ ያለ ተሽከርካሪ'
        : vehicle.status === 'EXPIRED'
          ? 'የመንገድ ፈቃድ ጊዜው ያለፈበት ሆኖ ተገኝቷል'
          : 'ከተፈቀደለት ዞን ውጭ ተገኝቷል';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    const selected = ACTIONS.find((a) => a.value === action) || ACTIONS[0];

    const newReport: TrafficViolationReport = {
      id: '',
      reportNumber: generateReportNumber(),
      digitalId: vehicle.digitalId,
      vehiclePlate: displayPlate,
      registeredPlate: isUnregistered ? undefined : vehicle.plateNumber,
      reason: reasonText,
      reasonAm: reasonAmText,
      actionTaken: action,
      fineAmount: selected.fine,
      checkedOn: formatTimestamp(new Date().toISOString()),
      checkedBy: inspectorName,
      notes: notes.trim(),
      status: selected.status,
      location: location.trim() || 'ጎንደር ከተማ (Gondar City)',
    };

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmitReport(newReport);
      setIsSubmitted(true);
    } catch (err) {
      sounds.playAlert();
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-6 max-w-2xl mx-auto w-full bg-gradient-to-b from-[#F4F7FB] to-[#E9EFF5] overflow-y-auto">
      {/* Top Stepper Indicator (Matches Screenshot 5) */}
      <div className="flex items-center gap-2 pt-1 pb-2">
        <div className="w-8 h-8 rounded-full bg-[#0C355B] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
          6
        </div>
        <h2 className="text-base font-bold text-[#0C355B] tracking-tight leading-tight">
          እርምጃ / ሪፖርት <span className="text-xs font-semibold text-slate-600 block">(Action / Report)</span>
        </h2>
      </div>

      {isSubmitted ? (
        <div className="bg-white rounded-xl shadow-md border border-emerald-200 p-6 my-auto text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={36} />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            ሪፖርቱ በተሳካ ሁኔታ ተልኳል!
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Saved to the central database – visible on all phones and the ERP instantly.
          </p>
          <div className="mt-4 p-2.5 bg-slate-50 rounded-lg text-xs text-slate-700">
            የተወሰደው እርምጃ: <span className="font-bold text-blue-900">{action}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Red Alert Banner Box (Matches Screenshot 5) */}
          <div className="bg-[#FFF5F5] border border-red-200 rounded-xl p-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <AlertTriangle size={24} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-600 leading-tight">
                  {reasonAmText}
                </h3>
                <p className="text-xs font-black text-red-600 tracking-wide mt-0.5">
                  {isMismatch ? 'PLATE MISMATCH' : isUnregistered ? 'ILLEGAL VEHICLE' : 'TRAFFIC VIOLATION'}
                </p>
              </div>
            </div>
          </div>

          {/* Details Card (Matches Screenshot 5) */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200/90 p-4">
            <div className="space-y-2.5 text-xs divide-y divide-slate-100">
              <div className="pt-1 flex items-baseline justify-between">
                <div>
                  <span className="font-semibold text-slate-700 block leading-tight text-[11px]">
                    ዲጂታል መታወቂያ
                  </span>
                  <span className="text-[9px] text-slate-400">Digital ID</span>
                </div>
                <span className="font-mono font-medium text-slate-800">
                  {vehicle.digitalId}
                </span>
              </div>

              <div className="pt-2 flex items-baseline justify-between">
                <div>
                  <span className="font-semibold text-slate-700 block leading-tight text-[11px]">
                    የፕሌትስ ቁጥር
                  </span>
                  <span className="text-[9px] text-slate-400">Plate Number</span>
                </div>
                <span className="font-bold text-red-600 tracking-wide">
                  {displayPlate} {isMismatch && '(Mismatch)'}
                </span>
              </div>

              <div className="pt-2 flex items-baseline justify-between">
                <div>
                  <span className="font-semibold text-slate-700 block leading-tight text-[11px]">
                    ምክንያት
                  </span>
                  <span className="text-[9px] text-slate-400">Reason</span>
                </div>
                <span className="text-[11px] font-medium text-slate-800 text-right max-w-[60%]">
                  {reasonText}
                </span>
              </div>

              <div className="pt-2 flex items-baseline justify-between">
                <div>
                  <span className="font-semibold text-slate-700 block leading-tight text-[11px]">
                    አሁን ቀን
                  </span>
                  <span className="text-[9px] text-slate-400">Checked On</span>
                </div>
                <span className="font-mono text-[11px] text-slate-700">
                  {formatTimestamp(now.toISOString())}
                </span>
              </div>

              <div className="pt-2 flex items-baseline justify-between">
                <div>
                  <span className="font-semibold text-slate-700 block leading-tight text-[11px]">
                    በመንገድ ፍተሻ
                  </span>
                  <span className="text-[9px] text-slate-400">Checked By</span>
                </div>
                <span className="text-xs font-semibold text-blue-900">
                  {inspectorName}
                </span>
              </div>
            </div>

            {/* Action Form (Matches Screenshot 5) */}
            <form onSubmit={handleSubmit} className="mt-4 pt-3 border-t border-slate-100 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  እርምጃ ይምረጡ
                </label>
                <span className="text-[9px] text-slate-400 block -mt-1 mb-1.5">Select Action</span>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                >
                  {ACTIONS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.value}{a.fine > 0 ? ` · ${a.fine} ብር` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ቦታ (Location)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ማስታወሻ (አስተያየት)
                </label>
                <span className="text-[9px] text-slate-400 block -mt-1 mb-1.5">Notes</span>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ማስታወሻ ይጻፉ..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {submitError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                  ሪፖርቱ አልተቀመጠም (Not saved): {submitError}
                </div>
              )}

              {/* Action Buttons (Matches Screenshot 5) */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="disabled:opacity-60 py-2.5 px-2 bg-[#D32F2F] hover:bg-[#B71C1C] active:scale-[0.98] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <AlertTriangle size={15} />
                  <span className="truncate">{isSubmitting ? 'በመላክ ላይ...' : 'ሪፖርት አስገባ (Submit)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playScanBeep();
                    onBack();
                  }}
                  className="py-2.5 px-2 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all"
                >
                  <ArrowLeft size={15} />
                  <span>ተመለስ (Back)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info notice bar (Matches Screenshot 5 bottom notice) */}
      <div className="bg-[#EBF3FC] border border-[#CDE1F8] rounded-xl p-3 flex items-center gap-2.5 text-[#0C355B] mt-auto">
        <div className="w-5 h-5 rounded-full bg-[#185A9D] text-white flex items-center justify-center shrink-0 text-xs font-bold">
          <Info size={13} />
        </div>
        <p className="text-[11px] font-semibold leading-tight">
          ሪፖርቱ ወደ ማዕከላዊ ዳታቤዝ ይላካል – በሁሉም ስልኮች እና በ ERP ወዲያውኑ ይታያል::
        </p>
      </div>
    </div>
  );
};
