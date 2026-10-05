import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Car, 
  FileCheck, 
  QrCode, 
  TrendingUp, 
  MapPin, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { BajajVehicle, TrafficViolationReport } from '../types';
import { sounds } from '../utils/sound';

interface DashboardScreenProps {
  database: BajajVehicle[];
  reports: TrafficViolationReport[];
  onStartInspection: () => void;
  onSelectVehicle: (bajaj: BajajVehicle) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  database,
  reports,
  onStartInspection,
  onSelectVehicle
}) => {
  const activeCount = database.filter(b => b.status === 'ACTIVE').length;
  const expiredCount = database.filter(b => b.status === 'EXPIRED').length;
  const impoundedCount = reports.filter(r => r.status === 'IMPOUNDED').length;

  return (
    <div className="flex-1 flex flex-col p-3 bg-gradient-to-b from-[#F4F7FB] to-[#E9EFF5] overflow-y-auto space-y-3">
      {/* Title */}
      <div className="pt-1 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-lg font-bold text-[#0C355B] tracking-tight leading-tight">
              መነሻ ገጽ (Dashboard)
            </h2>
            <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
              የማሳያ ሥሪት (UI Demo)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            የጎንደር ከተማ ባጃጅ ትራፊክ ቁጥጥር ጣቢያ
          </p>
        </div>
        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
          ቅድመ-ዕይታ
        </span>
      </div>

      {/* Primary Action Button: Start Scan / Verify */}
      <button
        onClick={() => {
          sounds.playScanBeep();
          onStartInspection();
        }}
        className="w-full p-3 bg-gradient-to-r from-[#0C355B] to-[#164E85] hover:from-[#092B4B] hover:to-[#123E6B] text-white rounded-xl shadow-md flex items-center justify-between active:scale-[0.99] transition-all"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
            <QrCode size={22} className="text-blue-200" />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold block leading-tight">
              የባጃጅ ማረጋገጫ ጀምር
            </span>
            <span className="text-[10px] text-blue-200">
              Start Bajaj Inspection / QR Scan
            </span>
          </div>
        </div>
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
          <ChevronRight size={18} />
        </div>
      </button>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500">ህጋዊ ባጃጆች</span>
            <ShieldCheck size={16} className="text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {activeCount + 1420}
          </p>
          <span className="text-[9px] text-emerald-700 font-medium">
            ትክክለኛ ፍቃድ ያላቸው
          </span>
        </div>

        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500">የዛሬ ፍተሻዎች</span>
            <FileCheck size={16} className="text-blue-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            284
          </p>
          <span className="text-[9px] text-blue-700 font-medium">
            በጎንደር ኬላዎች የተፈተሹ
          </span>
        </div>

        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500">የተጣሉ ቅጣቶች</span>
            <AlertTriangle size={16} className="text-amber-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {reports.length + 18}
          </p>
          <span className="text-[9px] text-amber-700 font-medium">
            ጥሰቶችና ማስጠንቀቂያዎች
          </span>
        </div>

        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500">የታገዱ ባጃጆች</span>
            <ShieldAlert size={16} className="text-red-600" />
          </div>
          <p className="text-xl font-bold text-red-600 mt-1 tabular-nums">
            {impoundedCount + 4}
          </p>
          <span className="text-[9px] text-red-700 font-medium">
            ወደ መምሪያ የታሰሩ
          </span>
        </div>
      </div>

      {/* Gondar Traffic Zones List */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <p className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
          <MapPin size={14} className="text-blue-700" />
          <span>የጎንደር ከተማ ባጃጅ የፍተሻ ቀጠናዎች (Gondar Zones)</span>
        </p>
        <div className="space-y-1.5 text-[11px]">
          <div className="p-2 rounded-lg bg-slate-50 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800">ዞን 1: አራዳ - ፒያሳ - ፋሲል ግቢ</span>
              <span className="block text-[9px] text-slate-500">ፋሲል የባጃጅ ማህበር · 512 ባጃጆች</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              ሰላማዊ
            </span>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800">ዞን 2: ፒያሳ - አዘዞ - ጎንደር ኤርፖርት</span>
              <span className="block text-[9px] text-slate-500">አዘዞ ማህበር · 380 ባጃጆች</span>
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              ፍተሻ ላይ
            </span>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800">ዞን 3: ማራኪ ዩኒቨርሲቲ - ሾንቃ - ቀበሌ 18</span>
              <span className="block text-[9px] text-slate-500">ማራኪ ማህበር · 440 ባጃጆች</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              ሰላማዊ
            </span>
          </div>
        </div>
      </div>

      {/* Quick Access to Vehicles List */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-slate-800">የቅርብ ጊዜ የተመዘገቡ ባጃጆች</p>
          <span className="text-[10px] text-blue-700 font-semibold">ሁሉንም እይ</span>
        </div>
        <div className="space-y-1.5">
          {database.slice(0, 3).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                sounds.playScanBeep();
                onSelectVehicle(item);
              }}
              className="w-full p-2 text-left rounded-lg hover:bg-slate-50 border border-slate-100 flex items-center justify-between transition-colors"
            >
              <div className="min-w-0 pr-2">
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {item.plateNumber} · {item.bajajModel}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  {item.owner} ({item.bajajAssociation})
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                item.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {item.status}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
