import React, { useState } from 'react';
import { AlertTriangle, ArrowLeft, Send, CheckCircle2, Info } from 'lucide-react';
import { BajajVehicle, TrafficViolationReport } from '../types';
import { sounds } from '../utils/sound';

interface ViolationReportScreenProps {
  vehicle: BajajVehicle;
  isMismatch?: boolean;
  onBack: () => void;
  onSubmitReport: (report: TrafficViolationReport) => void;
  inspectorName: string;
}

export const ViolationReportScreen: React.FC<ViolationReportScreenProps> = ({
  vehicle,
  isMismatch = true,
  onBack,
  onSubmitReport,
  inspectorName
}) => {
  const [action, setAction] = useState<string>('ባጃጅ ወደ ትራፊክ መምሪያ ማቆም (Impound Bajaj)');
  const [notes, setNotes] = useState<string>('የተሰቀለው ሰሌዳ ከተመዘገበው DID ጋር አልተዛመደም::');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const displayPlate = isMismatch ? 'AA-99999' : vehicle.plateNumber;
  const reasonText = isMismatch 
    ? 'Plate number does not match with registered vehicle.'
    : vehicle.status === 'EXPIRED'
      ? 'Transport service permit expired and unauthorized on Gondar routes.'
      : 'Route deviation and violation of Gondar city Bajaj regulations.';

  const reasonAmText = isMismatch
    ? 'የተሰቀለው የሰሌዳ ቁጥር ከተመዘገበው ጋር አይዛመድም (ሐሰተኛ ሰሌዳ)'
    : vehicle.status === 'EXPIRED'
      ? 'የመንገድ ፈቃድ ጊዜው ያለፈበት ሆኖ ተገኝቷል'
      : 'ከተፈቀደለት ዞን ውጭ ተገኝቷል';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playAlert();
    setIsSubmitted(true);

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newReport: TrafficViolationReport = {
      id: `rep-${Date.now()}`,
      reportNumber: `RPT-GD-${Math.floor(1000 + Math.random() * 9000)}`,
      digitalId: vehicle.digitalId,
      vehiclePlate: displayPlate,
      registeredPlate: vehicle.plateNumber,
      reason: reasonText,
      reasonAm: reasonAmText,
      actionTaken: action,
      fineAmount: action.includes('500') ? 500 : action.includes('1500') ? 1500 : 2000,
      checkedOn: timestamp,
      checkedBy: inspectorName || 'inspector1 (ጎንደር ትራፊክ)',
      notes: notes.trim(),
      status: action.includes('Impound') ? 'IMPOUNDED' : 'SUBMITTED',
      location: 'ጎንደር ከተማ መንገድ (Gondar City Road)'
    };

    setTimeout(() => {
      onSubmitReport(newReport);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col p-3 bg-gradient-to-b from-[#F4F7FB] to-[#E9EFF5] overflow-y-auto">
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
            Violation report has been logged to Gondar Traffic Police database.
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
                  ሕገወጥ ተሽከርካሪ
                </h3>
                <p className="text-xs font-black text-red-600 tracking-wide mt-0.5">
                  ILLEGAL VEHICLE
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
                  2025-05-20 10:32:18
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
                  inspector1
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
                  <option value="ባጃጅ ወደ ትራፊክ መምሪያ ማቆም (Impound Bajaj)">
                    ባጃጅ ወደ ትራፊክ መምሪያ ማቆም (Impound Bajaj)
                  </option>
                  <option value="የትራፊክ ቅጣት መጣል - 1500 ብር (Fine 1500 ETB)">
                    የትራፊክ ቅጣት መጣል - 1500 ብር (Fine 1500 ETB)
                  </option>
                  <option value="የመጀመሪያ የጽሁፍ ማስጠንቀቂያ (Written Warning)">
                    የመጀመሪያ የጽሁፍ ማስጠንቀቂያ (Written Warning)
                  </option>
                  <option value="የመስመር ፍቃድ ማገድ (Suspend Gondar Route Permit)">
                    የመስመር ፍቃድ ማገድ (Suspend Gondar Route Permit)
                  </option>
                </select>
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

              {/* Action Buttons (Matches Screenshot 5) */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="submit"
                  className="py-2.5 px-2 bg-[#D32F2F] hover:bg-[#B71C1C] active:scale-[0.98] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <AlertTriangle size={15} />
                  <span className="truncate">ሪፖርት አስገባ (Submit)</span>
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
          የተሽከርካሪ መረጃዎችን የሪፖርት ተልኳል::
        </p>
      </div>
    </div>
  );
};
