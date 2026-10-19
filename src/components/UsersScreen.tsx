import React, { useState } from 'react';
import { KeyRound, MapPin, Plus, Search, ShieldCheck, X } from 'lucide-react';
import { Inspection, Officer, TrafficViolationReport } from '../types';
import { changeOfficerPassword, createOfficer, formatTimestamp, setOfficerActive } from '../lib/api';
import { sounds } from '../utils/sound';

interface UsersScreenProps {
  officers: Officer[];
  reports: TrafficViolationReport[];
  inspections: Inspection[];
  token: string;
  onChanged: () => Promise<void>;
}

const ROLES = [
  'Field Traffic Inspector',
  'Checkpoint Lead',
  'Verification Specialist',
  'Patrol Officer',
  'Director HQ',
  'Administrator',
];

const ZONES = [
  'ዞን 1: አራዳ - ፒያሳ - ፋሲል ግቢ',
  'ዞን 2: ፒያሳ - አዘዞ - ጎንደር ኤርፖርት',
  'ዞን 3: ማራኪ ዩኒቨርሲቲ - ሾንቃ - ቀበሌ 18',
  'ዞን 4: አንገረብ - ቸቸላ - ቀበሌ 07',
  'ዋና መምሪያ (Headquarters)',
];

const emptyForm = {
  username: '',
  password: '',
  fullName: '',
  badgeNumber: 'GD-TRF-',
  role: ROLES[0],
  phoneNumber: '+251 9',
  assignedZone: ZONES[0],
  isAdmin: false,
};

export const UsersScreen: React.FC<UsersScreenProps> = ({ officers, reports, inspections, token, onChanged }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pwOfficer, setPwOfficer] = useState<Officer | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwDone, setPwDone] = useState(false);

  const todayKey = new Date().toDateString();
  const statsFor = (o: Officer) => {
    const mine = inspections.filter((i) => i.badgeNumber === o.badgeNumber || i.officerName === o.fullName);
    const today = mine.filter((i) => new Date(i.createdAt).toDateString() === todayKey);
    return {
      checksToday: today.length,
      lastSeen: mine[0]?.createdAt,
      citations: reports.filter((r) => r.checkedBy === o.fullName).length,
    };
  };

  const q = searchTerm.toLowerCase();
  const filtered = officers.filter(
    (o) =>
      o.fullName.toLowerCase().includes(q) ||
      o.badgeNumber.toLowerCase().includes(q) ||
      o.username.toLowerCase().includes(q) ||
      o.assignedZone.toLowerCase().includes(q)
  );
  const onDutyCount = officers.filter((o) => o.isActive && statsFor(o).checksToday > 0).length;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.username.trim() || !form.fullName.trim() || form.badgeNumber.trim().length < 8) {
      setFormError('እባክዎ ሁሉንም አስፈላጊ መረጃዎች ያስገቡ (Fill all required fields)');
      return;
    }
    if (form.password.length < 6) {
      setFormError('የይለፍ ቃል ቢያንስ 6 ፊደላት መሆን አለበት (Password: min 6 characters)');
      return;
    }
    setIsSaving(true);
    try {
      await createOfficer(token, form);
      await onChanged();
      sounds.playSuccess();
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setFormError(msg.includes('duplicate') ? 'ይህ የተጠቃሚ ስም ወይም ባጅ ቁጥር አስቀድሞ አለ (Username or badge already exists)' : msg);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (o: Officer) => {
    setBusyId(o.id);
    try {
      await setOfficerActive(token, o.id, !o.isActive);
      await onChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyId(null);
    }
  };

  const openPasswordForm = (o: Officer) => {
    setPwOfficer(o);
    setNewPassword('');
    setConfirmPassword('');
    setPwError(null);
    setPwDone(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwOfficer) return;
    setPwError(null);
    if (newPassword.length < 6) {
      setPwError('የይለፍ ቃል ቢያንስ 6 ፊደላት መሆን አለበት (Password: min 6 characters)');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('የይለፍ ቃሎቹ አይመሳሰሉም (Passwords do not match)');
      return;
    }
    setIsSaving(true);
    try {
      await changeOfficerPassword(token, pwOfficer.id, newPassword);
      sounds.playSuccess();
      setPwDone(true);
    } catch (err) {
      setPwError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSaving(false);
    }
  };

  const input = 'w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600';

  return (
    <div className="p-3 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-black text-[#0C355B] tracking-tight">
              የትራፊክ ፖሊስ አባላት (Officers & Staff)
            </h2>
            <span className="text-xs font-bold bg-blue-100 text-[#0C355B] px-2.5 py-0.5 rounded-full border border-blue-200">
              {officers.length} አባላት · {onDutyCount} ዛሬ በመስክ
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            ከስልክ መተግበሪያው በሚመጡ ፍተሻዎች የሚሰላ የቀጥታ አፈጻጸም
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(true);
            setFormError(null);
          }}
          className="px-4 py-2 bg-[#0C355B] hover:bg-[#092B4B] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition cursor-pointer"
        >
          <Plus size={16} />
          <span>አዲስ አባል መዝግብ (Add Officer)</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search size={16} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="በስም፣ በባጅ ቁጥር ወይም በዞን ፈልግ..."
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">ባጅ ቁጥር</th>
                <th className="px-3 py-3.5">የአባል ሙሉ ስም</th>
                <th className="px-3 py-3.5">የስራ ኃላፊነት (Role)</th>
                <th className="px-3 py-3.5">የተመደበበት ዞን</th>
                <th className="px-3 py-3.5">ስልክ ቁጥር</th>
                <th className="px-3 py-3.5">የተመዘገበበት (Registered)</th>
                <th className="px-3 py-3.5 text-center">የዛሬ ፍተሻዎች</th>
                <th className="px-3 py-3.5 text-center">የጻፋቸው ቅጣቶች</th>
                <th className="px-3 py-3.5">ሁኔታ</th>
                <th className="px-3 py-3.5 text-right">እርምጃ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">
                    {officers.length === 0
                      ? 'ምንም አባል አልተገኘም – የዳታቤዝ ማሻሻያው (migration) መሰራቱን ያረጋግጡ'
                      : 'ምንም አባል አልተገኘም'}
                  </td>
                </tr>
              )}
              {filtered.map((o) => {
                const st = statsFor(o);
                const onDuty = o.isActive && st.checksToday > 0;
                return (
                  <tr key={o.id} className={`hover:bg-slate-50/80 transition ${o.isActive ? '' : 'opacity-60'}`}>
                    <td className="px-4 py-3.5 font-mono font-bold text-[#0C355B]">{o.badgeNumber}</td>
                    <td className="px-3 py-3.5">
                      <div className="font-bold text-slate-900 text-sm">{o.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">@{o.username}</div>
                      {o.isAdmin && (
                        <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          <ShieldCheck size={10} />
                          አስተዳዳሪ (Admin)
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-slate-700 font-medium">{o.role}</td>
                    <td className="px-3 py-3.5">
                      <span className="flex items-center gap-1 text-slate-800 font-medium">
                        <MapPin size={12} className="text-blue-600 shrink-0" />
                        {o.assignedZone}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 font-mono text-slate-600">{o.phoneNumber || '-'}</td>
                    <td className="px-3 py-3.5 font-mono text-slate-600 whitespace-nowrap">
                      {o.createdAt ? formatTimestamp(o.createdAt) : '-'}
                    </td>
                    <td className="px-3 py-3.5 text-center font-mono font-bold text-blue-700 text-sm">{st.checksToday}</td>
                    <td className="px-3 py-3.5 text-center font-mono font-bold text-red-600 text-sm">{st.citations}</td>
                    <td className="px-3 py-3.5">
                      {!o.isActive ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">ታግዷል (Disabled)</span>
                      ) : onDuty ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          ተረኛ (On Duty)
                        </span>
                      ) : (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200"
                          title={st.lastSeen ? `Last inspection: ${new Date(st.lastSeen).toLocaleString()}` : 'No inspections yet'}
                        >
                          ዛሬ አልሰራም (Idle)
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => openPasswordForm(o)}
                        className="px-2.5 py-1 mr-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg text-[11px] font-bold text-[#0C355B] transition cursor-pointer inline-flex items-center gap-1"
                      >
                        <KeyRound size={12} />
                        የይለፍ ቃል ቀይር (Password)
                      </button>
                      <button
                        disabled={busyId === o.id}
                        onClick={() => toggleActive(o)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition cursor-pointer disabled:opacity-50"
                      >
                        {o.isActive ? 'አግድ (Disable)' : 'አንቃ (Enable)'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-auto"
          >
            <div className="bg-[#0C355B] text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">አዲስ የትራፊክ ፖሊስ አባል (New Officer)</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-white/70 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">ሙሉ ስም (Full name) *</label>
                <input className={input} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">የተጠቃሚ ስም (Username) *</label>
                <input className={`${input} font-mono`} autoComplete="off" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">የይለፍ ቃል (Password) *</label>
                <input type="password" autoComplete="new-password" className={input} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ባጅ ቁጥር (Badge) *</label>
                <input className={`${input} font-mono`} value={form.badgeNumber} onChange={(e) => setForm({ ...form, badgeNumber: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ስልክ (Phone)</label>
                <input className={`${input} font-mono`} value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ኃላፊነት (Role)</label>
                <select className={input} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ዞን (Zone)</label>
                <select className={input} value={form.assignedZone} onChange={(e) => setForm({ ...form, assignedZone: e.target.value })}>
                  {ZONES.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>
              <label className="sm:col-span-2 flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input type="checkbox" checked={form.isAdmin} onChange={(e) => setForm({ ...form, isAdmin: e.target.checked })} />
                አስተዳዳሪ ይሁን – ወደ ድረ-ገጹ መግባት ይችላል (Administrator – can sign in to this panel)
              </label>
              {formError && <p className="sm:col-span-2 text-xs text-red-600 font-medium">{formError}</p>}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                ይቅር (Cancel)
              </button>
              <button type="submit" disabled={isSaving} className="px-4 py-2 bg-[#0C355B] text-white rounded-xl text-xs font-bold disabled:opacity-60">
                {isSaving ? 'በማስቀመጥ ላይ...' : 'አስቀምጥ (Save)'}
              </button>
            </div>
          </form>
        </div>
      )}

      {pwOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <form
            onSubmit={handleChangePassword}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden my-auto"
          >
            <div className="bg-[#0C355B] text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">የይለፍ ቃል ቀይር (Change Password)</h3>
              <button type="button" onClick={() => setPwOfficer(null)} className="text-white/70 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600">
                <span className="font-bold text-slate-900">{pwOfficer.fullName}</span>{' '}
                <span className="font-mono text-slate-400">@{pwOfficer.username}</span>
              </p>
              {pwDone ? (
                <p className="text-xs text-emerald-700 font-bold">የይለፍ ቃሉ ተቀይሯል (Password changed)</p>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">አዲስ የይለፍ ቃል (New password) *</label>
                    <input type="password" autoComplete="new-password" className={input} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ድገም (Confirm password) *</label>
                    <input type="password" autoComplete="new-password" className={input} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                </>
              )}
              {pwError && <p className="text-xs text-red-600 font-medium">{pwError}</p>}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setPwOfficer(null)} className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                {pwDone ? 'ዝጋ (Close)' : 'ይቅር (Cancel)'}
              </button>
              {!pwDone && (
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-[#0C355B] text-white rounded-xl text-xs font-bold disabled:opacity-60">
                  {isSaving ? 'በማስቀመጥ ላይ...' : 'አስቀምጥ (Save)'}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
