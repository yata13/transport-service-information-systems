import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Car, 
  ChevronRight, 
  Download, 
  Plus, 
  Eye, 
  FileText, 
  Phone, 
  MapPin, 
  Filter,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Printer
} from 'lucide-react';
import { BajajVehicle } from '../types';
import { sounds } from '../utils/sound';
import { QrCardModal } from './QrCardModal';
import { printQrCards } from '../lib/qr';
import { formatTimestamp } from '../lib/api';

interface VehiclesListScreenProps {
  database: BajajVehicle[];
  onSelectVehicle: (bajaj: BajajVehicle) => void;
  onOpenNewVehicleModal?: () => void;
  initialSearch?: string;
}

export const VehiclesListScreen: React.FC<VehiclesListScreenProps> = ({
  database,
  onSelectVehicle,
  onOpenNewVehicleModal,
  initialSearch = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Follow the global search box in the top bar.
  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED'>('ALL');
  const [filterAssociation, setFilterAssociation] = useState<string>('ALL');
  const [qrVehicle, setQrVehicle] = useState<BajajVehicle | null>(null);

  const printAllQr = () => {
    if (filtered.length === 0) return;
    printQrCards(filtered).catch((e) => window.alert(e instanceof Error ? e.message : String(e)));
  };

  const filtered = database.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      item.plateNumber.toLowerCase().includes(q) ||
      item.digitalId.toLowerCase().includes(q) ||
      item.vin.toLowerCase().includes(q) ||
      item.owner.toLowerCase().includes(q) ||
      item.driverName.toLowerCase().includes(q) ||
      (item.kebele && item.kebele.toLowerCase().includes(q)) ||
      item.bajajAssociation.toLowerCase().includes(q);

    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesAssoc = filterAssociation === 'ALL' || item.bajajAssociation.includes(filterAssociation);

    return matchesSearch && matchesStatus && matchesAssoc;
  });

  const exportToCSV = () => {
    const headers = ['Plate,DID,VIN,Model,Association,Owner,Phone,Status,Expiry,Registered\n'];
    const rows = filtered.map(v => 
      `"${v.plateNumber}","${v.digitalId}","${v.vin}","${v.bajajModel}","${v.bajajAssociation}","${v.owner}","${v.ownerPhone}","${v.status}","${v.expiryDate}","${v.createdAt ? formatTimestamp(v.createdAt) : ''}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gondar_fleet_registry_${new Date().toISOString().split('T')[0]}.csv`;
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
              የተሽከርካሪዎች መዝገብ አስተዳደር (Fleet Registry)
            </h2>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
              {filtered.length} ተሽከርካሪዎች
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            በጎንደር ከተማ አስተዳደር የተመዘገቡ ባጃጆች ሙሉ መረጃ እና የፈቃድ ቁጥጥር
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={exportToCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download size={15} />
            <span>ሪፖርት አውርድ (Export CSV)</span>
          </button>

          <button
            onClick={printAllQr}
            disabled={filtered.length === 0}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <Printer size={15} />
            <span>ሁሉንም QR አትም (Print all QR · {filtered.length})</span>
          </button>

          {onOpenNewVehicleModal && (
            <button
              onClick={onOpenNewVehicleModal}
              className="px-4 py-2 bg-[#0C355B] hover:bg-[#092B4B] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus size={16} />
              <span>አዲስ ባጃጅ መዝግብ (Register Bajaj)</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="በሰሌዳ፣ DID፣ VIN፣ ባለቤት፣ ወይም ማህበር ፈልግ..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Segmented Control */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['ALL', 'ACTIVE', 'EXPIRED', 'SUSPENDED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setFilterStatus(st);
                  sounds.playScanBeep();
                }}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  filterStatus === st
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'ሁሉም (All)' : st}
              </button>
            ))}
          </div>

          {/* Association Filter Dropdown */}
          <select
            value={filterAssociation}
            onChange={(e) => setFilterAssociation(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option value="ALL">ሁሉም ማህበራት (All Associations)</option>
            <option value="ፋሲል">ፋሲል የባጃጅ ማህበር (Fasil)</option>
            <option value="አዘዞ">አዘዞ ማህበር (Azezo)</option>
            <option value="ማራኪ">ማራኪ ዩኒቨርሲቲ ማህበር (Maraki)</option>
            <option value="አንገረብ">አንገረብ ማህበር (Angereb)</option>
          </select>
        </div>
      </div>

      {/* Enterprise Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">የሰሌዳ ቁጥር</th>
                <th className="px-3 py-3.5">ዲጂታል መታወቂያ / VIN</th>
                <th className="px-3 py-3.5">ባለቤት እና አሽከርካሪ</th>
                <th className="px-3 py-3.5">ሞዴል እና ማህበር</th>
                <th className="px-3 py-3.5">የተፈቀደ ዞን</th>
                <th className="px-3 py-3.5">ፈቃድ የሚያበቃበት</th>
                <th className="px-3 py-3.5">የተመዘገበበት (Registered)</th>
                <th className="px-3 py-3.5">የፈቃድ ሁኔታ</th>
                <th className="px-4 py-3.5 text-right">የአስተዳደር እርምጃ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    ምንም ተሽከርካሪ አልተገኘም (No matching vehicles in registry)
                  </td>
                </tr>
              ) : (
                filtered.map((v) => {
                  const isValid = v.status === 'ACTIVE';
                  const isExpired = v.status === 'EXPIRED';

                  return (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition">
                      {/* Plate */}
                      <td className="px-4 py-3">
                        <span className="font-mono font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 text-xs inline-block">
                          {v.plateNumber}
                        </span>
                      </td>

                      {/* DID & VIN */}
                      <td className="px-3 py-3 font-mono">
                        <div className="font-bold text-[#0C355B] text-[11px]">{v.digitalId}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{v.vin}</div>
                      </td>

                      {/* Owner & Driver */}
                      <td className="px-3 py-3">
                        <div className="font-bold text-slate-900">{v.owner}</div>
                        <div className="text-[10px] text-slate-500">አሽከርካሪ፡ {v.driverName || 'ባለቤቱ'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{v.ownerPhone}</div>
                      </td>

                      {/* Model & Association */}
                      <td className="px-3 py-3">
                        <div className="font-medium text-slate-800">{v.bajajModel}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{v.bajajAssociation}</div>
                      </td>

                      {/* Zone */}
                      <td className="px-3 py-3">
                        <div className="text-[11px] font-medium text-slate-700 truncate max-w-[130px]">
                          {v.authorizedArea}
                        </div>
                        <div className="text-[10px] text-slate-400">{v.kebele}</div>
                      </td>

                      {/* Expiry */}
                      <td className="px-3 py-3 font-mono">
                        <span className={`text-[11px] font-bold ${isExpired ? 'text-red-700' : 'text-slate-700'}`}>
                          {v.expiryDate}
                        </span>
                      </td>

                      {/* Registered at */}
                      <td className="px-3 py-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {v.createdAt ? formatTimestamp(v.createdAt) : '-'}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          isValid
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : isExpired
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isValid ? 'bg-emerald-600' : isExpired ? 'bg-amber-600' : 'bg-red-600'}`} />
                          {v.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectVehicle(v)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#0C355B] hover:text-white text-slate-700 transition cursor-pointer"
                            title="ሙሉ መረጃ እይ (View Dossier)"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => setQrVehicle(v)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 transition cursor-pointer"
                            title="QR ኮድ አሳይ / አትም (Show / Print QR)"
                          >
                            <Printer size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {qrVehicle && <QrCardModal vehicle={qrVehicle} onClose={() => setQrVehicle(null)} />}
    </div>
  );
};
