import { Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ComposedChart, Line } from 'recharts';

interface ChartProps {
  currentPrice: number;
  p7_10: number; p7_50: number; p7_90: number;
  p14_10: number; p14_50: number; p14_90: number;
}

export default function PriceChart({ currentPrice, p7_10, p7_50, p7_90, p14_10, p14_50, p14_90 }: ChartProps) {
  
  // Interpolasi linear sederhana untuk membuat chart kipas (fan chart) terlihat mulus
  const data = [
    { name: 'Hari 0', p10: currentPrice, p50: currentPrice, p90: currentPrice },
    { name: 'Hari 7', p10: p7_10, p50: p7_50, p90: p7_90 },
    { name: 'Hari 14', p10: p14_10, p50: p14_50, p90: p14_90 },
  ];

  return (
    <div className="h-64 w-full bg-white rounded-2xl border border-emerald-100 p-4 shadow-sm relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10">
        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Proyeksi Risiko Harga</h4>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 30, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f87171" stopOpacity={0.0}/>
            </linearGradient>
            <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#34d399" stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip 
            formatter={(value: any) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          
          {/* Rentang Atas (Risiko Mahal) */}
          <Area type="monotone" dataKey="p90" stroke="none" fillOpacity={1} fill="url(#colorRisk)" name="Batas P90 (Mahal)" />
          {/* Rentang Bawah (Skenario Murah) */}
          <Area type="monotone" dataKey="p10" stroke="none" fillOpacity={1} fill="url(#colorSafe)" name="Batas P10 (Murah)" />
          
          {/* Garis Median */}
          <Line type="monotone" dataKey="p50" stroke="#0f172a" strokeWidth={2} strokeDasharray="5 5" name="Median (P50)" dot={{ r: 4, fill: '#0f172a' }} />
          
          <ReferenceLine x="Hari 0" stroke="#cbd5e1" strokeDasharray="3 3" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
