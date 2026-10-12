import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Car, 
  Receipt, 
  Users, 
  Settings as SettingsIcon, 
  QrCode, 
  Search, 
  Bell, 
  Plus, 
  LogOut, 
  Database, 
  ChevronRight, 
  Menu, 
  X,
  FileCheck2,
  ShieldAlert
} from 'lucide-react';
import { ShieldLogo } from '../ShieldLogo';
import { SessionUser, SyncStatus } from '../../types';

interface ErpLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  onOpenNewVehicleModal: () => void;
  onGlobalSearch?: (term: string) => void;
  currentUser: SessionUser;
  syncStatus: SyncStatus;
  lastSync: Date | null;
  children: React.ReactNode;
}

const isSmallScreen = () => typeof window !== 'undefined' && window.innerWidth < 1024;

export const ErpLayout: React.FC<ErpLayoutProps> = ({
  currentTab,
  onSelectTab,
  onLogout,
  onOpenNewVehicleModal,
  onGlobalSearch,
  currentUser,
  syncStatus,
  lastSync,
  children,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => !isSmallScreen());
  const [isMobile, setIsMobile] = useState(isSmallScreen);

  useEffect(() => {
    const onResize = () => setIsMobile(isSmallScreen());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleSelect = (tab: string) => {
    onSelectTab(tab);
    if (isMobile) setIsSidebarOpen(false);
  };

  const syncBadge =
    syncStatus === 'live'
      ? { cls: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500 animate-pulse', label: 'በቀጥታ ተገናኝቷል (Live Sync)' }
      : syncStatus === 'polling'
        ? { cls: 'bg-sky-50 text-sky-800 border-sky-200', dot: 'bg-sky-500', label: 'ተመሳስሏል (Synced · auto-refresh)' }
      : syncStatus === 'connecting'
        ? { cls: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500 animate-pulse', label: 'በማገናኘት ላይ... (Connecting)' }
        : { cls: 'bg-red-50 text-red-800 border-red-200', dot: 'bg-red-500', label: 'ከመስመር ውጭ (Offline)' };

  const menuSections = [
    {
      title: 'ጠቅላላ መረጃ (Overview)',
      items: [
        { id: 'dashboard', labelAm: 'ማዕከላዊ ዳሽቦርድ', labelEn: 'Executive Dashboard', icon: LayoutDashboard },
        { id: 'verification', labelAm: 'የመንገድ ላይ ፍተሻ', labelEn: 'Roadside Verifier (2-Step)', icon: QrCode },
      ],
    },
    {
      title: 'የተሽከርካሪ አስተዳደር (Fleet & Permits)',
      items: [
        { id: 'vehicles', labelAm: 'የባጃጅ መዝገብ', labelEn: 'Fleet Registry & Records', icon: Car },
        { id: 'permits', labelAm: 'የመንገድ ፈቃድ ሰነዶች', labelEn: 'Transit Permits & Certificates', icon: FileCheck2 },
      ],
    },
    {
      title: 'ህግ ማስከበር (Enforcement & Fines)',
      items: [
        { id: 'reports', labelAm: 'የጥሰት እና ቅጣት መዝገብ', labelEn: 'Violations & Fines Ledger', icon: Receipt },
        { id: 'impounded', labelAm: 'የታገዱ ተሽከርካሪዎች', labelEn: 'Impounded & Suspended', icon: ShieldAlert },
      ],
    },
    {
      title: 'መምሪያ አስተዳደር (Management)',
      items: [
        { id: 'users', labelAm: 'የትራፊክ ፖሊስ አባላት', labelEn: 'Officers & Workforce', icon: Users },
        { id: 'settings', labelAm: 'የስርዓት ቅንብሮች', labelEn: 'Settings & Cloud Sync', icon: SettingsIcon },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex text-slate-800 antialiased font-sans">
      {/* ERP Collapsible Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-[#0C355B] text-white flex flex-col transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : isMobile ? 'w-64 -translate-x-full' : 'w-20'
        } shrink-0 shadow-2xl`}
      >
        {/* Sidebar Header Brand */}
        <div className="p-4 border-b border-blue-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <ShieldLogo size={38} />
            {isSidebarOpen && (
              <div className="min-w-0 leading-tight">
                <h1 className="text-sm font-extrabold tracking-tight truncate text-white">
                  ጎንደር ትራንስፖርት ERP
                </h1>
                <p className="text-[10px] text-blue-200 truncate">
                  ማዕከላዊ የትራፊክ አስተዳደር
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Sidebar Navigation Groups */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {menuSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {isSidebarOpen && (
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-300/70 px-3 mb-1.5">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id || (item.id === 'vehicles' && currentTab === 'permits');

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-sm'
                        : 'text-blue-100/90 hover:bg-white/10 hover:text-white'
                    }`}
                    title={item.labelAm}
                  >
                    <Icon size={18} className={isActive ? 'text-amber-300' : 'text-blue-200'} />
                    {isSidebarOpen && (
                      <div className="text-left flex-1 min-w-0">
                        <div className="truncate leading-tight">{item.labelAm}</div>
                        <div className="text-[9px] text-blue-200/70 truncate">{item.labelEn}</div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Officer Profile & Logout */}
        <div className="p-3 border-t border-blue-900/60 bg-[#082643]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/60 border border-blue-400/40 flex items-center justify-center font-bold text-xs text-white shrink-0">
              {currentUser.name.slice(0, 1)}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate text-white">{currentUser.name}</div>
                <div className="text-[10px] text-amber-300 font-mono truncate">{currentUser.badge}</div>
              </div>
            )}
            <button
              onClick={onLogout}
              className="text-white/60 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/10 transition"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 ${
          isMobile ? 'ml-0' : isSidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* Top ERP Command Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200/80 px-3 sm:px-6 py-3 flex items-center justify-between gap-2 shadow-2xs">
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg text-[#0C355B] hover:bg-slate-100 shrink-0"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          )}
          {/* Global Search Bar */}
          <div className="flex-1 max-w-lg min-w-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (onGlobalSearch) onGlobalSearch(e.target.value);
                }}
                placeholder="በሰሌዳ ቁጥር፣ ዲጂታል መታወቂያ፣ ወይም በባለቤት ስም ፈልግ..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Right Header Status Badges & Quick Action */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            {/* Live Database Sync Badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border text-[11px] font-semibold ${syncBadge.cls}`}
              title={lastSync ? `Last update: ${lastSync.toLocaleTimeString()}` : undefined}
            >
              <span className={`w-2 h-2 rounded-full ${syncBadge.dot}`} />
              <span className="hidden sm:inline">{syncBadge.label}</span>
            </div>

            {/* Quick Register Vehicle Button */}
            <button
              onClick={onOpenNewVehicleModal}
              className="px-3.5 py-2 bg-[#0C355B] hover:bg-[#092B4B] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus size={15} />
              <span className="hidden md:inline">አዲስ ባጃጅ መዝግብ</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
