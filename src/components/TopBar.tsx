import React from 'react';
import { Menu, X, LayoutDashboard, QrCode, Car, FileWarning, Settings as SettingsIcon } from 'lucide-react';
import { ShieldLogo } from './ShieldLogo';
import { NavScreen } from '../types';

interface TopBarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  language: 'am' | 'en' | 'dual';
  currentScreen?: NavScreen;
  onNavigate?: (screen: NavScreen) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleSidebar,
  isSidebarOpen,
  language,
  currentScreen = 'dashboard',
  onNavigate,
}) => {
  const navItems = [
    { id: 'dashboard' as NavScreen, labelAm: 'መነሻ', labelEn: 'Dashboard', icon: LayoutDashboard },
    { id: 'verification' as NavScreen, labelAm: 'ማረጋገጫ', labelEn: 'Verify', icon: QrCode },
    { id: 'vehicles' as NavScreen, labelAm: 'መዝገብ', labelEn: 'Vehicles', icon: Car },
    { id: 'reports' as NavScreen, labelAm: 'ቅጣቶች', labelEn: 'Reports', icon: FileWarning },
    { id: 'settings' as NavScreen, labelAm: 'ቅንብሮች', labelEn: 'Settings', icon: SettingsIcon },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3.5 py-2.5 bg-[#0C355B] text-white shadow-md border-b border-blue-900/50 select-none">
      {/* Brand & Crest */}
      <div
        className="flex items-center gap-2.5 min-w-0 cursor-pointer"
        onClick={() => onNavigate && onNavigate('dashboard')}
      >
        <ShieldLogo size={36} />
        <div className="flex flex-col leading-tight min-w-0">
          <h1 className="text-[13px] sm:text-[14px] font-bold tracking-tight text-white truncate drop-shadow-xs">
            {language === 'en' ? 'Transport Information System' : 'የትራንስፖርት ዕቅድ እና ማረጋገጫ ሥርዓት'}
          </h1>
          <p className="text-[10px] sm:text-[11px] text-blue-200 font-medium tracking-normal truncate">
            {language === 'am' ? 'የጎንደር ከተማ ባጃጅ ትራፊክ ቁጥጥር' : 'Gondar City Traffic & Transport Service'}
          </p>
        </div>
      </div>

      {/* Desktop Quick Navigation Links */}
      {onNavigate && (
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white/20 text-white shadow-inner border border-white/30'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-amber-300' : 'text-blue-200'} />
                <span>{item.labelAm}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Mobile Drawer Hamburger Button */}
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
