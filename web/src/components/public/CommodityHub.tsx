import { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, Info, Database } from 'lucide-react';

export default function CommodityHub() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Simulasi data untuk MVP (bisa disambungkan ke API nanti jika dibutuhkan multi komoditas)
    setData([
      { id: 'cabe_rawit_merah', name: 'Cabai Rawit Merah', price: 44000, yoy: 14.2, status: 'HIGH', storageDays: 7 },
      { id: 'bawang_merah', name: 'Bawang Merah', price: 32000, yoy: -5.4, status: 'STABLE', storageDays: 21 },
      { id: 'daging_sapi', name: 'Daging Sapi (Paha Belakang)', price: 135000, yoy: 2.1, status: 'STABLE', storageDays: 3 },
      { id: 'telur_ayam', name: 'Telur Ayam Ras', price: 29500, yoy: 8.5, status: 'WARNING', storageDays: 14 },
    ]);
  }, []);

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
      {data.map(item => (
        <div key={item.id} className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer">
          {/* Status Bar */}
          <div className={`h-1.5 w-full ${
            item.status === 'HIGH' ? 'bg-red-500' : 
            item.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'
          }`}></div>
          
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
              {item.status === 'HIGH' && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
            </div>
            
            <div className="mb-4">
              <div className="text-2xl font-black text-slate-900 tracking-tight">{formatIDR(item.price)}</div>
              <div className={`text-xs font-bold flex items-center gap-1 mt-1 ${item.yoy > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                <TrendingUp className={`w-3 h-3 ${item.yoy < 0 ? 'rotate-180' : ''}`} /> 
                {Math.abs(item.yoy)}% YoY (Nasional)
              </div>
            </div>

            <div className="bg-slate-50 p-2 rounded border border-slate-100 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="text-[10px] text-slate-500 leading-tight">
                Masa simpan ideal suhu ruang: <strong className="text-slate-700">{item.storageDays} hari</strong>. Rentan susut.
              </div>
            </div>
          </div>
          
          {/* Hover overlay hint */}
          <div className="absolute inset-0 bg-emerald-900/90 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-4 text-center backdrop-blur-sm">
            <Database className="w-6 h-6 text-emerald-400 mb-2" />
            <p className="text-sm font-bold">Analisis Volatilitas {item.name}</p>
            <p className="text-xs text-emerald-200 mt-1">Data historis PIHPS 2018-2026</p>
          </div>
        </div>
      ))}
    </div>
  );
}
