import { useState, useEffect } from 'react';
import { AlertTriangle, Info, Calendar, Loader2, ArrowRight } from 'lucide-react';
import PriceChart from '../components/PriceChart';

interface RecommendData {
  harga_sekarang: number;
  p7_10: number; p7_50: number; p7_90: number;
  p14_10: number; p14_50: number; p14_90: number;
  keputusan: {
    KgDibeli: number;
    MingguDibeli: number;
    PotensiHemat: number;
    PeluangRugi: number;
    RugiMaksimal: number;
  };
  substitusi?: {
    Rekomendasi: string;
    Hemat: number;
    Alasan: string;
  };
}

function formatIDR(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

export default function Dashboard() {
  const [data, setData] = useState<RecommendData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [komoditas, setKomoditas] = useState('Cabai Rawit Merah');
  const [pemakaian, setPemakaian] = useState(5);
  const [asOf, setAsOf] = useState('2024-06-10');

  const fetchRecommend = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          komoditas,
          provinsi: 'Jawa Barat',
          pemakaian,
          laju_susut: 0.02,
          umur_simpan: 14,
          as_of: asOf
        })
      });
      if (!res.ok) throw new Error('Koneksi ke backend gagal');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommend();
  }, [komoditas, pemakaian, asOf]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Kontrol Input (Glassmorphism) */}
      <section className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-white flex flex-wrap gap-6 items-end relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-200/50 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="space-y-2 flex-1 min-w-[200px] relative z-10">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Pemakaian / Minggu</label>
          <div className="relative">
            <input type="number" value={pemakaian} onChange={e => setPemakaian(Number(e.target.value))} className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all font-medium text-slate-700"/>
            <span className="absolute right-4 top-3.5 text-slate-400 font-medium">kg</span>
          </div>
        </div>
        <div className="space-y-2 flex-1 min-w-[200px] relative z-10">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Komoditas</label>
          <select value={komoditas} onChange={e => setKomoditas(e.target.value)} className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all font-medium text-slate-700 appearance-none">
            <option>Cabai Rawit Merah</option>
            <option>Cabai Rawit Hijau</option>
            <option>Cabai Merah Keriting</option>
            <option>Cabai Merah Besar</option>
          </select>
        </div>
        <div className="space-y-2 flex-1 min-w-[200px] relative z-10">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-emerald-600"/> Mesin Waktu (Tanggal)
          </label>
          <input type="date" value={asOf} onChange={e => setAsOf(e.target.value)} className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all font-medium text-slate-700"/>
        </div>
      </section>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-4">
          <AlertTriangle className="w-5 h-5"/> {error}
        </div>
      )}

      {loading && !data && (
        <div className="flex justify-center items-center py-20 text-emerald-600 gap-3">
          <Loader2 className="w-6 h-6 animate-spin" /> Menghitung skenario stok optimal...
        </div>
      )}

      {data && (
        <section className={`space-y-6 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
          
          {/* Sinyal Substitusi */}
          {data.substitusi && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 p-6 rounded-3xl flex items-start gap-4 shadow-sm animate-in zoom-in-95 duration-500">
              <div className="bg-amber-100 p-2 rounded-full">
                <Info className="w-6 h-6 text-amber-600 shrink-0" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 text-lg flex items-center gap-2">
                  Pertimbangkan Beralih ke {data.substitusi.Rekomendasi}
                </h3>
                <p className="text-amber-800 mt-1">{data.substitusi.Alasan}. Penghematan potensial: <span className="font-bold px-2 py-0.5 bg-amber-200/50 rounded">{formatIDR(data.substitusi.Hemat)}</span> untuk {data.keputusan.KgDibeli} kg.</p>
                <p className="text-amber-700/70 text-xs mt-3 uppercase tracking-wider font-semibold">Tergantung standar resep dapur Anda</p>
              </div>
            </div>
          )}

          {/* Kartu Utama & Chart Grid */}
          <div className="grid md:grid-cols-5 gap-6">
            
            {/* Kartu Keputusan */}
            <div className="md:col-span-3 bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-8 rounded-[2rem] shadow-xl shadow-emerald-900/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
              
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-emerald-950/50 border border-emerald-700/50 rounded-full text-emerald-200 text-xs font-bold tracking-widest uppercase mb-4">
                  Rekomendasi L3
                </span>
                <h2 className="text-5xl font-black mb-3 tracking-tight">Beli {data.keputusan.KgDibeli} <span className="text-3xl text-emerald-300 font-bold">kg hari ini</span></h2>
                <p className="text-emerald-100/80 text-lg font-medium flex items-center gap-2">
                  <ArrowRight className="w-5 h-5" /> Mengcover persediaan {data.keputusan.MingguDibeli} minggu ke depan.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-10">
                  <div className="bg-emerald-950/40 p-5 rounded-2xl border border-emerald-700/30 backdrop-blur-sm">
                    <div className="text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">Hemat vs Menimbun</div>
                    <div className="text-3xl font-bold text-white">{formatIDR(data.keputusan.PotensiHemat)}</div>
                  </div>
                  <div className="bg-emerald-950/40 p-5 rounded-2xl border border-emerald-700/30 backdrop-blur-sm">
                    <div className="text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">Risiko meleset</div>
                    <div className="text-3xl font-bold text-white flex items-baseline gap-2">
                      {Math.round(data.keputusan.PeluangRugi * 100)}% 
                      <span className="text-sm font-medium text-emerald-400/80 tracking-wide">/ {formatIDR(data.keputusan.RugiMaksimal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grafik Visualisasi */}
            <div className="md:col-span-2 flex flex-col justify-between gap-6">
              <PriceChart 
                currentPrice={data.harga_sekarang}
                p7_10={data.p7_10} p7_50={data.p7_50} p7_90={data.p7_90}
                p14_10={data.p14_10} p14_50={data.p14_50} p14_90={data.p14_90}
              />
              
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-500 font-medium text-sm">Harga Historis Acuan</span>
                  <span className="font-bold text-slate-900 text-lg">{formatIDR(data.harga_sekarang)} <span className="text-sm font-normal text-slate-400">/ kg</span></span>
                </div>
              </div>
            </div>

          </div>
        </section>
      )}
    </div>
  );
}
