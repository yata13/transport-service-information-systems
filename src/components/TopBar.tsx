import React from 'react';
import { Menu, X } from 'lucide-react';
import { ShieldLogo } from './ShieldLogo';

interface TopBarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  language: 'am' | 'en' | 'dual';
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar, isSidebarOpen, language }) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3.5 py-2.5 bg-[#0C355B] text-white shadow-md border-b border-blue-900/50 select-none">
      <div className="flex items-center gap-2.5 min-w-0">
        <ShieldLogo size={36} />
        <div className="flex flex-col leading-tight min-w-0">
          <h1 className="text-[13px] font-bold tracking-tight text-white truncate drop-shadow-xs">
            {language === 'en' ? 'Transport Information System' : 'የትራንስፖርት ዕቅድ እና ማረጋገጫ ሥርዓት'}
          </h1>
          <p className="text-[10px] text-blue-200 font-medium tracking-normal truncate">
            {language === 'am' ? 'የጎንደር ከተማ ባጃጅ ትራፊክ ቁጥጥር' : 'Transport Service Information System'}
          </p>
        </div>
      </div>

      <button
        onClick={onToggleSidebar}
        className="w-10 h-10 flex items-center justify-center rounded-lg text-white hover:bg-white/10 active:bg-white/20 transition-colors shrink-0"
        aria-label="Toggle Navigation Menu"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </header>
  );
};
