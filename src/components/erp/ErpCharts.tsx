import React, { useMemo, useState } from 'react';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity, Layers } from 'lucide-react';
import { BajajVehicle, Inspection, TrafficViolationReport } from '../../types';

interface ErpChartsProps {
  vehicles: BajajVehicle[];
  reports: TrafficViolationReport[];
  inspections: Inspection[];
}

const DAY_MS = 24 * 60 * 60 * 1000;
const PALETTE = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#0891b2', '#e11d48'];
const ZONE_BARS = ['bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-purple-600', 'bg-sky-600', 'bg-rose-600'];
const AM_DAYS = ['እሑድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'አርብ', 'ቅዳሜ'];

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Last `n` calendar days, oldest first. */
function lastDays(n: number): Date[] {
  const today = startOfDay(new Date());
  return Array.from({ length: n }, (_, i) => new Date(today.getTime() - (n - 1 - i) * DAY_MS));
}

function reportDate(r: TrafficViolationReport): Date {
  return new Date(r.createdAt || r.checkedOn.replace(' ', 'T'));
}

export const ErpCharts: React.FC<ErpChartsProps> = ({ vehicles, reports, inspections }) => {
  const [activeTimeframe, setActiveTimeframe] = useState<7 | 30>(7);
  const totalFleet = vehicles.length;

  // 1. Daily inspections vs violations trend
  const trend = useMemo(() => {
    const days = lastDays(activeTimeframe);
    const insp = new Map<string, number>();
    const viol = new Map<string, number>();
    for (const i of inspections) {
      const k = dayKey(new Date(i.createdAt));
      insp.set(k, (insp.get(k) || 0) + 1);
    }
    for (const r of reports) {
      const k = dayKey(reportDate(r));
      viol.set(k, (viol.get(k) || 0) + 1);
    }
    return days.map((d) => ({
      date: d,
      label: activeTimeframe === 7 ? AM_DAYS[d.getDay()] : `${d.getMonth() + 1}/${d.getDate()}`,
      inspections: insp.get(dayKey(d)) || 0,
      violations: viol.get(dayKey(d)) || 0,
    }));
  }, [inspections, reports, activeTimeframe]);

  const trendMax = Math.max(4, ...trend.map((t) => Math.max(t.inspections, t.violations)));
  const chartX = (idx: number) => 50 + (idx * 620) / Math.max(1, trend.length - 1);
  const chartY = (val: number) => 200 - (val / trendMax) * 180;
  const inspectionsLine = trend.map((t, i) => `${chartX(i)},${chartY(t.inspections)}`).join(' ');
  const violationsLine = trend.map((t, i) => `${chartX(i)},${chartY(t.violations)}`).join(' ');
  const periodInspections = trend.reduce((s, t) => s + t.inspections, 0);
  const periodViolations = trend.reduce((s, t) => s + t.violations, 0);
  const periodPassRate = useMemo(() => {
    const since = Date.now() - activeTimeframe * DAY_MS;
    const recent = inspections.filter((i) => new Date(i.createdAt).getTime() >= since);
    if (recent.length === 0) return null;
    return (recent.filter((i) => i.result === 'VALID').length / recent.length) * 100;
  }, [inspections, activeTimeframe]);
  const labelEvery = Math.ceil(trend.length / 10);

  // 2. Fines issued over the last 7 days
  const weeklyFines = useMemo(() => {
    return lastDays(7).map((d) => {
      const dayReports = reports.filter((r) => dayKey(reportDate(r)) === dayKey(d));
      return {
        label: `${AM_DAYS[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`,
        amount: dayReports.reduce((s, r) => s + (r.fineAmount || 0), 0),
        count: dayReports.length,
      };
    });
  }, [reports]);
  const maxWeeklyFine = Math.max(1, ...weeklyFines.map((w) => w.amount));
  const weekTotal = weeklyFines.reduce((s, w) => s + w.amount, 0);
  const peakDay = weeklyFines.reduce((best, w) => (w.amount > best.amount ? w : best), weeklyFines[0]);

  // 3. Fleet share per association
  const associations = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of vehicles) {
      const name = v.bajajAssociation || 'ሌሎች (Other)';
      map.set(name, (map.get(name) || 0) + 1);
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count], idx) => ({
        name,
        count,
        share: totalFleet > 0 ? (count / totalFleet) * 100 : 0,
        color: PALETTE[idx % PALETTE.length],
      }));
  }, [vehicles, totalFleet]);
  const CIRC = 2 * Math.PI * 60;
  let donutOffset = 0;

  // 4. Registered fleet & compliance per zone
  const zones = useMemo(() => {
    const map = new Map<string, { total: number; active: number; problem: number }>();
    for (const v of vehicles) {
      const zone = v.authorizedArea || 'ያልተመደበ (Unassigned)';
      const entry = map.get(zone) || { total: 0, active: 0, problem: 0 };
      entry.total += 1;
      if (v.status === 'ACTIVE') entry.active += 1;
      else entry.problem += 1;
      map.set(zone, entry);
    }
    const maxTotal = Math.max(1, ...[...map.values()].map((z) => z.total));
    return [...map.entries()]
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 6)
      .map(([zone, z], idx) => ({ zone, ...z, percent: (z.total / maxTotal) * 100, color: ZONE_BARS[idx % ZONE_BARS.length] }));
  }, [vehicles]);

  // 5. Inspections per hour of day (last 7 days)
  const hourly = useMemo(() => {
    const since = Date.now() - 7 * DAY_MS;
    const buckets = Array.from({ length: 24 }, () => 0);
    for (const i of inspections) {
      const d = new Date(i.createdAt);
      if (d.getTime() >= since) buckets[d.getHours()] += 1;
    }
    return buckets;
  }, [inspections]);
  const hourlyMax = Math.max(1, ...hourly);
  const peakHour = hourly.indexOf(Math.max(...hourly));
  const hasHourly = hourly.some((h) => h > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRAPH 1: Daily inspections vs violations */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  የፍተሻ እና የጥሰት አዝማሚያ (Inspections & Violations Trend)
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ከስልክ መተግበሪያው እና ከዌብሳይቱ በቀጥታ የሚመጣ መረጃ
              </p>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {([7, 30] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setActiveTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    activeTimeframe === tf ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tf} ቀናት
                </button>
              ))}
            </div>
          </div>

          <div className="relative h-64 w-full">
            <svg viewBox="0 0 700 225" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="areaGradientBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {[0, 0.25, 0.5, 0.75, 1].map((f) => {
                const y = 200 - f * 180;
                return (
                  <g key={f}>
                    <line x1="40" y1={y} x2="680" y2={y} stroke={f === 0 ? '#e2e8f0' : '#f1f5f9'} strokeWidth="1.5" strokeDasharray={f === 0 ? undefined : '3 3'} />
                    <text x="30" y={y + 4} fontSize="9" fill="#94a3b8" textAnchor="end">
                      {Math.round(f * trendMax)}
                    </text>
                  </g>
                );
              })}

              <polygon points={`${inspectionsLine} ${chartX(trend.length - 1)},200 ${chartX(0)},200`} fill="url(#areaGradientBlue)" />
              <polyline points={inspectionsLine} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points={violationsLine} fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 4" />

              {trend.map((t, i) => (
                <g key={t.date.toISOString()}>
                  <circle cx={chartX(i)} cy={chartY(t.inspections)} r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2">
                    <title>{`${t.label}: ${t.inspections} ፍተሻ, ${t.violations} ጥሰት`}</title>
                  </circle>
                  {i % labelEvery === 0 && (
                    <text x={chartX(i)} y="218" fontSize="9" fill="#64748b" textAnchor="middle" fontWeight="500">
                      {t.label}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
                <span>ፍተሻዎች (Inspections: {periodInspections})</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <span className="w-3 h-3 rounded-full bg-red-600 inline-block" />
                <span>ጥሰቶች (Violations: {periodViolations})</span>
              </div>
            </div>
            <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {periodPassRate === null ? 'ገና ፍተሻ የለም' : `${periodPassRate.toFixed(1)}% ሕጋዊ ሆነው ተገኝተዋል`}
            </div>
          </div>
        </div>

        {/* GRAPH 2: Fines over the last 7 days */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">የሳምንቱ ቅጣት (Last 7 Days Fines)</h3>
              </div>
              <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                ETB ብር
              </span>
            </div>

            <div className="mb-4">
              <div className="text-[11px] text-slate-500 font-medium">ባለፉት 7 ቀናት የተጣለ ቅጣት:</div>
              <div className="text-2xl font-black text-purple-900 font-mono">{weekTotal.toLocaleString()} ብር</div>
            </div>

            <div className="space-y-3">
              {weeklyFines.map((day) => (
                <div key={day.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{day.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">({day.count} ጥሰቶች)</span>
                      <span className="font-mono font-bold text-purple-900">{day.amount.toLocaleString()} ብር</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((day.amount / maxWeeklyFine) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 mt-4">
            {weekTotal > 0 ? `ከፍተኛ ቅጣት፡ ${peakDay.label} (${peakDay.amount.toLocaleString()} ብር)` : 'በዚህ ሳምንት ቅጣት አልተጣለም'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* GRAPH 3: Association donut */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <PieChartIcon size={18} className="text-[#0C355B]" />
              <h3 className="text-sm font-bold text-slate-900">የማህበራት ድርሻ (Fleet Share)</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-500">{associations.length} ማህበራት</span>
          </div>

          <div className="flex items-center justify-center my-2 relative">
            <svg viewBox="0 0 160 160" className="w-40 h-40 transform -rotate-90">
              <circle cx="80" cy="80" r="60" fill="transparent" stroke="#f1f5f9" strokeWidth="24" />
              {associations.map((a) => {
                const len = (a.share / 100) * CIRC;
                const el = (
                  <circle
                    key={a.name}
                    cx="80"
                    cy="80"
                    r="60"
                    fill="transparent"
                    stroke={a.color}
                    strokeWidth="24"
                    strokeDasharray={`${len} ${CIRC}`}
                    strokeDashoffset={-donutOffset}
                  />
                );
                donutOffset += len;
                return el;
              })}
            </svg>
            <div className="absolute text-center pointer-events-none">
              <span className="text-xl font-black text-[#0C355B] font-mono block leading-none">{totalFleet}</span>
              <span className="text-[10px] text-slate-400 font-semibold">ባጃጆች</span>
            </div>
          </div>

          <div className="space-y-2 mt-4 text-xs">
            {associations.map((a) => (
              <div key={a.name} className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: a.color }} />
                  <span className="font-semibold text-slate-800 truncate">{a.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono shrink-0">
                  <span className="text-slate-400 text-[10px]">{a.count} ባጃጅ</span>
                  <span className="font-bold text-slate-900">{a.share.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GRAPH 4: Zones */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">የዞኖች ምደባ (Fleet by Zone)</h3>
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {zones.length} ዞኖች
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {zones.map((zd) => (
              <div key={zd.zone} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                <div className="flex items-center justify-between font-semibold gap-2">
                  <span className="text-slate-900 text-[11px] truncate">{zd.zone}</span>
                  <span className="text-[10px] font-bold text-slate-600 shrink-0">{zd.total} ባጃጆች</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className={`${zd.color} h-full rounded-full transition-all duration-500`} style={{ width: `${zd.percent}%` }} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="text-emerald-700 font-semibold">{zd.active} ሕጋዊ</span>
                  <span className="text-red-700 font-semibold">{zd.problem} ችግር ያለባቸው</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GRAPH 5: Inspections by hour */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">የፍተሻ ሰዓታት (Inspections by Hour)</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                7 ቀናት
              </span>
            </div>

            <div className="h-36 w-full flex items-end gap-[2px]">
              {hourly.map((count, hour) => (
                <div
                  key={hour}
                  className={`flex-1 rounded-t ${hour === peakHour && hasHourly ? 'bg-emerald-600' : 'bg-emerald-300'}`}
                  style={{ height: `${Math.max(2, (count / hourlyMax) * 100)}%` }}
                  title={`${String(hour).padStart(2, '0')}:00 — ${count} ፍተሻ`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
              <span>00</span>
              <span>06</span>
              <span>12</span>
              <span>18</span>
              <span>23</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 mt-3">
            <span className="font-semibold text-slate-800">ከፍተኛ የፍተሻ ሰዓት:</span>
            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {hasHourly ? `${String(peakHour).padStart(2, '0')}:00 - ${String(peakHour + 1).padStart(2, '0')}:00` : 'ገና መረጃ የለም'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
