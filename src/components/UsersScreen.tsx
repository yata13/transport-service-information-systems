import React from 'react';
import { UserCheck, Shield, Phone, MapPin, Award } from 'lucide-react';

export const UsersScreen: React.FC = () => {
  const officers = [
    {
      id: 'off-1',
      name: 'ኢንስፔክተር አበበ ተሰማ',
      badge: 'GD-TRF-042',
      role: 'የመንገድ ላይ ተቆጣጣሪ (Field Inspector)',
      zone: 'ዞን 1: አራዳ - ፒያሳ',
      phone: '+251 91 812 3456',
      status: 'ተረኛ (On Duty)',
      checksToday: 48
    },
    {
      id: 'off-2',
      name: 'ረዳት ኢንስፔክተር ሰለሞን አለሙ',
      badge: 'GD-TRF-019',
      role: 'ኬላ ተቆጣጣሪ (Checkpoint Lead)',
      zone: 'ዞን 2: ፒያሳ - አዘዞ',
      phone: '+251 92 114 9988',
      status: 'ተረኛ (On Duty)',
      checksToday: 62
    },
    {
      id: 'off-3',
      name: 'ሳጅን ቤተልሔም ግርማ',
      badge: 'GD-TRF-033',
      role: 'የማረጋገጫ ባለሙያ (Verification Officer)',
      zone: 'ዞን 3: ማራኪ ዩኒቨርሲቲ',
      phone: '+251 93 555 7711',
      status: 'ተረኛ (On Duty)',
      checksToday: 39
    },
    {
      id: 'off-4',
      name: 'አለቃ ደስታ ካሳሁን',
      badge: 'GD-TRF-SUP-01',
      role: 'የጎንደር ትራፊክ መምሪያ ኃላፊ (Station Chief)',
      zone: 'ዋና መምሪያ (HQ)',
      phone: '+251 91 800 1122',
      status: 'ስራ ላይ (Active)',
      checksToday: 15
    }
  ];

  return (
    <div className="flex-1 flex flex-col p-3 bg-gradient-to-b from-[#F4F7FB] to-[#E9EFF5] overflow-y-auto space-y-3">
      {/* Title */}
      <div className="pt-1">
        <h2 className="text-lg font-bold text-[#0C355B] tracking-tight leading-tight">
          ተጠቃሚዎች (Officers & Inspectors)
        </h2>
        <p className="text-[11px] text-slate-500 font-medium">
          የጎንደር ከተማ መንገድ ትራፊክ መምሪያ ሰራተኞች
        </p>
      </div>

      <div className="space-y-2 flex-1">
        {officers.map(officer => (
          <div
            key={officer.id}
            className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-xs space-y-2"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#0C355B] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {officer.badge.split('-')[2] || 'TRF'}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">
                    {officer.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {officer.role}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {officer.status}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-1.5 text-[10px] text-slate-600">
              <div className="flex items-center gap-1">
                <MapPin size={12} className="text-slate-400" />
                <span className="truncate">{officer.zone}</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone size={12} className="text-slate-400" />
                <span>{officer.phone}</span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[10px]">
              <span className="font-mono text-slate-400">መለያ: {officer.badge}</span>
              <span className="font-bold text-blue-900">
                ዛሬ የፈተሹት: {officer.checksToday} ባጃጅ
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
