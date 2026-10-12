import React from 'react';
import { 
  Car, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Receipt, 
  QrCode, 
  ArrowUpRight, 
  Building2, 
  MapPin, 
  Plus, 
  Download, 
  Clock, 
  Users, 
  FileText,
  TrendingUp,
  Activity
} from 'lucide-react';
import { BajajVehicle, Inspection, TrafficViolationReport } from '../../types';
import { ErpCharts } from './ErpCharts';

interface ErpDashboardProps {
  database: BajajVehicle[];
  reports: TrafficViolationReport[];
  inspections: Inspection[];
  onNavigateTab: (tab: string) => void;
  onOpenNewVehicleModal: () => void;
  onSelectVehicle: (vehicle: BajajVehicle) => void;
}

export const ErpDashboard: React.FC<ErpDashboardProps> = ({
  database,
  reports,
  inspections,
  onNavigateTab,
  onOpenNewVehicleModal,
  onSelectVehicle,
}) => {
  const totalFleet = database.length;
  const activeFleet = database.filter((v) => v.status === 'ACTIVE').length;
  const expiredFleet = database.filter((v) => v.status === 'EXPIRED').length;
  const suspendedFleet = database.filter((v) => v.status === 'SUSPENDED' || v.isBlacklisted).length;
  const complianceRate = totalFleet > 0 ? ((activeFleet / totalFleet) * 100).toFixed(1) : '0';

  const totalFinesETB = reports.reduce((sum, r) => sum + (r.fineAmount || 0), 0);
  const impoundedTickets = reports.filter((r) => r.status === 'IMPOUNDED' || r.actionTaken.includes('ታግዷል')).length;

  const todayKey = new Date().toDateString();
  const todayInspections = inspections.filter((i) => new Date(i.createdAt).toDateString() === todayKey);
  const todayFailed = todayInspections.filter((i) => i.result !== 'VALID').length;

  // Association statistics (real counts from the registry)
  const assocColors = ['bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-purple-600', 'bg-sky-600', 'bg-rose-600'];
  const assocMap = new Map<string, { count: number; active: number }>();
  for (const v of database) {
    const name = v.bajajAssociation || 'ሌሎች (Other)';
    const entry = assocMap.get(name) || { count: 0, active: 0 };
    entry.count += 1;
    if (v.status === 'ACTIVE') entry.active += 1;
    assocMap.set(name, entry);
  }
  const associations = [...assocMap.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([name, data], idx) => ({ name, ...data, color: assocColors[idx % assocColors.length] }));

  // Officers working in the field today, derived from their inspections
  const officerActivity = new Map<string, { badge: string; count: number; last: string; location: string }>();
  for (const i of todayInspections) {
    const entry = officerActivity.get(i.officerName) || { badge: i.badgeNumber, count: 0, last: i.createdAt, location: i.location };
    entry.count += 1;
    if (i.createdAt > entry.last) {
      entry.last = i.createdAt;
      entry.location = i.location;
    }
    officerActivity.set(i.officerName, entry);
  }
  const activeOfficers = [...officerActivity.entries()].sort((a, b) => b[1].last.localeCompare(a[1].last)).slice(0, 5);

  return (
    <div className="p-3 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Executive Command Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-[#0C355B] tracking-tight">
              ማዕከላዊ የትራፊክ ቁጥጥር ዳሽቦርድ
            </h2>
            <span className="text-[11px] font-bold bg-blue-100 text-[#0C355B] px-2.5 py-0.5 rounded-full border border-blue-200">
              Live Central ERP
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            የጎንደር ከተማ አስተዳደር የትራንስፖርት እና ትራፊክ ቁጥጥር መምሪያ · ዋና መሥሪያ ቤት
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('verification')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <QrCode size={15} className="text-[#0C355B]" />
            <span>የመንገድ ላይ ፍተሻ (Roadside Verifier)</span>
          </button>

          <button
            onClick={onOpenNewVehicleModal}
            className="px-4 py-2 bg-[#0C355B] hover:bg-[#092B4B] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus size={16} />
            <span>አዲስ ባጃጅ መዝግብ (Register Vehicle)</span>
          </button>
        </div>
      </div>

      {/* 6 Primary ERP KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* KPI 1: Total Fleet */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>ጠቅላላ መዝገብ</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Car size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-[#0C355B] font-mono">
            {totalFleet.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 font-medium">
            <span>የተመዘገቡ ባጃጆች</span>
          </div>
        </div>

        {/* KPI 2: Compliant Permits */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>ሕጋዊ ፈቃድ</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700 font-mono">
            {activeFleet.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
            <TrendingUp size={12} />
            <span>{complianceRate}% ተገዢነት</span>
          </div>
        </div>

        {/* KPI 3: Expired Permits */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>ጊዜው ያለፈበት</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-700 font-mono">
            {expiredFleet.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-amber-800 font-medium">
            <span>እድሳት የሚጠብቁ</span>
          </div>
        </div>

        {/* KPI 4: Suspended / Impounded */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>የታገዱ / ጥቁር መዝገብ</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-red-700 font-mono">
            {suspendedFleet.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-red-800 font-medium">
            <span>የተከለከሉ ተሽከርካሪዎች</span>
          </div>
        </div>

        {/* KPI 5: Total Fines ETB */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>የተጣለ ቅጣት (ETB)</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Receipt size={16} />
            </div>
          </div>
          <div className="mt-2 text-xl font-black text-purple-900 font-mono">
            {totalFinesETB.toLocaleString()} ብር
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">
            <span>{reports.length} የጥሰት ሪፖርቶች</span>
          </div>
        </div>

        {/* KPI 6: Daily Throughput */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>የዛሬ ፍተሻዎች</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Activity size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-sky-800 font-mono">
            {todayInspections.length.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>{todayFailed} ችግር ያለባቸው · በቀጥታ</span>
          </div>
        </div>
      </div>

      {/* Enterprise Interactive Charts & Visual Graphs */}
      <ErpCharts vehicles={database} reports={reports} inspections={inspections} />

      {/* Main ERP Layout: 2 Columns (Fleet Associations & Operational Feeds) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Real-time Registered Fleet Ledger */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Registrations Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car size={18} className="text-[#0C355B]" />
                <h3 className="text-sm font-bold text-slate-900">
                  የተሽከርካሪዎች መዝገብ እና የፈቃድ ሁኔታ (Fleet Overview)
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('vehicles')}
                className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>ሁሉንም እይ ({totalFleet})</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">የሰሌዳ ቁጥር</th>
                    <th className="px-3 py-3">ዲጂታል መታወቂያ</th>
                    <th className="px-3 py-3">ባለቤት / አሽከርካሪ</th>
                    <th className="px-3 py-3">ማህበር እና ዞን</th>
                    <th className="px-3 py-3">ሁኔታ</th>
                    <th className="px-4 py-3 text-right">እርምጃ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {database.slice(0, 5).map((vehicle) => {
                    const isValid = vehicle.status === 'ACTIVE';
                    const isExpired = vehicle.status === 'EXPIRED';

                    return (
                      <tr key={vehicle.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">
                          {vehicle.plateNumber}
                        </td>
                        <td className="px-3 py-3 font-mono text-[11px] text-slate-600">
                          {vehicle.digitalId}
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-bold text-slate-900">{vehicle.driverName || vehicle.owner}</div>
                          <div className="text-[10px] text-slate-500">ባለቤት: {vehicle.owner}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-medium text-slate-800 truncate max-w-[150px]">{vehicle.bajajAssociation}</div>
                          <div className="text-[10px] text-slate-500">{vehicle.kebele}</div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isValid
                              ? 'bg-emerald-100 text-emerald-800'
                              : isExpired
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isValid ? 'bg-emerald-600' : isExpired ? 'bg-amber-600' : 'bg-red-600'}`} />
                            {vehicle.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => onSelectVehicle(vehicle)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-[#0C355B] hover:text-white rounded-lg text-[11px] font-bold text-slate-700 transition cursor-pointer"
                          >
                            ዝርዝር እይ
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Violations Ledger */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt size={18} className="text-red-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  የቅርብ ጊዜ የትራፊክ ቅጣቶች (Recent Citations & Violations)
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('reports')}
                className="text-xs text-red-700 hover:text-red-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>ሁሉንም ሪፖርቶች እይ</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {reports.length === 0 && (
                <div className="p-6 text-center text-slate-400">ገና ምንም ሪፖርት የለም (No reports yet)</div>
              )}
              {reports.slice(0, 5).map((r) => (
                <div key={r.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0 font-bold text-[10px]">
                      {r.reportNumber.slice(-3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{r.vehiclePlate}</span>
                        <span className="text-[10px] text-slate-400 font-mono">#{r.reportNumber}</span>
                      </div>
                      <div className="text-[11px] text-slate-700 font-medium mt-0.5">{r.reasonAm || r.reason}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{r.location} · {r.checkedBy} · {r.checkedOn}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-red-700 text-sm">{r.fineAmount?.toLocaleString()} ብር</div>
                    <span className="inline-block mt-0.5 text-[9px] bg-red-50 text-red-800 font-bold px-2 py-0.5 rounded border border-red-200">
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Association Quotas & Dispatch Operations */}
        <div className="space-y-6">
          {/* Associations Capacity Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Building2 size={18} className="text-[#0C355B]" />
              <h3 className="text-sm font-bold text-slate-900">
                የባጃጅ ማህበራት ድርሻ (Association Capacity)
              </h3>
            </div>

            <div className="space-y-4">
              {associations.length === 0 && <p className="text-xs text-slate-400">ምንም መረጃ የለም</p>}
              {associations.map((assoc) => {
                const percentage = totalFleet > 0 ? (assoc.count / totalFleet) * 100 : 0;
                return (
                  <div key={assoc.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold gap-2">
                      <span className="text-slate-800 truncate">{assoc.name}</span>
                      <span className="font-mono text-slate-600 shrink-0">{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`${assoc.color} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{assoc.count} ባጃጆች</span>
                      <span>{assoc.active} ሕጋዊ ፈቃድ</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Officers active in the field today (from live inspections) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <MapPin size={18} className="text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                የዛሬ ተረኛ መኮንኖች (Officers Active Today)
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              {activeOfficers.length === 0 && (
                <p className="text-slate-400">ዛሬ ገና ምንም ፍተሻ አልተደረገም (No inspections yet today)</p>
              )}
              {activeOfficers.map(([name, info]) => (
                <div key={name} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">{name}</div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {info.badge} · {info.location || '-'} · {new Date(info.last).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                    {info.count} ፍተሻ
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
