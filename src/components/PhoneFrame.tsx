import React, { useState } from 'react';
import { Smartphone, Monitor, Volume2, VolumeX } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  soundEnabled = true,
  onToggleSound,
}) => {
  const [viewMode, setViewMode] = useState<'portal' | 'mobile'>('portal');

  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-800 flex flex-col relative">
      {/* Top Controls Bar for Desktop Browser Viewers */}
      <header className="bg-slate-950/80 backdrop-blur border-b border-slate-800 text-slate-300 text-xs px-4 py-2 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-white tracking-wide">
            የጎንደር ከተማ ባጃጅ ትራፊክ ቁጥጥር ሥርዓት (Gondar Traffic Portal)
          </span>
          <span className="hidden sm:inline-block text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
            Live v1.0.0
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-[11px]">
            <button
              onClick={() => setViewMode('portal')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'portal'
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Full Web Portal View"
            >
              <Monitor size={13} />
              <span className="hidden md:inline">የዌብ ገጽ እይታ (Portal)</span>
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'mobile'
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile Device Simulator View"
            >
              <Smartphone size={13} />
              <span className="hidden md:inline">የሞባይል እይታ (Mobile)</span>
            </button>
          </div>

          {/* Sound Toggle */}
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              className="p-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
            >
              {soundEnabled ? <Volume2 size={14} className="text-emerald-400" /> : <VolumeX size={14} className="text-slate-400" />}
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex justify-center items-start p-0 sm:p-4 overflow-y-auto">
        <div
          className={`w-full min-h-[calc(100vh-42px)] transition-all duration-300 flex flex-col bg-white relative ${
            viewMode === 'portal'
              ? 'max-w-5xl rounded-none sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden'
              : 'max-w-md rounded-none sm:rounded-[36px] shadow-2xl border-4 border-slate-700 sm:my-3 overflow-hidden ring-1 ring-slate-800'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
