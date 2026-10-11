import React, { useState } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Activity, 
  Calendar, 
  Layers, 
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface ErpChartsProps {
  totalFleet: number;
  activeFleet: number;
  expiredFleet: number;
  totalFinesETB: number;
}

export const ErpCharts: React.FC<ErpChartsProps> = ({
  totalFleet,
  activeFleet,
  expiredFleet,
  totalFinesETB,
}) => {
  const [activeTimeframe, setActiveTimeframe] = useState<'7d' | '30d' | '12m'>('7d');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; title: string; val: string } | null>(null);

  // 1. Monthly Inspection Trend Data (12 months)
  const monthlyData = [
    { month: 'መስከረም', inspections: 240, compliant: 215, expired: 25 },
    { month: 'ጥቅምት', inspections: 280, compliant: 250, expired: 30 },
    { month: 'ኅዳር', inspections: 310, compliant: 285, expired: 25 },
    { month: 'ታኅሣሥ', inspections: 350, compliant: 315, expired: 35 },
    { month: 'ጥር', inspections: 410, compliant: 370, expired: 40 },
    { month: 'የካቲት', inspections: 390, compliant: 355, expired: 35 },
    { month: 'መጋቢት', inspections: 440, compliant: 405, expired: 35 },
    { month: 'ሚያዝያ', inspections: 480, compliant: 445, expired: 35 },
    { month: 'ግንቦት', inspections: 520, compliant: 480, expired: 40 },
    { month: 'ሰኔ', inspections: 560, compliant: 515, expired: 45 },
    { month: 'ሐምሌ', inspections: 510, compliant: 470, expired: 40 },
    { month: 'ነሐሴ', inspections: 590, compliant: 545, expired: 45 },
  ];

  // 2. Weekly Fines & Citations Bar Data (ETB)
  const weeklyFines = [
    { day: 'ሰኞ (Mon)', amount: 14500, count: 12 },
    { day: 'ማክሰኞ (Tue)', amount: 18200, count: 15 },
    { day: 'ረቡዕ (Wed)', amount: 12800, count: 9 },
    { day: 'ሐሙስ (Thu)', amount: 21500, count: 18 },
    { day: 'አርብ (Fri)', amount: 26400, count: 22 },
    { day: 'ቅዳሜ (Sat)', amount: 31000, count: 26 },
    { day: 'እሑድ (Sun)', amount: 19500, count: 14 },
  ];
  const maxWeeklyFine = Math.max(...weeklyFines.map(w => w.amount));

  // 3. Associations Donut Distribution
  const associations = [
    { name: 'ፋሲል ማህበር (Fasil)', share: 42, count: Math.round(totalFleet * 0.42) || 420, color: '#2563eb' },
    { name: 'አዘዞ ማህበር (Azezo)', share: 28, count: Math.round(totalFleet * 0.28) || 280, color: '#059669' },
    { name: 'ማራኪ ማህበር (Maraki)', share: 18, count: Math.round(totalFleet * 0.18) || 180, color: '#d97706' },
    { name: 'አንገረብ ማህበር (Angereb)', share: 12, count: Math.round(totalFleet * 0.12) || 120, color: '#7c3aed' },
  ];

  // 4. City Zones Traffic Enforcement Density
  const zoneDensity = [
    { zone: 'ዞን 1: አራዳ - ፒያሳ - ፋሲል ግቢ', activeBajajs: 480, checkpoints: 4, trafficLevel: 'ከፍተኛ (High)', percent: 88, color: 'bg-blue-600' },
    { zone: 'ዞን 2: ፒያሳ - አዘዞ - ጎንደር ኤርፖርት', activeBajajs: 340, checkpoints: 3, trafficLevel: 'መካከለኛ (Medium)', percent: 65, color: 'bg-emerald-600' },
    { zone: 'ዞን 3: ማራኪ ዩኒቨርሲቲ - ሾንቃ - ቀበሌ 18', activeBajajs: 290, checkpoints: 3, trafficLevel: 'መካከለኛ (Medium)', percent: 55, color: 'bg-amber-600' },
    { zone: 'ዞን 4: አንገረብ - ቸቸላ - ቀበሌ 07', activeBajajs: 190, checkpoints: 2, trafficLevel: 'ዝቅተኛ (Normal)', percent: 38, color: 'bg-purple-600' },
  ];

  // 5. Hourly Traffic Rush Curve (06:00 to 21:00)
  const hourlyFlow = [
    { hour: '06:00', flow: 35 },
    { hour: '07:30', flow: 95 }, // Morning Rush
    { hour: '09:00', flow: 82 },
    { hour: '11:00', flow: 64 },
    { hour: '12:30', flow: 88 }, // Midday Rush
    { hour: '14:30', flow: 70 },
    { hour: '17:00', flow: 98 }, // Evening Peak
    { hour: '19:00', flow: 85 },
    { hour: '21:00', flow: 42 },
  ];

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* SECTION 1: DUAL PRIMARY GRAPHS (AREA COMPLIANCE TREND + WEEKLY FINES BAR) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRAPH 1: Area Trend (2 spans) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  የወርሃዊ የፍተሻ እና የተገዢነት አዝማሚያ (Compliance & Inspections Trend)
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                በጎንደር ከተማ መንገድ ላይ የተደረጉ ፍተሻዎች እና የፀደቁ ሕጋዊ ፈቃዶች ዕድገት
              </p>
            </div>

            {/* Timeframe Filter Buttons */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTimeframe('7d')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  activeTimeframe === '7d' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                7 ቀናት
              </button>
              <button
                onClick={() => setActiveTimeframe('30d')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  activeTimeframe === '30d' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                30 ቀናት
              </button>
              <button
                onClick={() => setActiveTimeframe('12m')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  activeTimeframe === '12m' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ዓመታዊ (12M)
              </button>
            </div>
          </div>

          {/* SVG Area Line Chart */}
          <div className="relative h-64 w-full">
            <svg viewBox="0 0 700 220" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="areaGradientBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="areaGradientGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
              <line x1="40" y1="20" x2="680" y2="20" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="30" y="24" fontSize="9" fill="#94a3b8" textAnchor="end">600</text>
              
              <line x1="40" y1="70" x2="680" y2="70" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="30" y="74" fontSize="9" fill="#94a3b8" textAnchor="end">450</text>

              <line x1="40" y1="120" x2="680" y2="120" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="30" y="124" fontSize="9" fill="#94a3b8" textAnchor="end">300</text>

              <line x1="40" y1="170" x2="680" y2="170" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="30" y="174" fontSize="9" fill="#94a3b8" textAnchor="end">150</text>

              <line x1="40" y1="200" x2="680" y2="200" stroke="#e2e8f0" strokeWidth="1.5" />

              {/* Area 1: Total Inspections */}
              <polygon
                points="
                  50,140 100,128 155,118 210,105 265,85 320,92 375,76 430,64 485,52 540,40 595,55 650,28
                  650,200 50,200
                "
                fill="url(#areaGradientBlue)"
              />

              {/* Line 1: Blue (Total Inspections) */}
              <polyline
                points="50,140 100,128 155,118 210,105 265,85 320,92 375,76 430,64 485,52 540,40 595,55 650,28"
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Area 2: Compliant Active */}
              <polygon
                points="
                  50,150 100,138 155,127 210,116 265,98 320,104 375,88 430,75 485,64 540,52 595,68 650,42
                  650,200 50,200
                "
                fill="url(#areaGradientGreen)"
              />

              {/* Line 2: Green (Compliant Active) */}
              <polyline
                points="50,150 100,138 155,127 210,116 265,98 320,104 375,88 430,75 485,64 540,52 595,68 650,42"
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Point Circles on Blue Line */}
              {[
                { x: 50, y: 140, m: 'መስከረም', val: '240' },
                { x: 100, y: 128, m: 'ጥቅምት', val: '280' },
                { x: 155, y: 118, m: 'ኅዳር', val: '310' },
                { x: 210, y: 105, m: 'ታኅሣሥ', val: '350' },
                { x: 265, y: 85, m: 'ጥር', val: '410' },
                { x: 320, y: 92, m: 'የካቲት', val: '390' },
                { x: 375, y: 76, m: 'መጋቢት', val: '440' },
                { x: 430, y: 64, m: 'ሚያዝያ', val: '480' },
                { x: 485, y: 52, m: 'ግንቦት', val: '520' },
                { x: 540, y: 40, m: 'ሰኔ', val: '560' },
                { x: 595, y: 55, m: 'ሐምሌ', val: '510' },
                { x: 650, y: 28, m: 'ነሐሴ', val: '590' },
              ].map((pt) => (
                <g key={pt.m}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4.5"
                    fill="#ffffff"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    className="cursor-pointer hover:r-6 transition-all"
                  />
                  <text
                    x={pt.x}
                    y="214"
                    fontSize="9"
                    fill="#64748b"
                    textAnchor="middle"
                    fontWeight="500"
                  >
                    {pt.m}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Graph Legend */}
          <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
                <span>ጠቅላላ ፍተሻዎች (Inspections: 590/ወር)</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
                <span>ሕጋዊ ተገዢዎች (Compliant: 92.4%)</span>
              </div>
            </div>

            <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              +24.6% የፈቃድ ተገዢነት ዕድገት
            </div>
          </div>
        </div>

        {/* GRAPH 2: Weekly Fines & Citations Revenue Bar Chart (1 span) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  የሳምንቱ ቅጣት ገቢ (Weekly Fines)
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                ETB ብር
              </span>
            </div>

            {/* Total Highlight */}
            <div className="mb-4">
              <div className="text-[11px] text-slate-500 font-medium">የዚህ ሳምንት አጠቃላይ ቅጣት:</div>
              <div className="text-2xl font-black text-purple-900 font-mono">
                144,400 ብር
              </div>
            </div>

            {/* Bar Chart Container */}
            <div className="space-y-3">
              {weeklyFines.map((day) => {
                const barWidth = Math.round((day.amount / maxWeeklyFine) * 100);
                return (
                  <div key={day.day} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{day.day}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">({day.count} ጥሰቶች)</span>
                        <span className="font-mono font-bold text-purple-900">
                          {day.amount.toLocaleString()} ብር
                        </span>
                      </div>
                    </div>
                    {/* Animated Bar */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between mt-4">
            <span>ከፍተኛ ቅጣት፡ ቅዳሜ (31,000 ብር)</span>
            <span className="text-emerald-700 font-bold">100% በመንግስት ገቢ</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: DONUT CHART + ZONES DENSITY + PEAK HOURS RUSH WAVE            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* GRAPH 3: Associations Quota Donut Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <PieChartIcon size={18} className="text-[#0C355B]" />
              <h3 className="text-sm font-bold text-slate-900">
                የማህበራት የኮታ ድርሻ (Fleet Share)
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-500">4 ማህበራት</span>
          </div>

          {/* SVG Donut */}
          <div className="flex items-center justify-center my-2 relative">
            <svg viewBox="0 0 160 160" className="w-40 h-40 transform -rotate-90">
              {/* Segment 1: Fasil (42%) */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#2563eb"
                strokeWidth="24"
                strokeDasharray={`${(42 * 377) / 100} 377`}
                strokeDashoffset="0"
              />
              {/* Segment 2: Azezo (28%) */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#059669"
                strokeWidth="24"
                strokeDasharray={`${(28 * 377) / 100} 377`}
                strokeDashoffset={`-${(42 * 377) / 100}`}
              />
              {/* Segment 3: Maraki (18%) */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#d97706"
                strokeWidth="24"
                strokeDasharray={`${(18 * 377) / 100} 377`}
                strokeDashoffset={`-${((42 + 28) * 377) / 100}`}
              />
              {/* Segment 4: Angereb (12%) */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#7c3aed"
                strokeWidth="24"
                strokeDasharray={`${(12 * 377) / 100} 377`}
                strokeDashoffset={`-${((42 + 28 + 18) * 377) / 100}`}
              />
            </svg>
            {/* Center Label */}
            <div className="absolute text-center pointer-events-none">
              <span className="text-xl font-black text-[#0C355B] font-mono block leading-none">
                {totalFleet}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">ባጃጆች</span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="space-y-2 mt-4 text-xs">
            {associations.map((a) => (
              <div key={a.name} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                  <span className="font-semibold text-slate-800">{a.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-slate-400 text-[10px]">{a.count} ባጃጅ</span>
                  <span className="font-bold text-slate-900">{a.share}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GRAPH 4: City Zones Traffic & Enforcement Density */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                የዞኖች የፍተሻ ጥግግት (Zone Density)
              </h3>
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              4 የከተማ ዞኖች
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {zoneDensity.map((zd) => (
              <div key={zd.zone} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-900 text-[11px] truncate max-w-[200px]">{zd.zone}</span>
                  <span className="text-[10px] font-bold text-slate-600">{zd.trafficLevel}</span>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${zd.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${zd.percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{zd.checkpoints} ንቁ ኬላዎች</span>
                  <span className="font-mono font-bold text-slate-800">{zd.activeBajajs} ባጃጆች በስራ ላይ</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GRAPH 5: Peak Hours Checkpoint Traffic Wave */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  የሰዓታት ትራፊክ ፍሰት (Peak Traffic Hours)
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Live Wave
              </span>
            </div>

            {/* Description */}
            <p className="text-[11px] text-slate-500 mb-3">
              በጎንደር ጎዳናዎች ላይ የባጃጅ ትራንስፖርት ንቅናቄ በሰዓታት ንፅፅር
            </p>

            {/* SVG Wave Curve */}
            <div className="h-36 w-full">
              <svg viewBox="0 0 320 120" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal reference */}
                <line x1="10" y1="100" x2="310" y2="100" stroke="#e2e8f0" strokeWidth="1" />

                {/* Filled Area */}
                <path
                  d="
                    M 15 90
                    C 35 30, 45 20, 60 25
                    C 80 35, 100 65, 120 60
                    C 140 50, 160 30, 180 35
                    C 200 45, 220 15, 240 18
                    C 260 25, 280 60, 305 85
                    L 305 100 L 15 100 Z
                  "
                  fill="url(#waveGradient)"
                />

                {/* Stroke Line */}
                <path
                  d="
                    M 15 90
                    C 35 30, 45 20, 60 25
                    C 80 35, 100 65, 120 60
                    C 140 50, 160 30, 180 35
                    C 200 45, 220 15, 240 18
                    C 260 25, 280 60, 305 85
                  "
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Peak Points */}
                <circle cx="60" cy="25" r="4.5" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
                <circle cx="240" cy="18" r="4.5" fill="#ffffff" stroke="#10b981" strokeWidth="2" />

                {/* Labels */}
                <text x="15" y="114" fontSize="8" fill="#94a3b8">06:00</text>
                <text x="60" y="15" fontSize="8" fill="#059669" fontWeight="bold" textAnchor="middle">08:00 (ጡፈት)</text>
                <text x="160" y="114" fontSize="8" fill="#94a3b8" textAnchor="middle">13:00</text>
                <text x="240" y="10" fontSize="8" fill="#059669" fontWeight="bold" textAnchor="middle">17:30 (ከፍተኛ)</text>
                <text x="305" y="114" fontSize="8" fill="#94a3b8" textAnchor="end">21:00</text>
              </svg>
            </div>
          </div>

          {/* Rush hours callout */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span className="font-semibold text-slate-800">የከፍተኛ ጡፈት ሰዓታት:</span>
            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ጠዋት 07:30 - 09:00 & ምሽት 17:00 - 19:30
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
