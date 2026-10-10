import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Plus, 
  Search, 
  BadgeCheck, 
  CheckCircle2, 
  Activity 
} from 'lucide-react';

export const UsersScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const officers = [
    {
      id: 'off-1',
      name: 'ኢንስፔክተር አበበ ተሰማ',
      badge: 'GD-TRF-042',
      role: 'የመንገድ ላይ ተቆጣጣሪ (Field Inspector)',
      zone: 'ዞን 1: አራዳ - ፒያሳ - ፋሲል ግቢ',
      phone: '+251 91 812 3456',
      status: 'ተረኛ (On Duty)',
      checksToday: 48,
      citationsIssued: 6,
    },
    {
      id: 'off-2',
      name: 'ረዳት ኢንስፔክተር ሰለሞን አለሙ',
      badge: 'GD-TRF-019',
      role: 'ኬላ ተቆጣጣሪ (Checkpoint Lead)',
      zone: 'ዞን 2: ፒያሳ - አዘዞ - ኤርፖርት',
      phone: '+251 92 114 9988',
      status: 'ተረኛ (On Duty)',
      checksToday: 62,
      citationsIssued: 11,
    },
    {
      id: 'off-3',
      name: 'ሳጅን ቤተልሔም ግርማ',
      badge: 'GD-TRF-033',
      role: 'የማረጋገጫ ባለሙያ (Verification Specialist)',
      zone: 'ዞን 3: ማራኪ ዩኒቨርሲቲ - ቀበሌ 18',
      phone: '+251 93 555 7711',
      status: 'ተረኛ (On Duty)',
      checksToday: 39,
      citationsIssued: 4,
    },
    {
      id: 'off-4',
      name: 'ሳጅን ተስፋዬ ብርሃኑ',
      badge: 'GD-TRF-051',
      role: 'የፍተሻ ፖሊስ (Patrol Officer)',
      zone: 'ዞን 4: አንገረብ - ቸቸላ - ቀበሌ 07',
      phone: '+251 91 777 2233',
      status: 'ተረኛ (On Duty)',
      checksToday: 31,
      citationsIssued: 5,
    },
    {
      id: 'off-5',
      name: 'አለቃ ደስታ ካሳሁን',
      badge: 'GD-TRF-SUP-01',
      role: 'የጎንደር ትራፊክ መምሪያ ኃላፊ (Director HQ)',
      zone: 'ዋና መምሪያ (Headquarters)',
      phone: '+251 91 800 1122',
      status: 'ስራ ላይ (Active)',
      checksToday: 15,
      citationsIssued: 0,
    },
  ];

  const filtered = officers.filter(
    (o) =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.badge.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.zone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-[#0C355B] tracking-tight">
              የትራፊክ ፖሊስ አባላት እና ስምሪት (Officers & Staff)
            </h2>
            <span className="text-xs font-bold bg-blue-100 text-[#0C355B] px-2.5 py-0.5 rounded-full border border-blue-200">
              {officers.length} አባላት በስራ ላይ
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            የጎንደር ከተማ መንገድ ትራፊክ ቁጥጥር አባላት፣ የመስክ ስምሪት እና የፍተሻ አፈጻጸም
          </p>
        </div>

        <button
          onClick={() => alert('አዲስ አባል መጨመሪያ ቅጽ (Officer Onboarding Drawer)')}
          className="px-4 py-2 bg-[#0C355B] hover:bg-[#092B4B] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition cursor-pointer"
        >
          <Plus size={16} />
          <span>አዲስ አባል መዝግብ (Add Officer)</span>
        </button>
      </div>

      {/* Officers Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">ባጅ ቁጥር</th>
                <th className="px-3 py-3.5">የአባል ሙሉ ስም</th>
                <th className="px-3 py-3.5">የስራ ኃላፊነት (Role)</th>
                <th className="px-3 py-3.5">የተመደበበት ዞን / ኬላ</th>
                <th className="px-3 py-3.5">ስልክ ቁጥር</th>
                <th className="px-3 py-3.5 text-center">የዛሬ ፍተሻዎች</th>
                <th className="px-3 py-3.5 text-center">የተጣሉ ቅጣቶች</th>
                <th className="px-3 py-3.5">ሁኔታ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3.5 font-mono font-bold text-[#0C355B]">
                    {o.badge}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="font-bold text-slate-900 text-sm">{o.name}</div>
                  </td>
                  <td className="px-3 py-3.5 text-slate-700 font-medium">
                    {o.role}
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="flex items-center gap-1 text-slate-800 font-medium">
                      <MapPin size={12} className="text-blue-600" />
                      {o.zone}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 font-mono text-slate-600">
                    {o.phone}
                  </td>
                  <td className="px-3 py-3.5 text-center font-mono font-bold text-blue-700 text-sm">
                    {o.checksToday}
                  </td>
                  <td className="px-3 py-3.5 text-center font-mono font-bold text-red-600 text-sm">
                    {o.citationsIssued}
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
