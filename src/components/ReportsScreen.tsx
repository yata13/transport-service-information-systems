import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Receipt, 
  CheckCircle, 
  ShieldAlert, 
  Printer, 
  Search, 
  Download, 
  DollarSign, 
  Clock, 
  MapPin, 
  User 
} from 'lucide-react';
import { TrafficViolationReport } from '../types';
import { sounds } from '../utils/sound';

interface ReportsScreenProps {
  reports: TrafficViolationReport[];
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ reports }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedReport, setSelectedReport] = useState<TrafficViolationReport | null>(null);

  const totalFines = reports.reduce((sum, r) => sum + (r.fineAmount || 0), 0);
  const impoundedCount = reports.filter((r) => r.status === 'IMPOUNDED' || r.actionTaken.includes('ታግዷል')).length;
  const paidCount = reports.filter((r) => r.status === 'PAID').length;
  const pendingCount = reports.filter((r) => r.status === 'SUBMITTED').length;

  const filtered = reports.filter((r) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      r.reportNumber.toLowerCase().includes(q) ||
      r.vehiclePlate.toLowerCase().includes(q) ||
      r.reasonAm.toLowerCase().includes(q) ||
      r.checkedBy.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q);

    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    const headers = ['ReportNumber,Plate,Reason,FineETB,Officer,Location,Status,Date\n'];
    const rows = filtered.map(r => 
      `"${r.reportNumber}","${r.vehiclePlate}","${r.reasonAm}","${r.fineAmount}","${r.checkedBy}","${r.location}","${r.status}","${r.checkedOn}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gondar_violation_reports_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-[#0C355B] tracking-tight">
              የጥሰት እና የቅጣት መዝገብ (Violations & Enforcement Ledger)
            </h2>
            <span className="text-xs font-bold bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full border border-red-200">
              {filtered.length} ሪፖርቶች
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            በጎንደር ከተማ ትራፊክ ቁጥጥር የተመዘገቡ ቅጣቶች፣ የታገዱ ባጃጆች እና የገቢ ክትትል
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
        >
          <Download size={15} />
          <span>ሪፖርት አውርድ (Export CSV)</span>
        </button>
      </div>

      {/* Revenue & Enforcement Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Billed */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold">አጠቃላይ የተጣለ ቅጣት</div>
          <div className="text-2xl font-black text-purple-900 font-mono mt-1">
            {totalFines.toLocaleString()} ብር
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">ከጠቅላላ {reports.length} ጥሰቶች</div>
        </div>

        {/* Impounded */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold">የታገዱ / የተያዙ ባጃጆች</div>
          <div className="text-2xl font-black text-red-700 font-mono mt-1">
            {impoundedCount}
          </div>
          <div className="text-[11px] text-red-800 font-medium mt-0.5">በትራፊክ ፖሊስ ግቢ የታገዱ</div>
        </div>

        {/* Paid */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold">የተከፈሉ ቅጣቶች</div>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
            {paidCount}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">የፀደቁ ክፍያዎች</div>
        </div>

        {/* Pending */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold">በሂደት ላይ ያሉ (Pending)</div>
          <div className="text-2xl font-black text-amber-700 font-mono mt-1">
            {pendingCount}
          </div>
          <div className="text-[11px] text-amber-800 font-medium mt-0.5">ክፍያ የሚጠበቅባቸው</div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="በሪፖርት ቁጥር፣ በሰሌዳ፣ ወይም በአስመዝጋቢ ፈልግ..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: 'ALL', label: 'ሁሉም' },
            { id: 'SUBMITTED', label: 'የተመዘገቡ' },
            { id: 'IMPOUNDED', label: 'የታገዱ' },
            { id: 'PAID', label: 'የተከፈሉ' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setFilterStatus(item.id);
                sounds.playScanBeep();
              }}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                filterStatus === item.id
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Citations Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">የሪፖርት ቁጥር</th>
                <th className="px-3 py-3.5">የተከሰሰ ሰሌዳ</th>
                <th className="px-3 py-3.5">የጥሰቱ ምክንያት</th>
                <th className="px-3 py-3.5">የተጣለ ቅጣት (ETB)</th>
                <th className="px-3 py-3.5">የተወሰደ እርምጃ</th>
                <th className="px-3 py-3.5">ቦታ እና ኬላ</th>
                <th className="px-3 py-3.5">መርማሪ ፖሊስ</th>
                <th className="px-3 py-3.5">ሁኔታ</th>
                <th className="px-4 py-3.5 text-right">ማረጋገጫ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    ምንም የጥሰት ሪፖርት አልተገኘም
                  </td>
                </tr>
              ) : (
                filtered.map((rep) => {
                  const isImpounded = rep.status === 'IMPOUNDED';
                  const isPaid = rep.status === 'PAID';

                  return (
                    <tr key={rep.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3 font-mono font-bold text-[#0C355B]">
                        {rep.reportNumber}
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-red-700">
                        {rep.vehiclePlate}
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-bold text-slate-900 max-w-[200px] truncate">{rep.reasonAm || rep.reason}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{rep.checkedOn}</div>
                      </td>
                      <td className="px-3 py-3 font-mono font-black text-slate-900">
                        {rep.fineAmount?.toLocaleString()} ብር
                      </td>
                      <td className="px-3 py-3 text-slate-700 font-medium">
                        {rep.actionTaken}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {rep.location}
                      </td>
                      <td className="px-3 py-3 text-slate-800 font-medium">
                        {rep.checkedBy}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isImpounded
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : isPaid
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {rep.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedReport(rep);
                            sounds.playScanBeep();
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-[#0C355B] hover:text-white rounded-lg text-[11px] font-bold text-slate-700 transition cursor-pointer"
                        >
                          ሰነድ እይ
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#0C355B] text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">የትራፊክ ቅጣት ሰነድ (Violation Dossier)</h3>
                <p className="text-xs text-blue-200 font-mono">{selectedReport.reportNumber}</p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="bg-red-50 p-3 rounded-xl border border-red-200 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-red-700 font-bold block">የተከሰሰ ባጃጅ ሰሌዳ</span>
                  <span className="text-base font-mono font-black text-red-900">{selectedReport.vehiclePlate}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-red-700 font-bold block">የቅጣት መጠን</span>
                  <span className="text-base font-mono font-black text-red-900">{selectedReport.fineAmount?.toLocaleString()} ብር</span>
                </div>
              </div>

              <div className="space-y-2 divide-y divide-slate-100">
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500 font-medium">የጥሰቱ ምክንያት:</span>
                  <span className="font-bold text-slate-900">{selectedReport.reasonAm}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500 font-medium">የተወሰደ እርምጃ:</span>
                  <span className="font-semibold text-slate-900">{selectedReport.actionTaken}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500 font-medium">መርማሪ ፖሊስ:</span>
                  <span className="font-semibold text-slate-900">{selectedReport.checkedBy}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500 font-medium">ቦታ:</span>
                  <span className="font-semibold text-slate-900">{selectedReport.location}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500 font-medium">ቀን እና ሰዓት:</span>
                  <span className="font-mono text-slate-800">{selectedReport.checkedOn}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer size={14} />
                <span>አትም (Print Ticket)</span>
              </button>
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-[#0C355B] text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                ዝጋ (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
