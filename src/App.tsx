import React, { useState } from 'react';
import { PhoneFrame } from './components/PhoneFrame';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { LoginScreen } from './components/LoginScreen';
import { VerificationScreen } from './components/VerificationScreen';
import { VerifyingProgressModal } from './components/VerifyingProgressModal';
import { ValidityResultScreen } from './components/ValidityResultScreen';
import { VehicleDetailsScreen } from './components/VehicleDetailsScreen';
import { ViolationReportScreen } from './components/ViolationReportScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { VehiclesListScreen } from './components/VehiclesListScreen';
import { ReportsScreen } from './components/ReportsScreen';
import { UsersScreen } from './components/UsersScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { PdfPermitModal } from './components/PdfPermitModal';
import { INITIAL_BAJAJ_DATABASE, INITIAL_REPORTS } from './data/mockVehicles';
import { BajajVehicle, NavScreen, TrafficViolationReport } from './types';
import { sounds } from './utils/sound';

export default function App() {
  const [database, setDatabase] = useState<BajajVehicle[]>(INITIAL_BAJAJ_DATABASE);
  const [reports, setReports] = useState<TrafficViolationReport[]>(INITIAL_REPORTS);
  
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [currentScreen, setCurrentScreen] = useState<NavScreen>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState({
    name: 'ኢንስፔክተር አበበ ተሰማ',
    badge: 'GD-TRF-042',
    role: 'Field Traffic Inspector'
  });

  const [language, setLanguage] = useState<'am' | 'en' | 'dual'>('dual');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Active Verification state
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
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentScreen('login');
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
    setCurrentScreen('progress');
  };

  const handleVerificationComplete = (bajaj: BajajVehicle, isMismatch: boolean) => {
    setSelectedVehicle(bajaj);
    setIsMismatchFlag(isMismatch);
    setCurrentScreen('validityResult');
  };

  const handleSubmitViolationReport = (newReport: TrafficViolationReport) => {
    setReports(prev => [newReport, ...prev]);
    sounds.playAlert();
    setTimeout(() => {
      setCurrentScreen('reports');
    }, 1000);
  };

  return (
    <PhoneFrame
      soundEnabled={soundEnabled}
      onToggleSound={() => {
        const val = !soundEnabled;
        setSoundEnabled(val);
        sounds.enabled = val;
      }}
    >
      {/* Top Application Bar */}
      <TopBar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        language={language}
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
      />

      {/* Sliding Navigation Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      {/* Main Screen Router */}
      <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
        {!isLoggedIn || currentScreen === 'login' ? (
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        ) : currentScreen === 'verification' ? (
          <VerificationScreen
            onStartVerification={handleStartVerification}
            database={database}
          />
        ) : currentScreen === 'progress' && activeQuery ? (
          <VerifyingProgressModal
            query={activeQuery}
            onComplete={handleVerificationComplete}
          />
        ) : currentScreen === 'validityResult' ? (
          <ValidityResultScreen
            vehicle={selectedVehicle}
            isClash={isMismatchFlag}
            physicalPlateChecked={physicalPlateEntered}
            onViewDetails={() => setCurrentScreen('vehicleDetails')}
            onNewCheck={() => setCurrentScreen('verification')}
            onOpenReport={() => setCurrentScreen('violationReport')}
          />
        ) : currentScreen === 'vehicleDetails' ? (
          <VehicleDetailsScreen
            vehicle={selectedVehicle}
            onNewCheck={() => setCurrentScreen('verification')}
            onOpenReport={() => setCurrentScreen('violationReport')}
            onViewPdf={() => setShowPdfModal(true)}
            onBack={() => setCurrentScreen('validityResult')}
          />
        ) : currentScreen === 'violationReport' ? (
          <ViolationReportScreen
            vehicle={selectedVehicle}
            isMismatch={isMismatchFlag}
            onBack={() => setCurrentScreen(isMismatchFlag ? 'validityResult' : 'vehicleDetails')}
            onSubmitReport={handleSubmitViolationReport}
            inspectorName={currentUser.name}
          />
        ) : currentScreen === 'dashboard' ? (
          <DashboardScreen
            database={database}
            reports={reports}
            onStartInspection={() => setCurrentScreen('verification')}
            onSelectVehicle={(bajaj) => {
              setSelectedVehicle(bajaj);
              setIsMismatchFlag(false);
              setPhysicalPlateEntered(bajaj.plateNumber);
              setCurrentScreen('validityResult');
            }}
          />
        ) : currentScreen === 'vehicles' ? (
          <VehiclesListScreen
            database={database}
            onSelectVehicle={(bajaj) => {
              setSelectedVehicle(bajaj);
              setIsMismatchFlag(false);
              setPhysicalPlateEntered(bajaj.plateNumber);
              setCurrentScreen('validityResult');
            }}
            onVerifyVehicle={(bajaj) => {
              handleStartVerification({
                type: 'digitalId',
                digitalId: bajaj.digitalId,
                physicalPlate: bajaj.plateNumber,
                value: bajaj.digitalId,
                simulatedBajaj: bajaj,
                isMismatch: false
              });
            }}
          />
        ) : currentScreen === 'reports' ? (
          <ReportsScreen reports={reports} />
        ) : currentScreen === 'users' ? (
          <UsersScreen />
        ) : currentScreen === 'settings' ? (
          <SettingsScreen
            language={language}
            onChangeLanguage={setLanguage}
            soundEnabled={soundEnabled}
            onToggleSound={setSoundEnabled}
          />
        ) : (
          <VerificationScreen
            onStartVerification={handleStartVerification}
            database={database}
          />
        )}
      </main>

      {/* PDF Permit Modal */}
      {showPdfModal && (
        <PdfPermitModal
          vehicle={selectedVehicle}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </PhoneFrame>
  );
}
