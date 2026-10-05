import React, { useState } from 'react';
import { Globe, Volume2, Bell, Shield, Moon, Sun, Smartphone, Check } from 'lucide-react';
import { sounds } from '../utils/sound';

interface SettingsScreenProps {
  language: 'am' | 'en' | 'dual';
  onChangeLanguage: (lang: 'am' | 'en' | 'dual') => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  language,
  onChangeLanguage,
  soundEnabled,
  onToggleSound
}) => {
  return (
    <div className="flex-1 flex flex-col p-3 bg-gradient-to-b from-[#F4F7FB] to-[#E9EFF5] overflow-y-auto space-y-3">
      {/* Title */}
      <div className="pt-1 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-lg font-bold text-[#0C355B] tracking-tight leading-tight">
              ቅንብሮች (Settings)
            </h2>
            <span className="text-[9px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              የማሳያ ሥሪት (Prototype)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            የሥርዓቱ አጠቃቀም እና ምርጫዎች
          </p>
        </div>
      </div>

      {/* Language Section */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-xs space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <Globe size={16} className="text-blue-700" />
          <h3 className="text-xs font-bold text-slate-800">ቋንቋ ይምረጡ (Language)</h3>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => {
              onChangeLanguage('dual');
              sounds.playScanBeep();
            }}
            className={`py-2 px-2 text-center rounded-lg text-xs font-semibold border transition-all ${
              language === 'dual'
                ? 'bg-[#0C355B] text-white border-[#0C355B]'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            አማርኛ + EN
          </button>
          <button
            onClick={() => {
              onChangeLanguage('am');
              sounds.playScanBeep();
            }}
            className={`py-2 px-2 text-center rounded-lg text-xs font-semibold border transition-all ${
              language === 'am'
                ? 'bg-[#0C355B] text-white border-[#0C355B]'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            አማርኛ ብቻ
          </button>
          <button
            onClick={() => {
              onChangeLanguage('en');
              sounds.playScanBeep();
            }}
            className={`py-2 px-2 text-center rounded-lg text-xs font-semibold border transition-all ${
              language === 'en'
                ? 'bg-[#0C355B] text-white border-[#0C355B]'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Sound & Audio Haptics */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 size={16} className="text-blue-700" />
            <div>
              <h3 className="text-xs font-bold text-slate-800">የድምጽ ምላሽ (Scanner Sound Beep)</h3>
              <p className="text-[10px] text-slate-400">ስካን ሲደረግና ጥሰት ሲገኝ የሚሰማ ድምጽ</p>
            </div>
          </div>
          <button
            onClick={() => {
              const newVal = !soundEnabled;
              onToggleSound(newVal);
              sounds.enabled = newVal;
              if (newVal) sounds.playScanBeep();
            }}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              soundEnabled ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Police Station Profile */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-xs space-y-1.5">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={16} className="text-blue-700" />
          <h3 className="text-xs font-bold text-slate-800">የትራፊክ መምሪያ መረጃ</h3>
        </div>
        <div className="text-xs text-slate-600 space-y-1">
          <p><strong className="text-slate-700">ከተማ:</strong> ጎንደር (Gondar City, Amhara)</p>
          <p><strong className="text-slate-700">መምሪያ:</strong> የትራንስፖርትና መንገድ ትራፊክ መምሪያ</p>
          <p><strong className="text-slate-700">የአገልጋይ ስሪት:</strong> v2.5.4 (Gondar-Deploy)</p>
          <p><strong className="text-slate-700">የደህንነት ሁኔታ:</strong> ኦፊሴላዊ የተረጋገጠ ግንኙነት</p>
        </div>
      </div>
    </div>
  );
};
