import React, { useState } from 'react';
import { ErpLayout } from './components/erp/ErpLayout';
import { ErpDashboard } from './components/erp/ErpDashboard';
import { ErpNewVehicleModal } from './components/erp/ErpNewVehicleModal';
import { VehiclesListScreen } from './components/VehiclesListScreen';
import { ReportsScreen } from './components/ReportsScreen';
import { UsersScreen } from './components/UsersScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { VerificationScreen } from './components/VerificationScreen';
import { VerifyingProgressModal } from './components/VerifyingProgressModal';
import { ValidityResultScreen } from './components/ValidityResultScreen';
import { VehicleDetailsScreen } from './components/VehicleDetailsScreen';
import { ViolationReportScreen } from './components/ViolationReportScreen';
import { LoginScreen } from './components/LoginScreen';
import { PdfPermitModal } from './components/PdfPermitModal';
import { INITIAL_BAJAJ_DATABASE, INITIAL_REPORTS } from './data/mockVehicles';
import { BajajVehicle, TrafficViolationReport } from './types';
import { sounds } from './utils/sound';

export default function App() {
  const [database, setDatabase] = useState<BajajVehicle[]>(INITIAL_BAJAJ_DATABASE);
  const [reports, setReports] = useState<TrafficViolationReport[]>(INITIAL_REPORTS);
  
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isNewVehicleModalOpen, setIsNewVehicleModalOpen] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState({
    name: 'አለቃ ደስታ ካሳሁን',
    badge: 'GD-TRF-SUP-01',
    role: 'የጎንደር ትራፊክ መምሪያ ኃላፊ (Director HQ)'
  });

  const [language, setLanguage] = useState<'am' | 'en' | 'dual'>('dual');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Active Verification state (for Roadside desk inside ERP)
  const [activeQuery, setActiveQuery] = useState<{
    type: 'digitalId' | 'qr';
    digitalId: string;
    physicalPlate: string;
    value: string;
    simulatedBajaj?: BajajVehicle;
    isMismatch?: boolean;
  } | null>(null);

  const [selectedVehicle, setSelectedVehicle] = useState<BajajVehicle>(INITIAL_BAJAJ_DATABASE[0]);
  const [isMismatchFlag, setIsMismatchFlag] = useState<boolean>(false);
  const [physicalPlateEntered, setPhysicalPlateEntered] = useState<string>('');
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);

  // Handlers
  const handleLoginSuccess = (user: { name: string; badge: string; role: string }) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sounds.playScanBeep();
  };

  const handleStartVerification = (query: {
    type: 'digitalId' | 'qr';
    digitalId: string;
    physicalPlate: string;
    value: string;
    simulatedBajaj?: BajajVehicle;
    isMismatch?: boolean;
  }) => {
    setActiveQuery(query);
    setPhysicalPlateEntered(query.physicalPlate);
    setCurrentTab('progress');
  };

  const handleVerificationComplete = (bajaj: BajajVehicle, isMismatch: boolean) => {
    setSelectedVehicle(bajaj);
    setIsMismatchFlag(isMismatch);
    setCurrentTab('validityResult');
  };

  const handleAddNewVehicle = async (newVehicle: BajajVehicle) => {
    setDatabase(prev => [newVehicle, ...prev]);
    try {
      await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVehicle),
      });
    } catch (err) {
      console.warn('Vehicle sync to server:', err);
    }
  };

  const handleSubmitViolationReport = async (newReport: TrafficViolationReport) => {
    setReports(prev => [newReport, ...prev]);
    sounds.playAlert();
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport),
      });
    } catch (err) {
      console.warn('Report sync to server:', err);
    }
    setTimeout(() => {
      setCurrentTab('reports');
    }, 800);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        </div>
      </div>
    );
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
      currentUser={currentUser}
    >
      {/* ERP Dynamic View Router */}
      {currentTab === 'dashboard' ? (
        <ErpDashboard
          database={database}
          reports={reports}
          onNavigateTab={setCurrentTab}
          onOpenNewVehicleModal={() => setIsNewVehicleModalOpen(true)}
          onSelectVehicle={(vehicle) => {
            setSelectedVehicle(vehicle);
            setCurrentTab('vehicleDetails');
          }}
        />
      ) : currentTab === 'vehicles' || currentTab === 'permits' ? (
        <VehiclesListScreen
          database={database}
          onSelectVehicle={(vehicle) => {
            setSelectedVehicle(vehicle);
            setCurrentTab('vehicleDetails');
          }}
          onVerifyVehicle={(vehicle) => {
            setSelectedVehicle(vehicle);
            setCurrentTab('verification');
          }}
          onOpenNewVehicleModal={() => setIsNewVehicleModalOpen(true)}
        />
      ) : currentTab === 'reports' || currentTab === 'impounded' ? (
        <ReportsScreen reports={reports} />
      ) : currentTab === 'users' ? (
        <UsersScreen />
      ) : currentTab === 'settings' ? (
        <SettingsScreen
          language={language}
          onChangeLanguage={setLanguage}
          soundEnabled={soundEnabled}
          onToggleSound={setSoundEnabled}
        />
      ) : currentTab === 'verification' ? (
        <VerificationScreen
          onStartVerification={handleStartVerification}
          database={database}
        />
      ) : currentTab === 'progress' && activeQuery ? (
        <VerifyingProgressModal
          query={activeQuery}
          onComplete={handleVerificationComplete}
        />
      ) : currentTab === 'validityResult' ? (
        <ValidityResultScreen
          vehicle={selectedVehicle}
          isClash={isMismatchFlag}
          physicalPlateChecked={physicalPlateEntered}
          onViewDetails={() => setCurrentTab('vehicleDetails')}
          onNewCheck={() => setCurrentTab('verification')}
          onOpenReport={() => setCurrentTab('violationReport')}
        />
      ) : currentTab === 'vehicleDetails' ? (
        <VehicleDetailsScreen
          vehicle={selectedVehicle}
          onNewCheck={() => setCurrentTab('verification')}
          onOpenReport={() => setCurrentTab('violationReport')}
          onViewPdf={() => setShowPdfModal(true)}
          onBack={() => setCurrentTab('vehicles')}
        />
      ) : currentTab === 'violationReport' ? (
        <ViolationReportScreen
          vehicle={selectedVehicle}
          isMismatch={isMismatchFlag}
          onBack={() => setCurrentTab('validityResult')}
          onSubmitReport={handleSubmitViolationReport}
          inspectorName={currentUser.name}
        />
      ) : (
        <ErpDashboard
          database={database}
          reports={reports}
          onNavigateTab={setCurrentTab}
          onOpenNewVehicleModal={() => setIsNewVehicleModalOpen(true)}
          onSelectVehicle={(vehicle) => {
            setSelectedVehicle(vehicle);
            setCurrentTab('vehicleDetails');
          }}
        />
      )}

      {/* New Bajaj Registration Modal */}
      <ErpNewVehicleModal
        isOpen={isNewVehicleModalOpen}
        onClose={() => setIsNewVehicleModalOpen(false)}
        onAddVehicle={handleAddNewVehicle}
      />

      {/* Printable PDF Permit Modal */}
      {showPdfModal && (
        <PdfPermitModal
          vehicle={selectedVehicle}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </ErpLayout>
  );
}
