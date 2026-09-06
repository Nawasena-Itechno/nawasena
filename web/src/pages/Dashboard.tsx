import { useState, useEffect } from 'react';
import { AlertTriangle, Info, Loader2, ArrowRight, TrendingUp, Activity, BookOpen, LogOut, Database, User, CheckCircle2 } from 'lucide-react';
import PriceChart from '../components/PriceChart';
import WasteSimulator from '../components/public/WasteSimulator';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

function formatIDR(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('decision');
  const [profile, setProfile] = useState<any>(null);
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [asOf, setAsOf] = useState('2024-06-10');
  const [komoditas, setKomoditas] = useState('Cabai Rawit Merah');

  useEffect(() => {
    const fetchProfileAndData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profErr) {
          console.warn("Profile not found in DB, using defaults for demo");
          setProfile({ business_name: 'Usaha Demo', weekly_consumption_kg: 10, storage_method: 'room', daily_decay_rate: 0.03, fnb_category: 'Warteg' });
        } else {
          setProfile(prof);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndData();
  }, [navigate]);

  useEffect(() => {
    if (profile) {
      fetchRecommend();
    }
  }, [profile, komoditas, asOf]);

  const fetchRecommend = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/v1/umkm/procurement-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          komoditas,
          provinsi: 'Jawa Barat',
          pemakaian: profile.weekly_consumption_kg,
          laju_susut: profile.daily_decay_rate,
          umur_simpan: profile.storage_method === 'airtight' ? 21 : profile.storage_method === 'chiller' ? 14 : 7,
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!profile) {
    return <div className="min-h-screen flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-emerald-500" />
            <span className="text-xl font-bold text-white tracking-tight">NAWASENA</span>
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">UMKM Workspace</p>
        </div>
        
        <div className="p-4 border-b border-slate-800 bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-white uppercase">
              {profile.business_name.substring(0, 2)}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{profile.business_name}</p>
              <p className="text-xs text-slate-400">{profile.fnb_category}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button onClick={() => setActiveTab('decision')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'decision' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Activity className="w-4 h-4" /> Rekomendasi Belanja
          </button>
          <button onClick={() => setActiveTab('radar')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'radar' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
            <TrendingUp className="w-4 h-4" /> Radar & Anggaran
          </button>
          <button onClick={() => setActiveTab('substitusi')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'substitusi' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Info className="w-4 h-4" /> Sinyal Substitusi
          </button>
          <button onClick={() => setActiveTab('susut')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'susut' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Activity className="w-4 h-4" /> Solusi Susut
          </button>
          <button onClick={() => setActiveTab('profil')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'profil' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
            <User className="w-4 h-4" /> Profil & Dapur
          </button>
          <a href="/metodologi" target="_blank" rel="noreferrer" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors hover:bg-slate-800 hover:text-white">
            <BookOpen className="w-4 h-4" /> Rapor Metodologi
          </a>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold text-slate-400 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 md:p-10">
        
        {/* Global Control (Mesin Waktu) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
             <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Komoditas</label>
              <select value={komoditas} onChange={e => setKomoditas(e.target.value)} className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-sm font-semibold mt-1 outline-none focus:border-emerald-500">
                <option>Cabai Rawit Merah</option>
                <option>Cabai Rawit Hijau</option>
                <option>Cabai Merah Keriting</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Simulator Waktu</label>
              <input type="date" value={asOf} onChange={e => setAsOf(e.target.value)} className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-sm font-semibold mt-1 outline-none focus:border-emerald-500"/>
            </div>
          </div>
          {loading && <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3 mb-8">
            <AlertTriangle className="w-5 h-5"/> {error}
          </div>
        )}

        {/* TAB 1: Rekomendasi Belanja */}
        {activeTab === 'decision' && data && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-emerald-900 text-white p-8 rounded-2xl shadow-xl border border-emerald-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-emerald-950/50 border border-emerald-700/50 rounded text-emerald-200 text-xs font-bold tracking-widest uppercase mb-4">
                  Keputusan Optimal
                </span>
                <h2 className="text-4xl font-black mb-3 tracking-tight">Beli {data.keputusan.KgDibeli} <span className="text-2xl text-emerald-400 font-bold">kg hari ini</span></h2>
                <p className="text-emerald-100/80 text-lg font-medium flex items-center gap-2">
                  <ArrowRight className="w-5 h-5" /> Mengcover persediaan {data.keputusan.MingguDibeli} minggu ke depan.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  <div className="bg-emerald-950/40 p-5 rounded-xl border border-emerald-700/30">
                    <div className="text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">Potensi Penghematan</div>
                    <div className="text-3xl font-bold text-white">{formatIDR(data.keputusan.PotensiHemat)}</div>
                    <p className="text-xs text-emerald-200/50 mt-1">Dibandingkan memborong stok 2 minggu buta.</p>
                  </div>
                  <div className="bg-emerald-950/40 p-5 rounded-xl border border-emerald-700/30">
                    <div className="text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">Risiko Meleset (Kerugian Max)</div>
                    <div className="text-3xl font-bold text-white flex items-baseline gap-2">
                      {Math.round(data.keputusan.PeluangRugi * 100)}% 
                      <span className="text-sm font-medium text-red-400">/ {formatIDR(data.keputusan.RugiMaksimal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Dasar Perhitungan */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4 text-slate-400"/> Dasar Perhitungan Terbuka</h3>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Harga Pasar Hari Ini</p>
                  <p className="font-bold text-slate-800 text-lg">{formatIDR(data.harga_sekarang)} / kg</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Kebutuhan Kotor {data.keputusan.MingguDibeli} Minggu</p>
                  <p className="font-bold text-slate-800 text-lg">{data.keputusan.KgDibeli} kg <span className="text-xs font-normal text-slate-400">(termasuk margin susut)</span></p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Laju Susut Dapur Anda</p>
                  <p className="font-bold text-slate-800 text-lg">{(profile.daily_decay_rate * 100).toFixed(1)}% / hari</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Radar Harga */}
        {activeTab === 'radar' && data && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Radar Harga & Anggaran</h2>
            <PriceChart 
              currentPrice={data.harga_sekarang}
              p7_10={data.p7_10} p7_50={data.p7_50} p7_90={data.p7_90}
              p14_10={data.p14_10} p14_50={data.p14_50} p14_90={data.p14_90}
            />
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 mt-6">
               <h3 className="font-bold text-emerald-900 mb-2">Simulasi Anggaran Bulanan</h3>
               <p className="text-emerald-700 text-sm mb-4">Perkiraan kas yang harus disiapkan untuk 4 minggu ke depan berdasarkan rentang probabilitas harga (P50 - P90).</p>
               <div className="flex gap-4 items-baseline">
                 <div className="text-3xl font-black text-emerald-800">{formatIDR((profile.weekly_consumption_kg * 4) * data.p14_50)}</div>
                 <div className="text-slate-500">s/d</div>
                 <div className="text-xl font-bold text-red-600">{formatIDR((profile.weekly_consumption_kg * 4) * data.p14_90)}</div>
               </div>
            </div>
          </div>
        )}

        {/* TAB 3: Substitusi */}
        {activeTab === 'substitusi' && data && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Sinyal Alih Varian</h2>
            {data.substitusi ? (
              <div className="bg-amber-50 border border-amber-200 p-8 rounded-2xl flex flex-col items-center text-center shadow-sm">
                <div className="bg-amber-100 p-3 rounded-full mb-4">
                  <Info className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="font-bold text-amber-900 text-2xl mb-2">
                  Pertimbangkan Beralih ke {data.substitusi.Rekomendasi}
                </h3>
                <p className="text-amber-800 mb-6 max-w-lg">{data.substitusi.Alasan}</p>
                <div className="bg-white px-6 py-4 rounded-xl border border-amber-100 shadow-sm">
                   <p className="text-xs text-amber-600 font-bold uppercase tracking-widest mb-1">Penghematan Potensial</p>
                   <p className="text-3xl font-black text-amber-600">{formatIDR(data.substitusi.Hemat)}</p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-100 border border-slate-200 p-12 rounded-2xl flex flex-col items-center text-center">
                 <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
                 <h3 className="font-bold text-slate-800 text-xl mb-2">Tidak Ada Anomali Harga</h3>
                 <p className="text-slate-500">Varian yang Anda pilih saat ini sudah berada di rasio harga yang wajar terhadap alternatifnya.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Solusi Susut */}
        {activeTab === 'susut' && (
          <div className="animate-in fade-in zoom-in-95 duration-300 max-w-4xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Solusi Kebusukan & Pengolahan</h2>
            <p className="text-slate-600 mb-8">
              Gunakan simulator di bawah ini untuk melihat seberapa cepat nilai uang Anda menyusut akibat metode penyimpanan yang kurang tepat. Jika Anda memiliki kelebihan pasokan yang terancam busuk, pertimbangkan solusi pengolahan alternatif.
            </p>
            <WasteSimulator />
            
            <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Katalog Solusi Mitigasi (Pasokan Berlebih)</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                  <h4 className="font-bold text-slate-800 mb-2">Cabai Beku (Freezer)</h4>
                  <p className="text-sm text-slate-600">Simpan cabai dalam kondisi kering di freezer. Umur simpan dapat diperpanjang hingga 1-2 bulan untuk keperluan bumbu halus.</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                  <h4 className="font-bold text-slate-800 mb-2">Pasta Cabai / Chili Oil</h4>
                  <p className="text-sm text-slate-600">Haluskan cabai dan masak dengan minyak berlebih. Umur simpan 3-6 bulan pada suhu ruang tertutup.</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                  <h4 className="font-bold text-slate-800 mb-2">Cabai Kering (Dehidrasi)</h4>
                  <p className="text-sm text-slate-600">Jemur atau panggang cabai hingga kadar air habis. Tahan 6-12 bulan, sangat cocok untuk kaldu dan bubuk tabur.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Profil */}
        {activeTab === 'profil' && profile && (
          <div className="animate-in fade-in zoom-in-95 duration-300 max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Profil Usaha & Parameter Dapur</h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                 <h3 className="font-bold text-slate-800">Identitas</h3>
               </div>
               <div className="p-6 grid grid-cols-2 gap-6">
                 <div>
                   <p className="text-xs text-slate-400 font-bold uppercase mb-1">Nama Usaha</p>
                   <p className="font-semibold text-slate-700">{profile.business_name}</p>
                 </div>
                 <div>
                   <p className="text-xs text-slate-400 font-bold uppercase mb-1">Kategori F&B</p>
                   <p className="font-semibold text-slate-700">{profile.fnb_category}</p>
                 </div>
                 <div className="col-span-2">
                   <p className="text-xs text-slate-400 font-bold uppercase mb-1">Pasar Acuan</p>
                   <p className="font-semibold text-slate-700">{profile.reference_market || 'Pasar Tradisional'}</p>
                 </div>
               </div>

               <div className="px-6 py-4 border-y border-slate-100 bg-slate-50 mt-4">
                 <h3 className="font-bold text-slate-800">Kalibrasi Susut Dapur</h3>
               </div>
               <div className="p-6 grid grid-cols-2 gap-6">
                 <div>
                   <p className="text-xs text-slate-400 font-bold uppercase mb-1">Kebutuhan Rutin</p>
                   <p className="font-semibold text-slate-700">{profile.weekly_consumption_kg} kg / minggu</p>
                 </div>
                 <div>
                   <p className="text-xs text-slate-400 font-bold uppercase mb-1">Laju Susut (Otomatis)</p>
                   <p className="font-semibold text-slate-700">{(profile.daily_decay_rate * 100).toFixed(1)}% / hari</p>
                 </div>
                 <div className="col-span-2">
                   <p className="text-xs text-slate-400 font-bold uppercase mb-1">Metode Simpan</p>
                   <p className="font-semibold text-slate-700 capitalize">{profile.storage_method === 'room' ? 'Suhu Ruang Terbuka' : profile.storage_method === 'chiller' ? 'Kulkas / Chiller' : 'Kedap Udara + Tisu'}</p>
                 </div>
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
