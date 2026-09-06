import { useState, useEffect } from 'react';
import { Calculator, AlertTriangle, ArrowRight, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WasteSimulator() {
  const [weight, setWeight] = useState<number>(10);
  const [storage, setStorage] = useState<string>('room');
  const [days, setDays] = useState<number>(7);
  const [results, setResults] = useState<any>(null);
  const [, setLoading] = useState(false);

  const calculateWaste = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/v1/public/simulate-waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity_id: "chili_rawit_red",
          weight_kg: weight,
          storage_method: storage,
          duration_days: days
        })
      });
      if (res.ok) {
        const json = await res.json();
        setResults(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce simulation calls
    const timeoutId = setTimeout(() => {
      calculateWaste();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [weight, storage, days]);

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden mt-8">
      <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2"><Calculator className="w-5 h-5 text-emerald-500" /> Simulator Kerugian Dapur (Interaktif)</h3>
        <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-400">v2.0.1</span>
      </div>
      
      <div className="grid md:grid-cols-2">
        {/* Controls */}
        <div className="p-6 bg-slate-50 border-r border-slate-200">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Bobot Belanja: {weight} kg</label>
              <input type="range" min="1" max="30" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full accent-emerald-600" />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Lama Penyimpanan: {days} Hari</label>
              <input type="range" min="1" max="21" value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-full accent-emerald-600" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Metode Penyimpanan Dapur</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-3 border rounded bg-white cursor-pointer hover:border-emerald-500 transition-colors">
                  <input type="radio" name="storage" value="room" checked={storage === 'room'} onChange={(e) => setStorage(e.target.value)} className="accent-emerald-600" />
                  <span className="text-sm font-semibold text-slate-700">Suhu Ruang Terbuka</span>
                </label>
                <label className="flex items-center gap-2 p-3 border rounded bg-white cursor-pointer hover:border-emerald-500 transition-colors">
                  <input type="radio" name="storage" value="chiller" checked={storage === 'chiller'} onChange={(e) => setStorage(e.target.value)} className="accent-emerald-600" />
                  <span className="text-sm font-semibold text-slate-700">Kulkas / Chiller</span>
                </label>
                <label className="flex items-center gap-2 p-3 border rounded bg-white cursor-pointer hover:border-emerald-500 transition-colors">
                  <input type="radio" name="storage" value="airtight" checked={storage === 'airtight'} onChange={(e) => setStorage(e.target.value)} className="accent-emerald-600" />
                  <span className="text-sm font-semibold text-slate-700">Wadah Kedap Udara + Tisu</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Visualizer */}
        <div className="p-6 flex flex-col justify-center">
          {results ? (
            <div className="space-y-6">
              <div className="flex gap-4 items-end justify-center h-40">
                <div className="w-16 bg-slate-200 rounded-t-sm relative flex items-end justify-center h-full">
                  <div className="w-full bg-emerald-600 absolute bottom-0 rounded-t-sm transition-all duration-500" style={{ height: '100%' }}></div>
                  <span className="relative z-10 font-bold text-white mb-2 text-xs">{results.initial_weight_kg} kg</span>
                  <div className="absolute -bottom-6 text-xs font-bold text-slate-500 text-center w-24">Beli Awal</div>
                </div>
                
                <div className="flex items-center justify-center pb-8 px-2">
                  <ArrowRight className="w-5 h-5 text-slate-300" />
                </div>

                <div className="w-16 bg-red-100 rounded-t-sm relative flex flex-col items-center justify-end h-full overflow-hidden border border-red-200">
                  <div className="w-full bg-emerald-500 absolute bottom-0 transition-all duration-500" style={{ height: `${(results.usable_weight_kg / results.initial_weight_kg) * 100}%` }}></div>
                  
                  {/* Waste hatched area */}
                  <div className="w-full bg-red-500 absolute top-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#ef4444_5px,#ef4444_10px)] transition-all duration-500" style={{ height: `${(results.waste_loss_kg / results.initial_weight_kg) * 100}%` }}></div>
                  
                  <span className="relative z-10 font-bold text-white mb-2 text-xs drop-shadow-md">{results.usable_weight_kg.toFixed(1)} kg</span>
                  <div className="absolute -bottom-6 text-xs font-bold text-slate-500 text-center w-24">Sisa Layak</div>
                </div>
              </div>

              <div className="pt-8">
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Kerugian Uang Kas</p>
                  <div className="text-3xl font-black text-red-700 font-mono tracking-tighter">
                    {formatIDR(results.cash_loss_idr)}
                  </div>
                  <p className="text-xs text-red-500 mt-2 font-medium flex items-center justify-center gap-1">
                    <ArrowDown className="w-3 h-3" /> {results.waste_loss_kg.toFixed(2)} kg bahan terbuang sia-sia
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded border border-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-amber-800 font-semibold leading-relaxed">
                    Untuk menutupi kerugian susut ini, harga pasar {days} hari lagi harus melonjak minimal <span className="font-bold text-amber-900 bg-amber-200/50 px-1 rounded">+{results.breakeven_price_hike_required_pct.toFixed(1)}%</span>. Probabilitas historis lonjakan sebesar itu hanya {results.historical_spike_probability_pct.toFixed(1)}%.
                  </p>
                </div>
              </div>

              <Link to="/login" className="w-full block text-center bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded shadow-sm transition-colors text-sm">
                Kunci Parameter & Daftar Usaha
              </Link>
            </div>
          ) : (
             <div className="flex justify-center items-center h-full text-slate-400 text-sm font-medium">
               Memuat kalkulasi...
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
