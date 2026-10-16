import React, { useState } from 'react';
import { ErpLayout } from './components/erp/ErpLayout';
import { ErpDashboard } from './components/erp/ErpDashboard';
import { ErpNewVehicleModal } from './components/erp/ErpNewVehicleModal';
import { VehiclesListScreen } from './components/VehiclesListScreen';
import { ReportsScreen } from './components/ReportsScreen';
import { UsersScreen } from './components/UsersScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { VehicleDetailsScreen } from './components/VehicleDetailsScreen';
import { ViolationReportScreen } from './components/ViolationReportScreen';
import { LoginScreen } from './components/LoginScreen';
import { PdfPermitModal } from './components/PdfPermitModal';
import { QrCardModal } from './components/QrCardModal';
import { BajajVehicle, ReportStatus, SessionUser, TrafficViolationReport } from './types';
import { sounds } from './utils/sound';
import { useLiveData } from './hooks/useLiveData';
import { insertReport, insertVehicle, updateReportStatus } from './lib/api';
import { clearSession, loadSession, saveSession } from './lib/session';

export default function App() {
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(() => loadSession());
  const live = useLiveData(currentUser !== null);
  const { vehicles, reports, inspections, officers } = live;

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isNewVehicleModalOpen, setIsNewVehicleModalOpen] = useState<boolean>(false);
  const [newQrVehicle, setNewQrVehicle] = useState<BajajVehicle | null>(null);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  const [language, setLanguage] = useState<'am' | 'en' | 'dual'>('dual');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [selectedVehicle, setSelectedVehicle] = useState<BajajVehicle | null>(null);
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);

  const handleLoginSuccess = (user: SessionUser) => {
    saveSession(user);
    setCurrentUser(user);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    sounds.playScanBeep();
  };

  // Throws on failure so the modal can show the error and stay open.
  const handleAddNewVehicle = async (newVehicle: BajajVehicle) => {
    const saved = await insertVehicle(newVehicle);
    live.applyVehicle(saved);
    // Show the new user's QR right away so it can be printed and scanned by the app.
    setNewQrVehicle(saved);
  };

  // Throws on failure so the report form can show the error.
  const handleSubmitViolationReport = async (newReport: TrafficViolationReport) => {
    const saved = await insertReport(newReport);
    live.applyReport(saved);
    sounds.playAlert();
    setTimeout(() => setCurrentTab('reports'), 800);
  };

  const handleUpdateReportStatus = async (report: TrafficViolationReport, status: ReportStatus) => {
    await updateReportStatus(report.id, status);
    live.applyReport({ ...report, status });
  };

  const openVehicle = (vehicle: BajajVehicle) => {
    setSelectedVehicle(vehicle);
    setCurrentTab('vehicleDetails');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        </div>
      </div>
    );
  }

  const dashboard = (
    <ErpDashboard
      database={vehicles}
      reports={reports}
      inspections={inspections}
      onNavigateTab={setCurrentTab}
      onOpenNewVehicleModal={() => setIsNewVehicleModalOpen(true)}
      onSelectVehicle={openVehicle}
    />
  );

  let page: React.ReactNode;
  if (currentTab === 'vehicles' || currentTab === 'permits') {
    page = (
      <VehiclesListScreen
        database={vehicles}
        initialSearch={globalSearch}
        onSelectVehicle={openVehicle}
        onOpenNewVehicleModal={() => setIsNewVehicleModalOpen(true)}
      />
    );
  } else if (currentTab === 'reports' || currentTab === 'impounded') {
    page = (
      <ReportsScreen
        key={currentTab}
        reports={reports}
        initialStatus={currentTab === 'impounded' ? 'IMPOUNDED' : 'ALL'}
        onUpdateStatus={handleUpdateReportStatus}
      />
    );
  } else if (currentTab === 'users') {
    page = <UsersScreen officers={officers} reports={reports} inspections={inspections} onChanged={live.refresh} />;
  } else if (currentTab === 'settings') {
    page = (
      <SettingsScreen
        language={language}
        onChangeLanguage={setLanguage}
        soundEnabled={soundEnabled}
        onToggleSound={setSoundEnabled}
        syncStatus={live.status}
        lastSync={live.lastSync}
        syncError={live.error}
        onRefresh={live.refresh}
      />
    );
  } else if (currentTab === 'vehicleDetails' && selectedVehicle) {
    page = (
      <VehicleDetailsScreen
        vehicle={selectedVehicle}
        onOpenReport={() => setCurrentTab('violationReport')}
        onViewPdf={() => setShowPdfModal(true)}
        onBack={() => setCurrentTab('vehicles')}
      />
    );
  } else if (currentTab === 'violationReport' && selectedVehicle) {
    page = (
      <ViolationReportScreen
        vehicle={selectedVehicle}
        onBack={() => setCurrentTab('vehicleDetails')}
        onSubmitReport={handleSubmitViolationReport}
        inspectorName={currentUser.name}
      />
    );
  } else {
    page = dashboard;
  }

  return (
    <ErpLayout
      currentTab={currentTab}
      onSelectTab={(tab) => {
        sounds.playScanBeep();
        setCurrentTab(tab);
      }}
      onLogout={handleLogout}
      onOpenNewVehicleModal={() => setIsNewVehicleModalOpen(true)}
      onGlobalSearch={(term) => {
        setGlobalSearch(term);
        if (term.trim() && currentTab !== 'vehicles' && currentTab !== 'permits') setCurrentTab('vehicles');
      }}
      currentUser={currentUser}
      syncStatus={live.status}
      lastSync={live.lastSync}
    >
      {page}

      {/* New Bajaj Registration Modal */}
      <ErpNewVehicleModal
        isOpen={isNewVehicleModalOpen}
        onClose={() => setIsNewVehicleModalOpen(false)}
        onAddVehicle={handleAddNewVehicle}
      />

      {newQrVehicle && <QrCardModal vehicle={newQrVehicle} onClose={() => setNewQrVehicle(null)} />}

      {/* Printable PDF Permit Modal */}
      {showPdfModal && selectedVehicle && (
        <PdfPermitModal vehicle={selectedVehicle} onClose={() => setShowPdfModal(false)} />
      )}
    </ErpLayout>
  );
}
