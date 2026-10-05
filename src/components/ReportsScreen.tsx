import React, { useState } from 'react';
import { AlertTriangle, FileText, CheckCircle, ShieldAlert, MapPin, Printer } from 'lucide-react';
import { TrafficViolationReport } from '../types';
import { sounds } from '../utils/sound';

interface ReportsScreenProps {
  reports: TrafficViolationReport[];
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ reports }) => {
  const [selectedReport, setSelectedReport] = useState<TrafficViolationReport | null>(null);

  return (
    <div className="flex-1 flex flex-col p-3 bg-gradient-to-b from-[#F4F7FB] to-[#E9EFF5] overflow-y-auto space-y-3">
      {/* Title */}
      <div className="pt-1 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-lg font-bold text-[#0C355B] tracking-tight leading-tight">
              ሪፖርቶች (Traffic Reports)
            </h2>
            <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
              የማሳያ ቅርጽ (UI Mockup)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            የተመዘገቡ የባጃጅ ጥሰቶች እና የትራፊክ ቅጣቶች (Phase 2 Demo)
          </p>
        </div>
      </div>

      {/* Reports Summary Banner */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-600" />
          <span className="font-semibold text-red-900">አጠቃላይ ጥሰቶች: {reports.length}</span>
        </div>
        <span className="text-[10px] text-red-700 font-bold bg-white px-2 py-0.5 rounded border border-red-200">
          ጎንደር ትራፊክ
        </span>
      </div>

      {/* Reports List */}
      <div className="space-y-2 flex-1">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-xs space-y-2"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-[#0C355B] block">
                  {rep.reportNumber}
                </span>
                <span className="text-xs font-bold text-red-600 block mt-0.5">
                  ሰሌዳ: {rep.vehiclePlate}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                rep.status === 'IMPOUNDED'
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {rep.status}
              </span>
            </div>

            <p className="text-[11px] text-slate-700 font-medium leading-snug">
              {rep.reasonAm || rep.reason}
            </p>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin size={11} className="text-slate-400" />
                {rep.location}
              </span>
              <span className="font-mono">{rep.checkedOn}</span>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-900">
                እርምጃ: {rep.actionTaken}
              </span>
              <button
                onClick={() => {
                  sounds.playScanBeep();
                  setSelectedReport(rep);
                }}
                className="py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold flex items-center gap-1"
              >
                <FileText size={12} />
                <span>ደረሰኝ እይ</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Receipt Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-xl border border-slate-200 text-slate-800 space-y-3">
            <div className="text-center border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold text-[#0C355B] uppercase">
                የጎንደር ከተማ መንገድ ትራፊክ መምሪያ
              </h3>
              <p className="text-[10px] font-semibold text-red-600">
                የትራፊክ ጥሰት መረጃ ደረሰኝ (Citation Ticket)
              </p>
              <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                {selectedReport.reportNumber}
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">ተሽከርካሪ ሰሌዳ:</span>
                <span className="font-bold text-slate-900 font-mono">{selectedReport.vehiclePlate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ዲጂታል ID:</span>
                <span className="font-mono text-slate-700">{selectedReport.digitalId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">የተጣለ ቅጣት:</span>
                <span className="font-bold text-red-700">{selectedReport.fineAmount} ብር (ETB)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ቀንና ሰዓት:</span>
                <span className="font-mono text-[11px]">{selectedReport.checkedOn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">የመዘገበው ፖሊስ:</span>
                <span className="font-semibold text-slate-800">{selectedReport.checkedBy}</span>
              </div>
            </div>

            <div className="p-2 bg-slate-50 rounded-lg text-[10px] text-slate-600">
              <p className="font-semibold text-slate-800 mb-0.5">የጥሰቱ ዝርዝር:</p>
              <p>{selectedReport.notes}</p>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-[#0C355B] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5"
              >
                <Printer size={14} />
                <span>አትም</span>
              </button>
              <button
                onClick={() => setSelectedReport(null)}
                className="py-2 px-4 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200"
              >
                ዝጋ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
