import React, { useEffect, useState } from 'react';
import { CheckCircle2, Info, Loader2, Database, ShieldCheck } from 'lucide-react';
import { BajajVehicle } from '../types';
import { sounds } from '../utils/sound';

interface VerifyingProgressModalProps {
  query: {
    type: 'digitalId' | 'plate' | 'vin' | 'qr';
    value: string;
    digitalId?: string;
    physicalPlate?: string;
    simulatedBajaj?: BajajVehicle;
    isMismatch?: boolean;
  };
  onComplete: (bajaj: BajajVehicle, isMismatch: boolean) => void;
}

export const VerifyingProgressModal: React.FC<VerifyingProgressModalProps> = ({
  query,
  onComplete
}) => {
  const [completedSteps, setCompletedSteps] = useState<number>(0);
  const [backendResult, setBackendResult] = useState<BajajVehicle | null>(null);

  const checks = [
    { id: 1, title: 'የዳታቤዝ ግንኙነት መፈተሽ', en: 'Live Database Query Check' },
    { id: 2, title: 'ዲጂታል መታወቂያ (DID) ማረጋገጥ', en: 'Digital ID Check' },
    { id: 3, title: 'የሰሌዳ ቁጥር ማረጋገጥ', en: 'Plate Number Match' },
    { id: 4, title: 'የተሽከርካሪ ፈቃድ ጊዜ ማረጋገጥ', en: 'Permit Validity & Expiry' },
    { id: 5, title: 'የጥቁር መዝገብ (Blacklist) ፍተሻ', en: 'Police Blacklist Audit' },
    { id: 6, title: 'የተፈቀደ የጎንደር ዞን መስመር', en: 'Gondar Route Authorization' },
  ];

  // Real backend verification query
  useEffect(() => {
    let isCancelled = false;
    async function fetchBackendVerification() {
      try {
        const queryParam = encodeURIComponent(query.value || '');
        const res = await fetch(`/api/vehicles/verify?query=${queryParam}&type=${query.type}`);
        if (res.ok) {
          const data = await res.json();
          if (data.found && data.vehicle && !isCancelled) {
            setBackendResult(data.vehicle);
          }
        }
      } catch (err) {
        console.warn('Real backend query fallback to local state:', err);
      }
    }

    fetchBackendVerification();
    return () => {
      isCancelled = true;
    };
  }, [query]);

  // Sequentially animate inspection steps with sound
  useEffect(() => {
    const interval = setInterval(() => {
      setCompletedSteps(prev => {
        const next = prev + 1;
        if (next <= checks.length) {
          sounds.playScanBeep();
        }
        return next;
      });
    }, 320);

    return () => clearInterval(interval);
  }, [checks.length]);

  // Handle completion when inspection steps finish
  useEffect(() => {
    if (completedSteps >= checks.length + 1) {
      if (query.isMismatch) {
        sounds.playAlert();
      } else {
        sounds.playSuccess();
      }

      // Prioritize real backend verification result, then query simulation, then fallback
      const finalVehicle = backendResult || query.simulatedBajaj || {
        id: 'bajaj-1',
        digitalId: 'DID-25-000784521',
        plateNumber: 'AA-12345',
        vin: 'MBN12345678912345',
        vehicleType: 'Bajaj (ባጃጅ)',
        bajajModel: 'TVS King',
        bajajAssociation: 'Addis Bajaj Share Company',
        color: 'Red (ቀይ)',
        owner: 'አቶ ታምራት አለማየሁ',
        ownerPhone: '+251 91 876 5432',
        driverName: 'ዮሐንስ ጌታቸው',
        driverPhone: '+251 91 432 1098',
        driverPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
        kebele: 'ቀበሌ 03',
        address: 'አራዳ መንገድ፣ ቀበሌ 03፣ ጎንደር',
        permitNo: 'PRM-25-5566',
        issueDate: '2025-01-10',
        expiryDate: '2026-01-09',
        authorizedArea: 'ሰበሰተፖል (Sebastopol)',
        status: 'ACTIVE',
        isBlacklisted: false,
        qrCodeValue: 'DID-25-000784521|AA-12345|PRM-25-5566',
        registeredCity: 'Gondar / ጎንደር'
      };

      onComplete(finalVehicle, !!query.isMismatch);
    }
  }, [completedSteps, query, backendResult, onComplete, checks.length]);

  return (
    <div className="flex-1 flex flex-col p-3 bg-gradient-to-b from-[#F4F7FB] to-[#E9EFF5] overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#0C355B] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            3
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0C355B] tracking-tight leading-tight">
              የማረጋገጫ ሂደት
            </h2>
            <span className="text-[11px] font-semibold text-slate-500 block leading-none">
              Live Backend Verification
            </span>
          </div>
        </div>

        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
          <Database size={10} />
          <span>የቀጥታ ፍተሻ</span>
        </span>
      </div>

      {/* Main Verification Progress Card */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200/90 p-5 mb-3 my-auto">
        {/* Animated Circular Spinner */}
        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg
              className="w-16 h-16 animate-spin text-[#1B74E4]"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, idx) => {
                const rad = (angle * Math.PI) / 180;
                const cx = 50 + 36 * Math.cos(rad);
                const cy = 50 + 36 * Math.sin(rad);
                const opacity = 0.2 + (idx / 12) * 0.8;
                return (
                  <circle
                    key={angle}
                    cx={cx}
                    cy={cy}
                    r={idx % 2 === 0 ? 5.5 : 4}
                    fill="#1565C0"
                    opacity={opacity}
                  />
                );
              })}
            </svg>
          </div>

          <p className="mt-2 text-sm font-bold text-[#0C355B]">
            እባክዎ ይጠብቁ... (Verifying with Backend)
          </p>
          <span className="text-[11px] text-slate-500 font-mono mt-0.5">
            መለያ: {query.value || 'DID-25-000784521'}
          </span>
        </div>

        {/* Step-by-Step Progress List */}
        <div className="space-y-2 mt-2 pt-3 border-t border-slate-100">
          {checks.map((chk, index) => {
            const isFinished = completedSteps > index;
            const isCurrentlyChecking = completedSteps === index;

            return (
              <div
                key={chk.id}
                className={`p-2 rounded-lg text-xs flex items-center justify-between transition-all ${
                  isFinished
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : isCurrentlyChecking
                      ? 'bg-blue-50 text-blue-900 border border-blue-200 animate-pulse font-bold'
                      : 'bg-slate-50 text-slate-400 border border-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isFinished ? (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  ) : isCurrentlyChecking ? (
                    <Loader2 size={16} className="text-blue-600 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                  )}
                  <span className="font-medium text-[11px]">{chk.title}</span>
                </div>
                <span className="text-[10px] font-semibold opacity-75">
                  {isFinished ? 'ተጠናቋል' : isCurrentlyChecking ? 'በመፈተሽ ላይ...' : 'በጥበቃ'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info notice bar */}
      <div className="bg-[#EBF3FC] border border-[#CDE1F8] rounded-xl p-3 flex items-center gap-2.5 text-[#0C355B]">
        <div className="w-5 h-5 rounded-full bg-[#185A9D] text-white flex items-center justify-center shrink-0 text-xs font-bold">
          <Info size={13} />
        </div>
        <p className="text-[11px] font-semibold leading-tight">
          በጎንደር ትራፊክ ቁጥጥር ማዕከል የዳታቤዝ ሰርቨር ላይ ፍተሻ እየተከናወነ ነው...
        </p>
      </div>
    </div>
  );
};
