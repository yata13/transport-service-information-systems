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
import { BajajVehicle, InspectionResult, ReportStatus, SessionUser, TrafficViolationReport } from './types';
import { sounds } from './utils/sound';
import { useLiveData } from './hooks/useLiveData';
import { insertInspection, insertReport, insertVehicle, updateReportStatus } from './lib/api';
import { clearSession, loadSession, saveSession } from './lib/session';

interface ActiveQuery {
  type: 'digitalId' | 'qr';
  digitalId: string;
  physicalPlate: string;
  value: string;
  simulatedBajaj?: BajajVehicle;
  isMismatch?: boolean;
  isNotFound?: boolean;
}

function inspectionResultFor(vehicle: BajajVehicle, isMismatch: boolean, isNotFound: boolean): InspectionResult {
  if (isNotFound) return 'NOT_FOUND';
  if (isMismatch) return 'MISMATCH';
  if (vehicle.isBlacklisted || vehicle.status === 'SUSPENDED' || vehicle.status === 'ILLEGAL') return 'SUSPENDED';
  if (vehicle.status === 'EXPIRED') return 'EXPIRED';
  return 'VALID';
}

/** Placeholder record shown when a scanned ID is not in the registry. */
function unregisteredVehicle(digitalId: string): BajajVehicle {
  return {
    id: `unregistered-${digitalId}`,
    digitalId,
    plateNumber: '-',
    vin: '-',
    vehicleType: 'Bajaj (ባጃጅ)',
    bajajModel: '-',
    bajajAssociation: '-',
    color: '-',
    owner: 'ያልታወቀ ግለሰብ (Unknown)',
    ownerPhone: '-',
    driverName: 'ያልተመዘገበ አሽከርካሪ',
    driverPhone: '-',
    driverPhoto: '',
    kebele: 'ያልታወቀ',
    address: 'በጎንደር ከተማ መዝገብ ውስጥ የለም',
    permitNo: 'NO-PERMIT',
    issueDate: '-',
    expiryDate: '-',
    authorizedArea: 'ያልተፈቀደ (Illegal)',
    status: 'ILLEGAL',
    isBlacklisted: true,
    blacklistReason: 'በጎንደር ትራንስፖርት ዳታቤዝ ውስጥ ያልተገኘ ህገወጥ ተሽከርካሪ (Not in registry)',
    qrCodeValue: digitalId,
    registeredCity: 'Gondar / ጎንደር',
  };
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(() => loadSession());
  const live = useLiveData(currentUser !== null);
  const { vehicles, reports, inspections, officers } = live;

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isNewVehicleModalOpen, setIsNewVehicleModalOpen] = useState<boolean>(false);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  const [language, setLanguage] = useState<'am' | 'en' | 'dual'>('dual');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Active Verification state (for Roadside desk inside ERP)
  const [activeQuery, setActiveQuery] = useState<ActiveQuery | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<BajajVehicle | null>(null);
  const [isMismatchFlag, setIsMismatchFlag] = useState<boolean>(false);
  const [physicalPlateEntered, setPhysicalPlateEntered] = useState<string>('');
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

  const handleStartVerification = (query: ActiveQuery) => {
    setActiveQuery(query);
    setPhysicalPlateEntered(query.physicalPlate);
    setCurrentTab('progress');
  };

  const handleVerificationComplete = (bajaj: BajajVehicle, isMismatch: boolean) => {
    const isNotFound = !!activeQuery?.isNotFound;
    setSelectedVehicle(bajaj);
    setIsMismatchFlag(isMismatch);
    setCurrentTab('validityResult');

    if (currentUser) {
      insertInspection({
        digitalId: activeQuery?.digitalId || bajaj.digitalId,
        plateChecked: activeQuery?.physicalPlate || '',
        registeredPlate: isNotFound ? '' : bajaj.plateNumber,
        result: inspectionResultFor(bajaj, isMismatch, isNotFound),
        officerName: currentUser.name,
        badgeNumber: currentUser.badge,
        location: 'ERP HQ Desk',
        source: 'web',
      }).catch((err) => console.warn(err));
    }
  };

  // Throws on failure so the modal can show the error and stay open.
  const handleAddNewVehicle = async (newVehicle: BajajVehicle) => {
    const saved = await insertVehicle(newVehicle);
    live.applyVehicle(saved);
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
        onVerifyVehicle={(vehicle) => {
          setSelectedVehicle(vehicle);
          setCurrentTab('verification');
        }}
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
  } else if (currentTab === 'verification') {
    page = (
      <VerificationScreen
        onStartVerification={handleStartVerification}
        database={vehicles}
        initialDigitalId={selectedVehicle?.digitalId}
      />
    );
  } else if (currentTab === 'progress' && activeQuery) {
    page = (
      <VerifyingProgressModal
        query={{
          ...activeQuery,
          simulatedBajaj: activeQuery.simulatedBajaj || unregisteredVehicle(activeQuery.digitalId),
        }}
        onComplete={handleVerificationComplete}
      />
    );
  } else if (currentTab === 'validityResult' && selectedVehicle) {
    page = (
      <ValidityResultScreen
        vehicle={selectedVehicle}
        isClash={isMismatchFlag}
        physicalPlateChecked={physicalPlateEntered}
        onViewDetails={() => setCurrentTab('vehicleDetails')}
        onNewCheck={() => setCurrentTab('verification')}
        onOpenReport={() => setCurrentTab('violationReport')}
      />
    );
  } else if (currentTab === 'vehicleDetails' && selectedVehicle) {
    page = (
      <VehicleDetailsScreen
        vehicle={selectedVehicle}
        onNewCheck={() => setCurrentTab('verification')}
        onOpenReport={() => setCurrentTab('violationReport')}
        onViewPdf={() => setShowPdfModal(true)}
        onBack={() => setCurrentTab('vehicles')}
      />
    );
  } else if (currentTab === 'violationReport' && selectedVehicle) {
    page = (
      <ViolationReportScreen
        vehicle={selectedVehicle}
        isMismatch={isMismatchFlag}
        physicalPlate={physicalPlateEntered}
        onBack={() => setCurrentTab('validityResult')}
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

      {/* Printable PDF Permit Modal */}
      {showPdfModal && selectedVehicle && (
        <PdfPermitModal vehicle={selectedVehicle} onClose={() => setShowPdfModal(false)} />
      )}
    </ErpLayout>
  );
}
