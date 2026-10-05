import React, { useState, useEffect, useRef } from 'react';
import { Search, Camera, Info, QrCode, X, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode';
import { BajajVehicle } from '../types';
import { sounds } from '../utils/sound';

interface VerificationScreenProps {
  onStartVerification: (query: { type: 'digitalId' | 'plate' | 'vin' | 'qr'; value: string; simulatedBajaj?: BajajVehicle; isMismatch?: boolean }) => void;
  database: BajajVehicle[];
}

export const VerificationScreen: React.FC<VerificationScreenProps> = ({
  onStartVerification,
  database
}) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'plate' | 'vin'>('qr');
  const [digitalIdInput, setDigitalIdInput] = useState('DID-25-000784521');
  const [plateInput, setPlateInput] = useState('');
  const [vinInput, setVinInput] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

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
        light: '#ffffff'
      }
    }).then(url => {
      setQrDataUrl(url);
    }).catch(() => {});
  }, [digitalIdInput]);

  // Handle live camera scanner
  const startCameraScan = async () => {
    setIsScanning(true);
    setCameraError(null);
    sounds.playScanBeep();

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
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
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScanDetected = (detectedCode: string) => {
    sounds.playScanBeep();
    stopCameraScan();
    const clean = detectedCode.trim();
    const match = database.find(b => 
      b.digitalId.toLowerCase() === clean.toLowerCase() ||
      b.qrCodeValue.toLowerCase().includes(clean.toLowerCase())
    );
    onStartVerification({
      type: 'qr',
      value: clean,
      simulatedBajaj: match || database[0],
      isMismatch: !match
    });
  };

  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playScanBeep();
    
    if (activeTab === 'qr') {
      const target = digitalIdInput.trim();
      const match = database.find(b => b.digitalId.toLowerCase() === target.toLowerCase());
      onStartVerification({
        type: 'digitalId',
        value: target,
        simulatedBajaj: match || database[0],
        isMismatch: !match
      });
    } else if (activeTab === 'plate') {
      const target = plateInput.trim();
      const match = database.find(b => b.plateNumber.toLowerCase() === target.toLowerCase());
      const isMismatch = !match || target.toUpperCase() === 'AA-99999';
      onStartVerification({
        type: 'plate',
        value: target,
        simulatedBajaj: match || database[0],
        isMismatch
      });
    } else {
      const target = vinInput.trim();
      const match = database.find(b => b.vin.toLowerCase() === target.toLowerCase());
      onStartVerification({
        type: 'vin',
        value: target,
        simulatedBajaj: match || database[0],
        isMismatch: !match
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col p-3 bg-gradient-to-b from-[#F4F7FB] to-[#E9EFF5] overflow-y-auto">
      {/* Title (Matches Screenshot 2) */}
      <div className="mb-3 pt-1 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0C355B] tracking-tight leading-tight">
            Verification
          </h2>
          <span className="text-sm font-bold text-slate-800">
            ማረጋገጫ
          </span>
        </div>
        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-full border border-emerald-300 shadow-2xs">
          ● Live Backend Check
        </span>
      </div>

      {/* Tabs (Matches Screenshot 2) */}
      <div className="grid grid-cols-3 bg-white p-1 rounded-xl shadow-xs border border-slate-200 mb-3.5">
        <button
          onClick={() => {
            setActiveTab('qr');
            sounds.playScanBeep();
          }}
          className={`py-2 px-1 text-center text-xs font-semibold rounded-lg transition-all truncate cursor-pointer ${
            activeTab === 'qr'
              ? 'bg-[#0C355B] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Digital ID / QR
        </button>
        <button
          onClick={() => {
            setActiveTab('plate');
            sounds.playScanBeep();
          }}
          className={`py-2 px-1 text-center text-xs font-semibold rounded-lg transition-all truncate cursor-pointer ${
            activeTab === 'plate'
              ? 'bg-[#0C355B] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Plate Number
        </button>
        <button
          onClick={() => {
            setActiveTab('vin');
            sounds.playScanBeep();
          }}
          className={`py-2 px-1 text-center text-xs font-semibold rounded-lg transition-all truncate cursor-pointer ${
            activeTab === 'vin'
              ? 'bg-[#0C355B] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          VIN / Chassis
        </button>
      </div>

      {/* Tab Section Subtitle */}
      <div className="mb-2.5">
        <p className="text-xs font-bold text-slate-700">
          {activeTab === 'qr' && 'ዲጂታል መታወቂያ እና QR ኮድ ያረጋግጡ'}
          {activeTab === 'plate' && 'የሰሌዳ ቁጥር አስገብተው ያረጋግጡ'}
          {activeTab === 'vin' && 'የባጃጅ ቻሲስ ቁጥር ያረጋግጡ'}
        </p>
      </div>

      {/* TAB 1: Digital ID & QR Scan (Matches Screenshot 2 layout) */}
      {activeTab === 'qr' && (
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          {/* Left Card: Digital ID input */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5 leading-snug">
                ዲጂታል መታወቂያ
              </label>
              <input
                type="text"
                value={digitalIdInput}
                onChange={(e) => setDigitalIdInput(e.target.value)}
                placeholder="23-000784521"
                className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white mb-2"
              />
              <span className="text-[9px] text-slate-400 block leading-tight">
                (ለምሳሌ 23-000784521)
              </span>
            </div>

            <button
              onClick={handleSubmitSearch}
              className="w-full mt-3 py-2 px-2 bg-[#0C355B] hover:bg-[#092B4B] active:scale-[0.98] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Search size={14} />
              <span>ፈልግ / አረጋግጥ</span>
            </button>
          </div>

          {/* Right Card: QR Code & Camera Scan */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-xs flex flex-col items-center justify-between text-center">
            <div>
              <p className="text-[11px] font-bold text-slate-700 mb-1">
                QR ኮድ ስካን
              </p>
              <div className="w-24 h-24 mx-auto p-1 border-2 border-slate-200 rounded-lg flex items-center justify-center bg-white shadow-xs relative">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Bajaj Digital QR Code" className="w-full h-full object-contain" />
                ) : (
                  <QrCode size={48} className="text-slate-400" />
                )}
                <div className="absolute top-0.5 left-0.5 w-2 h-2 border-t-2 border-l-2 border-blue-600" />
                <div className="absolute top-0.5 right-0.5 w-2 h-2 border-t-2 border-r-2 border-blue-600" />
                <div className="absolute bottom-0.5 left-0.5 w-2 h-2 border-b-2 border-l-2 border-blue-600" />
                <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-b-2 border-r-2 border-blue-600" />
              </div>
            </div>

            <button
              onClick={startCameraScan}
              className="w-full mt-2 py-2 px-1 bg-[#0C355B] hover:bg-[#092B4B] active:scale-[0.98] text-white rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Camera size={14} />
              <span className="truncate">ካሜራ ይክፈቱ (Start Scan)</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Plate Number */}
      {activeTab === 'plate' && (
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs mb-3">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            የሰሌዳ ቁጥር (Plate Number)
          </label>
          <div className="relative mb-3">
            <input
              type="text"
              value={plateInput}
              onChange={(e) => setPlateInput(e.target.value)}
              placeholder="ለምሳሌ AA-12345 ወይም 3-AM-04891"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold tracking-wider text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
            />
          </div>

          <button
            onClick={handleSubmitSearch}
            className="w-full py-2.5 px-4 bg-[#0C355B] hover:bg-[#092B4B] active:scale-[0.98] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Search size={15} />
            <span>የሰሌዳ ቁጥር አረጋግጥ (Verify Plate)</span>
          </button>
        </div>
      )}

      {/* TAB 3: VIN / Chassis */}
      {activeTab === 'vin' && (
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs mb-3">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            ቻሲስ ቁጥር (VIN / Chassis Number)
          </label>
          <div className="relative mb-3">
            <input
              type="text"
              value={vinInput}
              onChange={(e) => setVinInput(e.target.value)}
              placeholder="ለምሳሌ MBN12345678912345"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold tracking-wider text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
            />
          </div>

          <button
            onClick={handleSubmitSearch}
            className="w-full py-2.5 px-4 bg-[#0C355B] hover:bg-[#092B4B] active:scale-[0.98] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Search size={15} />
            <span>ቻሲስ ቁጥር አረጋግጥ (Verify VIN)</span>
          </button>
        </div>
      )}

      {/* Info Notice Bar (Matches Screenshot 2 bottom notice) */}
      <div className="bg-[#EBF3FC] border border-[#CDE1F8] rounded-xl p-3 flex items-center gap-2.5 text-[#0C355B] mb-3">
        <div className="w-5 h-5 rounded-full bg-[#185A9D] text-white flex items-center justify-center shrink-0 text-xs font-bold">
          <Info size={13} />
        </div>
        <p className="text-[11px] font-semibold leading-tight">
          ማስታወሻ: Digital ID ወይም QR ኮድ ስካን ያድርጉ ::
        </p>
      </div>

      {/* CAMERA SCANNER MODAL */}
      {isScanning && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-4 backdrop-blur-xs">
          {/* Top Camera Bar */}
          <div className="flex items-center justify-between text-white pt-2">
            <div className="flex items-center gap-2">
              <Camera size={20} className="text-blue-400" />
              <span className="text-sm font-bold">የጎንደር ባጃጅ QR ስካነር</span>
            </div>
            <button
              onClick={stopCameraScan}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Viewfinder Area */}
          <div className="relative flex-1 flex flex-col items-center justify-center my-4 overflow-hidden rounded-2xl border border-white/20 bg-slate-950">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="relative w-64 h-64 border-2 border-dashed border-white/60 rounded-xl flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400" />

              <div className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_#ef4444] animate-bounce" />

              <div className="text-center p-3">
                <QrCode size={40} className="text-white/40 mx-auto mb-1 animate-pulse" />
                <p className="text-[11px] text-white/90 font-medium">
                  QR ኮዱን ወደ ካሜራው አቅርቡ
                </p>
                <p className="text-[9px] text-white/60 mt-0.5">
                  Point at Bajaj digital permit sticker
                </p>
              </div>
            </div>

            {cameraError && (
              <div className="absolute bottom-4 inset-x-4 bg-amber-500/90 text-white text-[11px] p-2 rounded-lg text-center backdrop-blur-xs flex items-center justify-center gap-1.5">
                <AlertCircle size={14} />
                <span>{cameraError}</span>
              </div>
            )}
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-white text-center">
            <button
              onClick={() => handleScanDetected(digitalIdInput || 'DID-25-000784521')}
              className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold text-white shadow-sm transition-all"
            >
              ስካን አረጋግጥ (Confirm Scan)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
