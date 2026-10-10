import React, { useState } from 'react';
import { X, Plus, ShieldCheck, Car, User, Phone, MapPin, Calendar, FileText } from 'lucide-react';
import { BajajVehicle } from '../../types';
import { sounds } from '../../utils/sound';

interface ErpNewVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVehicle: (newVehicle: BajajVehicle) => void;
}

export const ErpNewVehicleModal: React.FC<ErpNewVehicleModalProps> = ({
  isOpen,
  onClose,
  onAddVehicle,
}) => {
  if (!isOpen) return null;

  const [plateNumber, setPlateNumber] = useState('3-AM-');
  const [digitalId, setDigitalId] = useState(`DID-GD-${Math.floor(100000 + Math.random() * 900000)}`);
  const [vin, setVin] = useState(`TVS${Math.floor(1000000000 + Math.random() * 9000000000)}`);
  const [bajajModel, setBajajModel] = useState('TVS King Deluxe');
  const [color, setColor] = useState('Blue (ሰማያዊ)');
  const [bajajAssociation, setBajajAssociation] = useState('ፋሲል የባጃጅ ማህበር (Fasil)');
  const [owner, setOwner] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('+251 9');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('+251 9');
  const [kebele, setKebele] = useState('ቀበሌ 01 (Kebele 01)');
  const [address, setAddress] = useState('ፒያሳ መንገድ፣ ጎንደር');
  const [authorizedArea, setAuthorizedArea] = useState('ዞን 1: አራዳ - ፒያሳ - ፋሲል ግቢ');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber.trim() || plateNumber.trim() === '3-AM-') {
      alert('እባክዎ ትክክለኛ የሰሌዳ ቁጥር ያስገቡ');
      return;
    }
    if (!owner.trim()) {
      alert('እባክዎ የባለቤት ስም ያስገቡ');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const permitNo = `PRM-GD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newVehicle: BajajVehicle = {
      id: `bajaj-${Date.now()}`,
      digitalId: digitalId.trim(),
      plateNumber: plateNumber.trim().toUpperCase(),
      vin: vin.trim().toUpperCase(),
      vehicleType: 'Bajaj (ባጃጅ)',
      bajajModel,
      color,
      bajajAssociation,
      owner: owner.trim(),
      ownerPhone: ownerPhone.trim(),
      driverName: driverName.trim() || owner.trim(),
      driverPhone: driverPhone.trim(),
      driverPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      kebele,
      address,
      permitNo,
      issueDate: today,
      expiryDate: nextYear,
      authorizedArea,
      status: 'ACTIVE',
      isBlacklisted: false,
      qrCodeValue: `${digitalId.trim()}|${plateNumber.trim().toUpperCase()}|${permitNo}`,
      registeredCity: 'Gondar / ጎንደር',
    };

    sounds.playSuccess();
    onAddVehicle(newVehicle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-[#0C355B] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Car size={20} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">አዲስ ባጃጅ መመዝገቢያ (New Bajaj Registration)</h3>
              <p className="text-xs text-blue-200">የጎንደር ከተማ አስተዳደር ትራንስፖርት መምሪያ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Vehicle & Identifier Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-blue-600" />
              <span>1. የተሽከርካሪ መለያ መረጃዎች (Vehicle & IDs)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">የሰሌዳ ቁጥር (ታርጋ) *</label>
                <input
                  type="text"
                  required
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  placeholder="3-AM-04891"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ዲጂታል መታወቂያ (DID) *</label>
                <input
                  type="text"
                  required
                  value={digitalId}
                  onChange={(e) => setDigitalId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ቻሲስ / VIN ቁጥር *</label>
                <input
                  type="text"
                  required
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Model, Color & Association */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ሞዴል (Model)</label>
              <select
                value={bajajModel}
                onChange={(e) => setBajajModel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
              >
                <option value="TVS King Deluxe">TVS King Deluxe</option>
                <option value="TVS King">TVS King</option>
                <option value="Bajaj RE 4S">Bajaj RE 4S</option>
                <option value="Bajaj Maxima Z">Bajaj Maxima Z</option>
                <option value="Piaggio Ape City">Piaggio Ape City</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ቀለም (Color)</label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
              >
                <option value="Blue (ሰማያዊ)">Blue (ሰማያዊ)</option>
                <option value="Red (ቀይ)">Red (ቀይ)</option>
                <option value="White (ነጭ)">White (ነጭ)</option>
                <option value="Green (አረንጓዴ)">Green (አረንጓዴ)</option>
                <option value="Yellow (ቢጫ)">Yellow (ቢጫ)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">የባጃጅ ማህበር (Association)</label>
              <select
                value={bajajAssociation}
                onChange={(e) => setBajajAssociation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
              >
                <option value="ፋሲል የባጃጅ ማህበር (Fasil)">ፋሲል የባጃጅ ማህበር (Fasil)</option>
                <option value="አዘዞ ማህበር (Azezo)">አዘዞ ማህበር (Azezo)</option>
                <option value="ማራኪ ዩኒቨርሲቲ ማህበር (Maraki)">ማራኪ ዩኒቨርሲቲ ማህበር (Maraki)</option>
                <option value="አንገረብ ማህበር (Angereb)">አንገረብ ማህበር (Angereb)</option>
                <option value="ሰበሰተፖል ማህበር (Sebastopol)">ሰበሰተፖል ማህበር (Sebastopol)</option>
              </select>
            </div>
          </div>

          {/* Section 3: Owner & Driver */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
              <User size={14} className="text-blue-600" />
              <span>2. የባለቤት እና አሽከርካሪ መረጃ (Owner & Driver)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">የባለቤት ሙሉ ስም *</label>
                <input
                  type="text"
                  required
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="አቶ ታምራት አለማየሁ"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">የባለቤት ስልክ ቁጥር</label>
                <input
                  type="text"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">የአሽከርካሪ ስም</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="ዮሐንስ ጌታቸው (ባዶ ከሆነ ባለቤቱ)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">የአሽከርካሪ ስልክ</label>
                <input
                  type="text"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Zone & Route Allocation */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
              <MapPin size={14} className="text-blue-600" />
              <span>3. የስራ ዞን እና ፈቃድ ምደባ (Zone Allocation)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ቀበሌ (Kebele)</label>
                <select
                  value={kebele}
                  onChange={(e) => setKebele(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                >
                  <option value="ቀበሌ 01 (Kebele 01)">ቀበሌ 01 (Kebele 01)</option>
                  <option value="ቀበሌ 03 (Kebele 03)">ቀበሌ 03 (Kebele 03)</option>
                  <option value="ቀበሌ 07 (Kebele 07)">ቀበሌ 07 (Kebele 07)</option>
                  <option value="ቀበሌ 16 (Kebele 16)">ቀበሌ 16 (Kebele 16)</option>
                  <option value="ቀበሌ 18 (Kebele 18)">ቀበሌ 18 (Kebele 18)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">የተፈቀደ የሩጫ ዞን (Zone)</label>
                <select
                  value={authorizedArea}
                  onChange={(e) => setAuthorizedArea(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                >
                  <option value="ዞን 1: አራዳ - ፒያሳ - ፋሲል ግቢ">ዞን 1: አራዳ - ፒያሳ - ፋሲል ግቢ</option>
                  <option value="ዞን 2: ፒያሳ - አዘዞ - ጎንደር ኤርፖርት">ዞን 2: ፒያሳ - አዘዞ - ጎንደር ኤርፖርት</option>
                  <option value="ዞን 3: ማራኪ ዩኒቨርሲቲ - ሾንቃ - ቀበሌ 18">ዞን 3: ማራኪ ዩኒቨርሲቲ - ሾንቃ - ቀበሌ 18</option>
                  <option value="ዞን 4: አንገረብ - ቸቸላ - ቀበሌ 07">ዞን 4: አንገረብ - ቸቸላ - ቀበሌ 07</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              ይቅር (Cancel)
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0C355B] hover:bg-[#092B4B] text-xs font-bold text-white shadow-md flex items-center gap-2 transition cursor-pointer"
            >
              <Plus size={16} />
              <span>በመዝገብ ውስጥ አካትት (Save to Registry)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
