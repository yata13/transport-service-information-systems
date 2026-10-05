import React, { useState } from 'react';
import { Search, Filter, Car, ChevronRight, ShieldCheck, AlertCircle, Phone, MapPin, User } from 'lucide-react';
import { BajajVehicle } from '../types';
import { sounds } from '../utils/sound';

interface VehiclesListScreenProps {
  database: BajajVehicle[];
  onSelectVehicle: (bajaj: BajajVehicle) => void;
  onVerifyVehicle: (bajaj: BajajVehicle) => void;
}

export const VehiclesListScreen: React.FC<VehiclesListScreenProps> = ({
  database,
  onSelectVehicle,
  onVerifyVehicle
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED'>('ALL');

  const filtered = database.filter(item => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      item.plateNumber.toLowerCase().includes(q) ||
      item.digitalId.toLowerCase().includes(q) ||
      item.owner.toLowerCase().includes(q) ||
      item.driverName.toLowerCase().includes(q) ||
      (item.kebele && item.kebele.toLowerCase().includes(q)) ||
      (item.driverPhone && item.driverPhone.toLowerCase().includes(q)) ||
      item.bajajAssociation.toLowerCase().includes(q);

    const matchesFilter = filterStatus === 'ALL' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-1 flex flex-col p-3 bg-gradient-to-b from-[#F4F7FB] to-[#E9EFF5] overflow-y-auto space-y-3">
      {/* Title */}
      <div className="pt-1">
        <h2 className="text-lg font-bold text-[#0C355B] tracking-tight leading-tight">
          ተሽከርካሪዎች (Vehicles)
        </h2>
        <p className="text-[11px] text-slate-500 font-medium">
          የጎንደር ከተማ የተመዘገቡ ባጃጆች ማውጫ
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search size={16} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="በሰሌዳ፣ DID፣ ባለቤት፣ ሾፌር፣ ወይም ቀበሌ ፈልግ..."
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs placeholder:text-slate-400"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {(['ALL', 'ACTIVE', 'EXPIRED', 'SUSPENDED'] as const).map(status => (
          <button
            key={status}
            onClick={() => {
              setFilterStatus(status);
              sounds.playScanBeep();
            }}
            className={`py-1 px-3 text-[11px] font-semibold rounded-lg shrink-0 transition-colors ${
              filterStatus === status
                ? 'bg-[#0C355B] text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {status === 'ALL' ? 'ሁሉም (All)' : status}
          </button>
        ))}
      </div>

      {/* Vehicle Cards List */}
      <div className="space-y-2 flex-1">
        {filtered.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
            የተፈለገው ባጃጅ አልተገኘም (No Bajaj found)
          </div>
        ) : (
          filtered.map(item => {
            const primaryPhone = item.driverPhone || item.ownerPhone;
            return (
              <div
                key={item.id}
                className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-start gap-2.5">
                  {/* Driver Photo Thumbnail */}
                  <div className="relative shrink-0">
                    {item.driverPhoto ? (
                      <img
                        src={item.driverPhoto}
                        alt={item.driverName || item.owner}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-2xs"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                        <User size={18} />
                      </div>
                    )}
                  </div>

                  {/* Vehicle & Driver Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-xs font-bold text-blue-950 font-mono tracking-wide">
                          {item.plateNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">·</span>
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {item.bajajModel}
                        </span>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                        item.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.status === 'EXPIRED'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="mt-0.5 text-[11px] text-slate-700 font-medium truncate">
                      <span>ሾፌር: {item.driverName}</span> · <span className="text-slate-500">ባለቤት: {item.owner}</span>
                    </div>

                    {/* Phone & Kebele Badges */}
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-600 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-slate-700 font-mono font-medium">
                        <Phone size={10} className="text-[#0C355B]" />
                        <span>{primaryPhone}</span>
                      </span>
                      <span className="inline-flex items-center gap-0.5 bg-blue-50 text-[#0C355B] font-semibold px-1.5 py-0.5 rounded border border-blue-200">
                        <MapPin size={9} className="text-red-500" />
                        <span>{item.kebele || 'ቀበሌ 03'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer bar */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">
                    DID: {item.digitalId}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        sounds.playScanBeep();
                        onSelectVehicle(item);
                      }}
                      className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-colors"
                    >
                      ዝርዝር
                    </button>
                    <button
                      onClick={() => {
                        sounds.playScanBeep();
                        onVerifyVehicle(item);
                      }}
                      className="py-1 px-2.5 bg-[#0C355B] hover:bg-[#092B4B] text-white rounded text-[11px] font-semibold transition-colors"
                    >
                      አረጋግጥ
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
