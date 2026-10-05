import React from 'react';
import { 
  Home, 
  ShieldCheck, 
  Car, 
  BarChart2, 
  Users, 
  Settings, 
  LogOut,
  X
} from 'lucide-react';
import { NavScreen } from '../types';
import { ShieldLogo } from './ShieldLogo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen: NavScreen;
  onNavigate: (screen: NavScreen) => void;
  onLogout: () => void;
  currentUser: { name: string; badge: string };
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentScreen,
  onNavigate,
  onLogout,
  currentUser
}) => {
  const menuItems = [
    {
      id: 'dashboard' as NavScreen,
      labelAm: 'መነሻ ገጽ',
      labelEn: 'Dashboard',
      icon: Home
    },
    {
      id: 'verification' as NavScreen,
      labelAm: 'ማረጋገጫ',
      labelEn: 'Verification',
      icon: ShieldCheck
    },
    {
      id: 'vehicles' as NavScreen,
      labelAm: 'ተሽከርካሪዎች',
      labelEn: 'Vehicles',
      icon: Car
    },
    {
      id: 'reports' as NavScreen,
      labelAm: 'ሪፖርቶች',
      labelEn: 'Reports',
      icon: BarChart2
    },
    {
      id: 'users' as NavScreen,
      labelAm: 'ተጠቃሚዎች',
      labelEn: 'Users',
      icon: Users
    },
    {
      id: 'settings' as NavScreen,
      labelAm: 'ቅንብሮች',
      labelEn: 'Settings',
      icon: Settings
    }
  ];

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="absolute inset-0 bg-black/50 z-40 backdrop-blur-[2px] transition-opacity"
        />
      )}

      {/* Sliding Drawer */}
      <aside
        className={`absolute top-0 bottom-0 left-0 z-50 w-[240px] bg-[#0A2E50] text-white flex flex-col transition-transform duration-300 ease-out shadow-2xl border-r border-blue-900/60 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="p-4 border-b border-blue-800/50 flex flex-col items-center text-center relative bg-gradient-to-b from-[#0e3b68] to-[#0a2e50]">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-blue-300 hover:text-white p-1 rounded-md active:bg-blue-800/40"
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>

          <ShieldLogo size={46} className="mb-2" />
          <p className="text-[11px] font-bold text-blue-100 leading-tight">
            የትራንስፖርት ዕቅድ እና ማረጋገጫ ሥርዓት
          </p>
          <span className="text-[9px] text-blue-300 mt-0.5">
            የጎንደር ከተማ መንገድ ትራፊክ
          </span>
        </div>

        {/* Current Officer Info Badge */}
        <div className="px-3 py-2 bg-blue-950/70 border-b border-blue-900/50 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
            <p className="text-[10px] text-blue-300 truncate">መታወቂያ: {currentUser.badge}</p>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id || 
              (item.id === 'verification' && (currentScreen === 'progress' || currentScreen === 'vehicleDetails' || currentScreen === 'violationReport'));

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                  isActive
                    ? 'bg-[#1E5D96] text-white font-semibold shadow-inner'
                    : 'text-blue-100/90 hover:bg-blue-800/40 hover:text-white'
                }`}
              >
                <Icon size={19} className={isActive ? 'text-white' : 'text-blue-300'} />
                <div className="flex flex-col text-left">
                  <span className="text-[12px] font-medium leading-none">{item.labelAm}</span>
                  <span className="text-[10px] text-blue-200/80 leading-none mt-1">{item.labelEn}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Logout action */}
        <div className="p-3 border-t border-blue-900/50 bg-[#082440]">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-red-200 hover:bg-red-900/30 hover:text-red-100 transition-colors"
          >
            <LogOut size={19} className="text-red-400" />
            <div className="flex flex-col text-left">
              <span className="text-[12px] font-medium leading-none">ውጣ</span>
              <span className="text-[10px] text-red-300/80 leading-none mt-1">Logout</span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
