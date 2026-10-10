import React, { useState, useEffect, useRef } from 'react';
import { Camera, QrCode, X, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import QRCode from 'qrcode';
import { BajajVehicle } from '../types';
import { sounds } from '../utils/sound';

interface VerificationScreenProps {
  onStartVerification: (query: {
    type: 'digitalId' | 'qr';
    digitalId: string;
    physicalPlate: string;
    simulatedBajaj?: BajajVehicle;
    isMismatch?: boolean;
    value: string;
  }) => void;
  database: BajajVehicle[];
}

export const VerificationScreen: React.FC<VerificationScreenProps> = ({
  onStartVerification,
  database,
}) => {
  // Step 1: Scan Digital ID / QR
  // Step 2: Screen changes and asks for Plate Number Only!
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Step 1 State: Digital ID / QR
  const [digitalIdInput, setDigitalIdInput] = useState('DID-25-000784521');
  const [scannedDigitalId, setScannedDigitalId] = useState('DID-25-000784521');
  const [matchedVehicle, setMatchedVehicle] = useState<BajajVehicle | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Step 2 State: Plate Number Only
  const [physicalPlateInput, setPhysicalPlateInput] = useState('');
  const [step2Error, setStep2Error] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Generate dynamic QR code preview based on current Digital ID
  useEffect(() => {
    const valueToEncode = digitalIdInput.trim() || 'DID-25-000784521';
    QRCode.toDataURL(valueToEncode, {
      margin: 1,
      width: 220,
      color: {
        dark: '#0c355b',
        light: '#ffffff',
      },
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch(() => {});
  }, [digitalIdInput]);

  // Handle live camera scanner
  const startCameraScan = async () => {
    setIsScanning(true);
    setCameraError(null);
    sounds.playScanBeep();

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch {
      setCameraError('የካሜራ ፈቃድ ያስፈልጋል (Camera access not granted)');
    }
  };

  const stopCameraScan = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // Called when QR is detected or user submits Step 1
  const proceedToStep2WithDigitalId = (didValue: string) => {
    const clean = didValue.trim();
    if (!clean) return;

    sounds.playScanBeep();
    stopCameraScan();

    // Find in registry
    const match = database.find(
      (b) =>
        b.digitalId.toLowerCase() === clean.toLowerCase() ||
        b.qrCodeValue.toLowerCase().includes(clean.toLowerCase())
    );

    setScannedDigitalId(clean);
    setMatchedVehicle(match || database[0]);
    // Pre-suggest matching plate for easy test, but allow changing
    setPhysicalPlateInput(match ? match.plateNumber : '3-AM-04891');
    setStep2Error(null);
    setCurrentStep(2); // CHANGE PAGE TO STEP 2 (Plate Number Only)!
  };

  // Handle Step 2 Final Submission (Comparing physical plate vs. registered plate)
  const handleFinalVerification = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!physicalPlateInput.trim()) {
      setStep2Error('እባክዎ በተሽከርካሪው ላይ የሚታየውን ታርጋ ያስገቡ (Please enter plate number)');
      return;
    }

    sounds.playScanBeep();

    const cleanInput = physicalPlateInput.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const registeredPlate = matchedVehicle
      ? matchedVehicle.plateNumber.toUpperCase().replace(/[^A-Z0-9]/g, '')
      : '';

    // Check if the physical plate entered matches the registered plate of that QR code!
    const isClashOrMismatch = cleanInput !== registeredPlate;

    onStartVerification({
      type: 'qr',
      digitalId: scannedDigitalId,
      physicalPlate: physicalPlateInput.trim().toUpperCase(),
      simulatedBajaj: matchedVehicle || database[0],
      isMismatch: isClashOrMismatch,
      value: scannedDigitalId,
    });
  };

  return (
    <div className="flex-1 flex flex-col p-3 bg-gradient-to-b from-[#F4F7FB] to-[#E9EFF5] overflow-y-auto">
      {/* Stepper Progress Bar */}
      <div className="flex items-center justify-between pt-1 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#0C355B] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            {currentStep === 1 ? '1' : '2'}
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0C355B] tracking-tight leading-tight">
              {currentStep === 1
                ? 'ደረጃ 1፡ ዲጂታል መታወቂያ / QR ኮድ'
                : 'ደረጃ 2፡ የሰሌዳ ቁጥር (ታርጋ) ማረጋገጫ'}
            </h2>
            <span className="text-[11px] font-semibold text-slate-500 block leading-none">
              {currentStep === 1
                ? 'Step 1: Scan Digital ID / QR Code Only'
                : 'Step 2: Enter Physical Plate on Vehicle'}
            </span>
          </div>
        </div>

        {/* Step Indicator Badge */}
        <div className="flex items-center gap-1.5 text-xs font-bold bg-white px-2.5 py-1 rounded-full border border-slate-200 text-[#0C355B]">
          <span className={currentStep === 1 ? 'text-blue-600 font-black' : 'text-slate-400'}>
            ደረጃ 1
          </span>
          <span className="text-slate-300">/</span>
          <span className={currentStep === 2 ? 'text-blue-600 font-black' : 'text-slate-400'}>
            ደረጃ 2
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: ONLY DIGITAL ID / QR CODE (All other navigation tabs removed!)     */}
      {/* ========================================================================= */}
      {currentStep === 1 ? (
        <div className="bg-white rounded-2xl shadow-md border border-slate-200/90 p-4 space-y-4">
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-[#0C355B]">
            <QrCode size={18} className="text-blue-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">ዲጂታል መታወቂያ ወይም የፈቃድ QR ኮድ ብቻ ይቃኙ</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                በመጀመሪያ ደረጃ የባጃጁን ዲጂታል ፈቃድ QR ኮድ ካሜራውን በመክፈት ይቃኙ ወይም መታወቂያውን ያስገቡ።
              </p>
            </div>
          </div>

          {/* Live Camera Scanner Box */}
          <div className="bg-slate-900 rounded-xl overflow-hidden p-3 text-center text-white relative">
            {isScanning ? (
              <div className="relative aspect-video max-h-48 rounded-lg overflow-hidden bg-black flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* Scanner Target Box */}
                <div className="absolute inset-0 border-2 border-emerald-400/80 m-4 rounded-lg pointer-events-none animate-pulse flex items-center justify-center">
                  <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-bounce" />
                </div>
                <button
                  onClick={stopCameraScan}
                  className="absolute top-2 right-2 bg-slate-800/80 hover:bg-slate-700 p-1.5 rounded-full text-white"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="py-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 mx-auto flex items-center justify-center border border-white/20 mb-2">
                  <Camera size={32} className="text-amber-400" />
                </div>
                <p className="text-xs font-semibold text-slate-200">የቀጥታ ካሜራ ስካነር</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  የባጃጁን ፈቃድ QR ኮድ በካሜራ ለመቃኘት ከታች ያለውን ቁልፍ ይጫኑ
                </p>
                <button
                  type="button"
                  onClick={startCameraScan}
                  className="mt-3 py-2 px-4 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1.5 shadow-md transition"
                >
                  <Camera size={14} />
                  <span>ካሜራ ክፈት (Start Camera Scan)</span>
                </button>
              </div>
            )}

            {cameraError && (
              <div className="mt-2 p-2 bg-red-900/40 border border-red-700/50 rounded text-[11px] text-red-200">
                {cameraError}
              </div>
            )}
          </div>

          {/* Manual Digital ID Input Section */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                የዲጂታል መታወቂያ ቁጥር (Digital ID / QR Value)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <QrCode size={18} />
                </div>
                <input
                  type="text"
                  value={digitalIdInput}
                  onChange={(e) => setDigitalIdInput(e.target.value)}
                  placeholder="ለምሳሌ፡ DID-25-000784521"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Quick Demo QR Selector Chips */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
                ፈጣን የሙከራ ዲጂታል መታወቂያዎች (Quick Demo QR):
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDigitalIdInput('DID-25-000784521');
                    proceedToStep2WithDigitalId('DID-25-000784521');
                  }}
                  className="text-xs bg-slate-100 hover:bg-blue-50 hover:border-blue-300 text-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono font-semibold transition"
                >
                  DID-25-000784521 (AA-12345)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDigitalIdInput('DID-GD-0489120');
                    proceedToStep2WithDigitalId('DID-GD-0489120');
                  }}
                  className="text-xs bg-slate-100 hover:bg-blue-50 hover:border-blue-300 text-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono font-semibold transition"
                >
                  DID-GD-0489120 (3-AM-04891)
                </button>
              </div>
            </div>

            {/* Primary Step 1 Button */}
            <button
              type="button"
              onClick={() => proceedToStep2WithDigitalId(digitalIdInput)}
              className="w-full py-3 px-4 bg-[#0C355B] hover:bg-[#092B4B] active:scale-[0.98] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer mt-2"
            >
              <span>ቀጣይ፡ ታርጋ አረጋግጥ (Next: Enter Plate)</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* STEP 2: SCREEN CHANGES AND ASKS FOR PLATE NUMBER ONLY!                   */
        /* ========================================================================= */
        <div className="bg-white rounded-2xl shadow-md border border-slate-200/90 p-4 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          {/* Scanned Digital ID Confirmation Badge */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block leading-none">
                  የተቃኘው ዲጂታል መታወቂያ (Scanned DID)
                </span>
                <span className="text-xs font-mono font-bold text-[#0C355B]">
                  {scannedDigitalId}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-xs text-blue-700 hover:text-blue-900 font-semibold underline flex items-center gap-1"
            >
              <ArrowLeft size={12} />
              <span>ቀይር (Change)</span>
            </button>
          </div>

          {/* Instructions Box */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-950 flex items-start gap-2.5">
            <AlertCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">አሁን በተሽከርካሪው ላይ የሚታየውን ታርጋ ብቻ ያስገቡ</p>
              <p className="text-[11px] text-amber-900/80 mt-0.5">
                በተሽከርካሪው ላይ የተለጠፈው ታርጋ እና በዲጂታል መታወቂያው የተመዘገበው ሰሌዳ የተለያዩ ከሆኑ ሥርዓቱ
                የሰሌዳ ግጭት (Clash) መኖሩን ያሳውቃል።
              </p>
            </div>
          </div>

          {step2Error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
              {step2Error}
            </div>
          )}

          {/* Plate Number Only Input */}
          <form onSubmit={handleFinalVerification} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                በተሽከርካሪው ላይ የሚታየው የሰሌዳ ቁጥር (ታርጋ) ብቻ
              </label>
              <input
                type="text"
                value={physicalPlateInput}
                onChange={(e) => setPhysicalPlateInput(e.target.value)}
                placeholder="ለምሳሌ፡ AA-12345 ወይም 3-AM-04891"
                className="w-full px-3.5 py-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-base font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0C355B] focus:bg-white transition uppercase placeholder:normal-case placeholder:font-normal placeholder:text-slate-400"
                autoFocus
              />
            </div>

            {/* Quick Fast-Testing Chips for Officer: MATCH vs CLASH */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 block">
                ፈጣን የፍተሻ ሙከራ (Test Match or Clash):
              </span>
              <div className="grid grid-cols-2 gap-2">
                {/* 1. MATCH BUTTON */}
                <button
                  type="button"
                  onClick={() => {
                    const matchPlate = matchedVehicle ? matchedVehicle.plateNumber : 'AA-12345';
                    setPhysicalPlateInput(matchPlate);
                  }}
                  className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-left transition"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <CheckCircle2 size={14} />
                    <span>ተዛማጅ ሰሌዳ (Match)</span>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-emerald-700 block mt-0.5">
                    {matchedVehicle ? matchedVehicle.plateNumber : 'AA-12345'}
                  </span>
                </button>

                {/* 2. CLASH / DIFFERENT BUTTON */}
                <button
                  type="button"
                  onClick={() => {
                    // Set a plate DIFFERENT from the scanned one to trigger the clash!
                    const clashPlate =
                      matchedVehicle && matchedVehicle.plateNumber === 'AA-12345'
                        ? '3-AM-04891'
                        : 'AA-12345';
                    setPhysicalPlateInput(clashPlate);
                  }}
                  className="p-2.5 bg-red-50 hover:bg-red-100 text-red-900 border border-red-300 rounded-xl text-left transition"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-800">
                    <ShieldAlert size={14} />
                    <span>የተለየ ታርጋ (Clash Test)</span>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-red-700 block mt-0.5">
                    {matchedVehicle && matchedVehicle.plateNumber === 'AA-12345'
                      ? '3-AM-04891'
                      : 'AA-12345'}
                  </span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-[#0C355B] hover:bg-[#092B4B] active:scale-[0.98] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <Sparkles size={18} className="text-amber-400" />
                <span>አመሳክር እና ፍተሻ ጀምር (Start Cross-Check)</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-full py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <ArrowLeft size={14} />
                <span>ወደ ደረጃ 1 ተመለስ (Back to Scan)</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
